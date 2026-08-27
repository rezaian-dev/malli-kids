"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Gift, Sparkles, Ticket } from "lucide-react";
import { pickBanner } from "@/lib/occasions";
import type { FestiveBanner, FestiveTheme } from "@/types";
import { getBanners } from "@/lib/data";

// Each theme is a deep navy gradient with gold accents — a premium festive strip.
const TONE: Record<FestiveTheme, string> = {
  navy: "from-navy via-navy-mid to-navy-deep",
  gold: "from-navy-deep via-navy to-navy-mid",
  night: "from-navy-deep via-slate to-navy-deep",
};

// Small twinkling star field over the banner.
const STARS = [
  { top: "18%", left: "9%", size: "size-1", delay: "0s" },
  { top: "64%", left: "17%", size: "size-1.5", delay: ".6s" },
  { top: "30%", left: "38%", size: "size-1", delay: "1.1s" },
  { top: "72%", left: "62%", size: "size-1", delay: ".3s" },
  { top: "22%", left: "78%", size: "size-1.5", delay: ".9s" },
  { top: "56%", left: "90%", size: "size-1", delay: "1.4s" },
];

export function FestiveBanner() {
  const [item, setItem] = useState<FestiveBanner | null>(null);

  // Keep in an effect (null on first paint) to avoid a hydration mismatch,
  // since the pick can depend on the current date.
  useEffect(() => {
    setItem(pickBanner(getBanners()));
  }, []);

  // Decorative, non-interactive layer shared by both states.
  const Decor = (
    <>
      {/* dotted gold texture */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)", backgroundSize: "22px 22px" }}
      />
      {/* floating glow orbs */}
      <span className="animate-floaty motion-reduce:animate-none pointer-events-none absolute -start-12 top-1/2 size-40 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
      <span className="animate-floaty-slow motion-reduce:animate-none pointer-events-none absolute -end-8 -top-8 size-32 rounded-full bg-gold-glow/15 blur-2xl" />
      {/* diagonal shine sweep */}
      <span className="animate-shimmer motion-reduce:animate-none pointer-events-none absolute inset-y-0 -inset-x-1/4 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/12 to-transparent" />
      {/* twinkling stars */}
      {STARS.map((s, i) => (
        <span
          key={i}
          className={`animate-twinkle motion-reduce:animate-none pointer-events-none absolute ${s.size} rounded-full bg-gold-light shadow-[0_0_8px_1px] shadow-gold/50`}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
      {/* gold hairline at the bottom edge */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-l from-transparent via-gold/60 to-transparent" />
    </>
  );

  if (!item) {
    return (
      <div className="relative isolate overflow-hidden bg-linear-to-l from-navy via-navy-mid to-navy text-ivory">
        {Decor}
        <div className="animate-fade-up relative mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2.5 text-center">
          <Sparkles className="animate-twinkle motion-reduce:animate-none size-4 shrink-0 text-gold" />
          <p className="text-[11px] font-bold sm:text-xs">
            <span className="font-black text-gold-light">ارسال رایگان</span> برای خریدهای بالای ۱٬۵۰۰٬۰۰۰ تومان
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative isolate overflow-hidden bg-linear-to-l ${TONE[item.theme]} text-ivory`}>
      {Decor}

      <div className="animate-fade-up relative mx-auto flex max-w-7xl items-center justify-center gap-2.5 px-3 py-2.5 sm:gap-4 sm:py-3">
        {/* occasion pill */}
        <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[10px] font-black text-navy-deep shadow-[0_4px_14px_-4px] shadow-gold/70 sm:text-[11px]">
          <Gift className="animate-orn-sway motion-reduce:animate-none size-3.5" />
          {item.occasion}
        </span>

        {/* title + subtitle */}
        <div className="min-w-0 text-center sm:text-start">
          <p className="truncate text-xs font-black tracking-tight sm:text-sm">{item.title}</p>
          <p className="hidden truncate text-[11px] text-ivory/70 min-[560px]:block">{item.subtitle}</p>
        </div>

        {/* coupon chip */}
        {item.coupon ? (
          <span className="hidden shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-gold/60 bg-gold/10 px-2.5 py-1 text-[11px] font-black tracking-[0.14em] text-gold-light sm:inline-flex">
            <Ticket className="size-3.5" />
            {item.coupon}
          </span>
        ) : null}

        {/* CTA with hover shine */}
        <Link
          href={item.href}
          className="group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-gold px-3.5 py-1.5 text-[10px] font-black text-navy-deep transition-transform hover:scale-[1.04] sm:px-4 sm:text-xs"
        >
          <span className="relative z-10">{item.cta}</span>
          <ArrowLeft className="relative z-10 size-3.5 transition-transform group-hover:-translate-x-0.5" />
          <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
        </Link>
      </div>
    </div>
  );
}
