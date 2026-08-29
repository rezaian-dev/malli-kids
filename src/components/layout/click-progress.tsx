"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export const PROGRESS_EVENT = "malli:progress";

/** این رویداد را dispatch کنید تا نوارِ پیشرفتِ طلایی بالای صفحه روشن شود */
export function startTopProgress() {
  window.dispatchEvent(new Event(PROGRESS_EVENT));
}

/**
 * نوار پیشرفتِ باریکِ طلایی بالای صفحه — برای ناوبری‌های برنامه‌ای
 * (مثل کلیک روی آیتمِ دسته‌بندی) که nextjs-toploader برایشان بارِ قابل
 * نمایشی ندارد. با تغییرِ مسیر کامل و محو می‌شود.
 */
export function ClickProgress() {
  const [phase, setPhase] = useState<"idle" | "run" | "done">("idle");
  const path = usePathname();
  const prev = useRef(path);

  useEffect(() => {
    const start = () => {
      setPhase("run");
      // اگر مسیر عوض نشد (مثلاً مقصد همان صفحه بود) خودش کامل می‌شود
      window.setTimeout(() => setPhase((s) => (s === "run" ? "done" : s)), 900);
    };
    window.addEventListener(PROGRESS_EVENT, start);
    return () => window.removeEventListener(PROGRESS_EVENT, start);
  }, []);

  useEffect(() => {
    if (prev.current !== path) {
      prev.current = path;
      setPhase((s) => (s === "run" ? "done" : s));
    }
  }, [path]);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(() => setPhase("idle"), 400);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <div
      aria-hidden={phase === "idle"}
      className="pointer-events-none fixed top-0 inset-x-0 z-[95] h-[3px]"
      style={{ opacity: phase === "done" ? 0 : phase === "run" ? 1 : 0, transition: "opacity .35s ease" }}
    >
      <div
        className="h-full rounded-s-full bg-linear-to-l from-gold-deep via-gold to-gold-light shadow-[0_0_10px_0_var(--color-gold)]"
        style={{
          marginInlineStart: "auto",
          width: phase === "idle" ? "0%" : phase === "run" ? "72%" : "100%",
          transition: phase === "run" ? "width .8s cubic-bezier(.2,.7,.3,1)" : "width .25s ease",
        }}
      />
    </div>
  );
}
