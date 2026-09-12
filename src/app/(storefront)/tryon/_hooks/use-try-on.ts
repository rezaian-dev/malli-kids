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

// 🧪 Ready-made sample models let parents try the studio instantly.
export const SAMPLE_MODELS = CORE_PRODUCTS.slice(0, 4).map((p) => p.img);

// ⏱️ The server finishes the whole job in one POST (it polls the AI engine
// itself, bounded — see `src/app/api/tryon/route.ts`), so the browser needs
// no polling loop at all: one request, one generous client-side backstop in
// case the connection itself hangs. 150s > the route's 120s maxDuration.
const REQUEST_TIMEOUT_MS = 150_000;

/** 👗 Hint the engine about the garment shape from the catalog copy.
 *  Conservative by design: anything ambiguous (sets, layette, …) stays
 *  `auto` and lets the model detect it — a wrong forced category is worse
 *  than no hint. */
export function garmentCategoryFor(p: Product): TryOnCategory {
  const n = p.name;
  if (/سرهمی|توتو/.test(n)) return "one-pieces";
  if (/^ست /.test(n)) return "auto";
  if (/پیراهن.*(مجلسی|پرنسسی|پولک)/.test(n)) return "one-pieces";
  if (/شلوار|دامن/.test(n)) return "bottoms";
  if (/پالتو|کاپشن|کت |سوئیشرت|هودی|تیشرت|بلوز|کاپیش/.test(n)) return "tops";
  return "auto";
}

/** 🧠 All state and the AI try-on call behind the studio.
 *
 *  🚫 Deliberately loop-free: `runTryOn` performs exactly ONE `fetch`
 *  guarded by a ref (double clicks / React StrictMode re-invocation can't
 *  start a second job), cancellable via AbortController, and aborted on
 *  unmount. There is no `while`, no `setInterval`, no recursive `setTimeout`
 *  anywhere in this flow — nothing here can spin forever, by construction.
 */
export function useTryOn() {
  const { user, setAuthOpen } = useStore();
  const [person, setPerson] = useState<string | null>(null); // 🪶 Data URL or catalog path.
  const [garment, setGarment] = useState(0);
  // 📏 Default from the shopper's own child profile (Profile → «اطلاعات
  // کوچولو») when they've set a height, so the suggestion is already
  // personalized the first time this studio opens.
  const [height, setHeight] = useState(() => user?.childHeightCm || "104");
  const [phase, setPhase] = useState<TryOnPhase>("idle");
  const [result, setResult] = useState<string | null>(null);
  const [engine, setEngine] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  // 🛡️ The in-flight request, if any — the single source of truth for
  // "am I already running", safe against re-renders and double taps.
  const flightRef = useRef<AbortController | null>(null);

  // 🧹 Leaving the page mid-generation must not leave a dangling request
  // (or a late `setResult` on an unmounted tree): abort it on unmount.
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
    // 🪶 Shrink the photo on-device (Web Worker, off the main thread) so
    // the upload is ~1MB instead of ~8MB: faster POST, no 413s, and the
    // engine gets a clean 1024px full-body frame either way.
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
    // 🧘 No-op unless a job is actually in flight (the button only shows
    // while running, but a result landing on the same tick must win).
    if (!flightRef.current) return;
    flightRef.current.abort();
    flightRef.current = null;
    setPhase("idle");
    toast.info("پرو مجازی لغو شد.");
  }

  async function runTryOn() {
    if (!person) return toast.warning("اول یک عکس یا مدل نمونه انتخاب کنید");
    // 🔐 `/api/tryon` 401s an anonymous caller anyway — catching it here
    // sends a guest to the real login dialog instead of a raw error toast,
    // matching `product-buy-panel.tsx`'s `openCheckout` gate.
    if (!user) {
      setAuthOpen(true);
      toast.warning("برای پرو مجازی اول وارد حساب‌تان شوید");
      return;
    }
    // 🛡️ Second tap while running (or a StrictMode double-invoke) is a
    // no-op — one job at a time, always.
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
      // 🧘 Aborts (user cancel / unmount / client timeout) are quiet by
      // design — `cancel()` already toasted, unmount needs nothing, and a
      // timeout gets its own clear message below instead of a DOMException.
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
