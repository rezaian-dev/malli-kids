"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "@/lib/toast";
import { CORE_PRODUCTS } from "@/lib/data/products";
import type { Product } from "@/types";
import { sizeForHeightCm } from "@/lib/data/sizing";
import { useStore } from "@/providers/store-provider";
import { parseFaNumber } from "@/lib/digits";
import { compressToDataUrl } from "@/components/ui/image-upload";

export type TryOnPhase = "idle" | "running" | "done" | "error";
export type TryOnCategory = "tops" | "bottoms" | "one-pieces" | "auto";

// Sample models so parents can try instantly.
export const SAMPLE_MODELS = CORE_PRODUCTS.slice(0, 4).map((p) => p.img);

// One POST, no client polling: the server runs the bounded engine poll.
// 150s backstop covers the route's 120s maxDuration plus proxy time.
const REQUEST_TIMEOUT_MS = 150_000;

/** Guess the garment category from catalog copy. Ambiguous items stay auto:
 *  a wrong forced category is worse than no hint. */
function garmentCategoryFor(p: Product): TryOnCategory {
  const n = p.name;
  if (/سرهمی|توتو/.test(n)) return "one-pieces";
  if (/^ست /.test(n)) return "auto";
  if (/پیراهن.*(مجلسی|پرنسسی|پولک)/.test(n)) return "one-pieces";
  if (/شلوار|دامن/.test(n)) return "bottoms";
  if (/پالتو|کاپشن|کت |سوئیشرت|هودی|تیشرت|بلوز|کاپیش/.test(n)) return "tops";
  return "auto";
}

/** Studio state + the AI call. Loop-free by construction: runTryOn issues
 *  exactly one fetch, guarded by a ref, cancellable, aborted on unmount. */
export function useTryOn() {
  const { user, setAuthOpen } = useStore();
  const [person, setPerson] = useState<string | null>(null); // Data URL or catalog path.
  const [garment, setGarment] = useState(0);
  // Prefill from the shopper's child profile when available.
  const [height, setHeight] = useState(() => user?.childHeightCm || "104");
  const [phase, setPhase] = useState<TryOnPhase>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // In-flight request: the one source of truth for "already running".
  const flightRef = useRef<AbortController | null>(null);

  // Abort on unmount: no dangling request, no late setState.
  useEffect(() => {
    return () => {
      flightRef.current?.abort();
      flightRef.current = null;
    };
  }, []);

  const size = useMemo(
    () => sizeForHeightCm(parseFaNumber(height) || 0),
    [height],
  );

  function pickSample(src: string) {
    if (flightRef.current) return;
    setPerson(src);
    setResult(null);
    setEngine(null);
    setPhase("idle");
  }

  async function onUpload(file: File) {
    if (!file.type.startsWith("image/"))
      return toast.warning("فقط فایل تصویری (JPG/PNG)");
    if (flightRef.current) return;
    // Shrink on-device first: ~1MB upload, no 413s, clean 1024px frame.
    setCompressing(true);
    try {
      const dataUrl = await compressToDataUrl(file, {
        maxSizeMB: 1,
        maxWidthOrHeight: 1024,
      });
      setPerson(dataUrl);
      setResult(null);
      setEngine(null);
      setPhase("idle");
    } catch {
      toast.error("فشرده‌سازی عکس ناموفق بود؛ عکس دیگری امتحان کنید.");
    } finally {
      setCompressing(false);
    }
  }

  function cancel() {
    // No-op unless a job is in flight.
    if (!flightRef.current) return;
    flightRef.current.abort();
    flightRef.current = null;
    setPhase("idle");
    toast.info("پرو مجازی لغو شد.");
  }

  async function runTryOn() {
    if (!person) return toast.warning("اول یک عکس یا مدل نمونه انتخاب کنید");
    // Guests go to login instead of hitting a raw 401 toast.
    if (!user) {
      setAuthOpen(true);
      toast.warning("برای پرو مجازی اول وارد حساب‌تان شوید");
      return;
    }
    // One job at a time: second taps are no-ops.
    if (flightRef.current) return;

    const ctrl = new AbortController();
    flightRef.current = ctrl;
    const timer = setTimeout(() => ctrl.abort(), REQUEST_TIMEOUT_MS);
    setPhase("running");
    setResult(null);
    setEngine(null);
    try {
      const res = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          modelImage: person,
          garmentImage: CORE_PRODUCTS[garment].img,
          category: garmentCategoryFor(CORE_PRODUCTS[garment]),
        }),
        signal: ctrl.signal,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "شروع پرو مجازی ناموفق بود.");
      if (data.status !== "completed" || !data.image) {
        throw new Error(data.error || "پاسخ نامعتبر از سرویس.");
      }
      setResult(data.image as string);
      setEngine(typeof data.engine === "string" ? data.engine : null);
      setPhase("done");
      toast.success("پرو مجازی آماده شد ✨");
    } catch (e) {
      // Aborts stay quiet (cancel/unmount already handled); a real timeout
      // gets its own message instead of a raw DOMException.
      if (e instanceof DOMException && e.name === "AbortError") {
        if (flightRef.current === ctrl) {
          setPhase("idle");
          toast.error("پاسخ سرویس طول کشید؛ لطفاً دوباره تلاش کنید.");
        }
        return;
      }
      if (flightRef.current === ctrl) {
        setPhase("error");
        toast.error((e as Error).message);
      }
    } finally {
      clearTimeout(timer);
      if (flightRef.current === ctrl) flightRef.current = null;
    }
  }

  return {
    person,
    garment,
    setGarment: (i: number) => {
      if (flightRef.current) return;
      setGarment(i);
    },
    height,
    setHeight,
    size,
    phase,
    result,
    engine,
    compressing,
    fileRef,
    pickSample,
    onUpload,
    runTryOn,
    cancel,
  };
}
