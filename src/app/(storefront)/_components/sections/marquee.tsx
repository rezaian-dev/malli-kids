"use client";

import { useState } from "react";
import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  "ارسال رایگان از ۱٬۵۰۰٬۰۰۰ تومان",
  "پارچه OEKO-TEX",
  "پرو مجازی",
  "بازگشت ۷ روزه",
  "دوخت ایرانی",
  "کالکشن پاییز ۱۴۰۴",
];

export function Marquee() {
  const [paused, setPaused] = useState(false);
  const row = ITEMS.concat(ITEMS).map((t, i) => (
    <span
      key={i}
      className="text-ivory/85 px-6 text-xs font-bold tracking-wide whitespace-nowrap sm:text-sm"
    >
      <span className="text-gold-light ms-1 me-2">✦</span>
      {t}
    </span>
  ));
  return (
    <div className="bg-navy relative overflow-hidden py-2.5 sm:py-4" dir="ltr">
      <div
        className={cn(
          "animate-marquee flex w-max hover:[animation-play-state:paused]",
          paused && "[animation-play-state:paused]",
        )}
      >
        <div className="flex shrink-0 items-center">{row}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {row}
        </div>
      </div>
      {/* Shown only when motion is allowed — under prefers-reduced-motion the
          animation is already nulled in theme.css, so a pause control would be
          a no-op. */}
      <button
        type="button"
        onClick={() => setPaused((p) => !p)}
        aria-pressed={paused}
        aria-label={paused ? "پخش نوار متحرک" : "توقف نوار متحرک"}
        className="absolute end-2 top-1/2 hidden size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-ivory/80 backdrop-blur transition-colors hover:bg-white/20 motion-safe:flex"
      >
        {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
      </button>
    </div>
  );
}
