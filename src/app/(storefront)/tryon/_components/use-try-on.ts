"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { CORE_PRODUCTS } from "@/lib/data/products";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export type TryOnPhase = "idle" | "running" | "done" | "error";

// 🧪 Ready-made sample models let parents try the studio instantly.
export const SAMPLE_MODELS = CORE_PRODUCTS.slice(0, 4).map((p) => p.img);

function sizeForHeight(h: number): string {
  const table: [number, string][] = [
    [80, "۸۰"],
    [86, "۸۶"],
    [92, "۹۲"],
    [98, "۹۸"],
    [104, "۱۰۴"],
    [110, "۱۱۰"],
    [116, "۱۱۶"],
  ];
  for (const [max, label] of table) if (h < max) return label;
  return "۱۲۲";
}

/** 🧠 All state and the AI try-on call behind the studio. */
export function useTryOn() {
  const [person, setPerson] = useState<string | null>(null); // 🪶 Data URL or catalog path.
  const [garment, setGarment] = useState(0);
  const [height, setHeight] = useState("104");
  const [phase, setPhase] = useState<TryOnPhase>("idle");
  const [result, setResult] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const size = useMemo(() => sizeForHeight(Number(height) || 0), [height]);

  function pickSample(src: string) {
    setPerson(src);
    setResult(null);
    setPhase("idle");
  }

  function onUpload(file: File) {
    if (!file.type.startsWith("image/"))
      return toast.warning("فقط فایل تصویری (JPG/PNG)");
    const reader = new FileReader();
    reader.onload = () => {
      setPerson(String(reader.result));
      setResult(null);
      setPhase("idle");
    };
    reader.readAsDataURL(file);
  }

  async function runTryOn() {
    if (!person) return toast.warning("اول یک عکس یا مدل نمونه انتخاب کنید");
    setPhase("running");
    setResult(null);
    try {
      const start = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelImage: person,
          garmentImage: CORE_PRODUCTS[garment].img,
        }),
      });
      const started = await start.json();
      if (!start.ok)
        throw new Error(started.error || "شروع پرو مجازی ناموفق بود.");

      // 🔁 Free mode returns an image now; paid mode returns a job id.
      if (started.image) {
        setResult(started.image);
        setPhase("done");
        toast.success("پرو مجازی آماده شد ✨");
        return;
      }
      if (!started.id)
        throw new Error(started.error || "پاسخ نامعتبر از سرویس.");

      const deadline = Date.now() + 90_000;
      while (Date.now() < deadline) {
        await sleep(2000);
        const poll = await fetch(`/api/tryon?id=${started.id}`);
        const state = await poll.json();
        if (state.status === "completed" && state.image) {
          setResult(state.image);
          setPhase("done");
          toast.success("پرو مجازی آماده شد ✨");
          return;
        }
        if (state.status === "failed")
          throw new Error(state.error || "تولید تصویر ناموفق بود.");
      }
      throw new Error("پردازش طولانی شد؛ لطفاً دوباره تلاش کنید.");
    } catch (e) {
      setPhase("error");
      toast.error((e as Error).message);
    }
  }

  return {
    person,
    garment,
    setGarment,
    height,
    setHeight,
    size,
    phase,
    result,
    fileRef,
    pickSample,
    onUpload,
    runTryOn,
  };
}
