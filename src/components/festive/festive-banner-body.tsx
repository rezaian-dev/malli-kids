"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, Ticket } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { FestiveTheme } from "@/types";
import { FestiveDecor } from "./festive-decor";
import { Gem3D, Gift3D } from "./festive-ornaments";

const TONE: Record<FestiveTheme, string> = {
  navy: "from-navy via-navy-mid to-navy-deep",
  gold: "from-navy-deep via-navy to-navy-mid",
  night: "from-navy-deep via-slate to-navy-deep",
};

function BannerFrame({
  className,
  children,
  topLine,
  tone = "dark",
}: {
  className: string;
  children: ReactNode;
  topLine?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-linear-to-l",
        className,
      )}
    >
      <FestiveDecor tone={tone} />
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent to-transparent",
          topLine ?? "via-gold/60",
        )}
        aria-hidden
      />
      {/* 📐 h-14 / sm:h-15 — keep `HeaderSpacer` in sync (banner + bar + gap). */}
      <div className="relative mx-auto flex h-14 max-w-7xl items-center justify-center gap-x-4 overflow-hidden px-3 text-center whitespace-nowrap sm:h-15 sm:justify-between sm:px-6">
        {children}
      </div>
    </div>
  );
}

// 🎀 Render the festival strip from the shared store snapshot. ✨
// 🚫 No hover transforms anywhere in here (no scale, no nudges, no sweeps):
// the cursor often sits parked on this strip at refresh, and CSS `:hover`
// matches instantly on load — any hover movement would replay as a tick.
// Hover feedback is brightness/shadow/underline only.
export function FestiveBannerBody() {
  const { campaign, banner } = useStore();

  if (campaign.active && campaign.percent > 0) {
    return (
      <BannerFrame
        className="from-gold-deep via-gold to-gold-light text-navy-deep"
        topLine="via-white/70"
        tone="light"
      >
        <div className="flex min-w-0 items-center justify-center gap-3 sm:gap-4">
          <Gift3D className="w-8 shrink-0" />
          <p className="truncate text-[13px] font-black sm:text-sm">
            {campaign.title || "جشنواره"} — {toFaDigits(campaign.percent)}٪
            تخفیف روی همهٔ محصولات
          </p>
        </div>
        <Link
          href="/shop"
          prefetch={false}
          className="inline-flex shrink-0 items-center gap-1 text-xs font-black underline-offset-4 hover:underline sm:text-[13px]"
        >
          خرید
          <ArrowLeft className="size-3.5" />
        </Link>
      </BannerFrame>
    );
  }

  if (banner) {
    return (
      <BannerFrame className={cn("text-ivory", TONE[banner.theme])}>
        <div className="flex min-w-0 items-center gap-3 sm:gap-4">
          <span
            className={cn(
              "relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-[11px] font-black sm:px-4 sm:text-xs",
              "from-gold-glow via-gold to-gold-deep text-navy-deep bg-linear-to-b",
              "shadow-[0_6px_16px_-6px_rgba(130,88,31,.7),inset_0_1px_0_rgb(255_255_255/.6),inset_0_-2px_3px_rgb(4_20_39/.25)]",
            )}
          >
            <Gift className="size-4" />
            {banner.occasion}
            <span
              className="absolute inset-0 rounded-full ring-1 ring-white/40 ring-inset"
              aria-hidden
            />
          </span>
          <div className="min-w-0 text-center sm:text-start">
            <p className="truncate text-sm font-black tracking-tight sm:text-base">
              {banner.title}
            </p>
            <p
              className={cn(
                "mt-0.5 hidden truncate text-xs font-bold min-[560px]:block sm:text-[13px]",
                "text-ivory/70",
              )}
            >
              {banner.subtitle}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
          {banner.coupon ? (
            <span
              className={cn(
                "hidden items-center gap-1.5 rounded-lg border border-dashed px-3.5 py-2 text-xs font-black tracking-[0.14em] md:inline-flex",
                "border-gold/60 bg-gold/10 text-gold-light",
                "shadow-[0_2px_10px_-4px_rgb(0_0_0/.6),inset_0_1px_0_rgb(255_255_255/.12)]",
              )}
              title="کد تخفیف را در صفحهٔ پرداخت وارد کنید"
            >
              <Ticket className="size-4" />
              {banner.coupon}
            </span>
          ) : null}
          <Link
            href={banner.href}
            prefetch={false}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-5 py-2.5 text-xs font-black transition-[filter,box-shadow] duration-200 sm:px-6 sm:text-[13px]",
              "from-gold-light via-gold to-gold-deep text-navy-deep bg-linear-to-b",
              "shadow-[0_10px_22px_-8px_rgba(130,88,31,.8),inset_0_1px_0_rgb(255_255_255/.65),inset_0_-2px_4px_rgb(4_20_39/.3)]",
              "hover:shadow-[0_12px_26px_-8px_rgba(130,88,31,.9),inset_0_1px_0_rgb(255_255_255/.65),inset_0_-2px_4px_rgb(4_20_39/.3)] hover:brightness-110 active:brightness-95",
            )}
          >
            {banner.cta}
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </BannerFrame>
    );
  }

  return (
    <BannerFrame className="from-navy via-navy-mid to-navy text-ivory">
      <div className="flex min-w-0 items-center justify-center gap-3 sm:gap-4">
        <Gem3D className="w-7 shrink-0" />
        <p className="truncate text-[13px] font-bold sm:text-sm">
          <span className="text-gold-light font-black">ارسال رایگان</span> برای
          خریدهای بالای ۱٬۵۰۰٬۰۰۰ تومان
        </p>
      </div>
      <Link
        href="/shipping"
        prefetch={false}
        className="text-gold-light inline-flex shrink-0 items-center gap-1 text-xs font-black underline-offset-4 hover:underline sm:text-[13px]"
      >
        جزئیات
        <ArrowLeft className="size-3.5" />
      </Link>
    </BannerFrame>
  );
}
