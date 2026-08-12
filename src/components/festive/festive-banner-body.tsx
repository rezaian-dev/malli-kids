"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, PartyPopper, Sparkles, Ticket } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import type { FestiveTheme } from "@/types";
import { FestiveDecor } from "./festive-decor";

const TONE: Record<FestiveTheme, string> = {
  navy: "from-navy via-navy-mid to-navy-deep",
  gold: "from-navy-deep via-navy to-navy-mid",
  night: "from-navy-deep via-slate to-navy-deep",
};

function BannerFrame({
  className,
  children,
  topLine,
}: {
  className: string;
  children: ReactNode;
  topLine?: string;
}) {
  return (
    <div
      className={cn(
        "relative isolate overflow-hidden bg-linear-to-l",
        className,
      )}
    >
      <FestiveDecor />
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent to-transparent",
          topLine ?? "via-gold/60",
        )}
        aria-hidden
      />
      <div className="relative mx-auto flex h-12 max-w-7xl items-center justify-center gap-x-4 overflow-hidden px-3 text-center whitespace-nowrap sm:h-13 sm:justify-between sm:px-6">
        {children}
      </div>
    </div>
  );
}

// 🎀 Render the festival strip from the shared store snapshot. ✨
export function FestiveBannerBody() {
  const { campaign, banner } = useStore();

  if (campaign.active && campaign.percent > 0) {
    return (
      <BannerFrame
        className="from-gold-deep via-gold-light to-gold text-navy-deep"
        topLine="via-white/70"
      >
        <div className="flex min-w-0 items-center justify-center gap-3 sm:gap-4">
          <PartyPopper className="size-4.5 shrink-0" />
          <p className="truncate text-xs font-black sm:text-[13px]">
            {campaign.title || "جشنواره"} — {toFaDigits(campaign.percent)}٪
            تخفیف روی همهٔ محصولات
          </p>
        </div>
        <Link
          href="/shop"
          prefetch={false}
          className="group inline-flex shrink-0 items-center gap-1 text-[11px] font-black underline-offset-4 hover:underline sm:text-xs"
        >
          خرید
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
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
              "relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black sm:px-3.5 sm:text-[11px]",
              "bg-gold text-navy-deep shadow-gold/70 shadow-[0_4px_14px_-4px]",
            )}
          >
            <Gift className="size-3.5" />
            {banner.occasion}
            <span
              className="absolute inset-0 rounded-full ring-1 ring-white/40 ring-inset"
              aria-hidden
            />
          </span>
          <div className="min-w-0 text-center sm:text-start">
            <p className="truncate text-[13px] font-black tracking-tight sm:text-[15px]">
              {banner.title}
            </p>
            <p
              className={cn(
                "mt-0.5 hidden truncate text-[11px] font-bold min-[560px]:block sm:text-xs",
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
                "hidden items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-[11px] font-black tracking-[0.14em] md:inline-flex",
                "border-gold/60 bg-gold/10 text-gold-light",
              )}
              title="کد تخفیف را در صفحهٔ پرداخت وارد کنید"
            >
              <Ticket className="size-3.5" />
              {banner.coupon}
            </span>
          ) : null}
          <Link
            href={banner.href}
            prefetch={false}
            className={cn(
              "group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-[11px] font-black transition-all hover:scale-[1.04] sm:px-5 sm:text-xs",
              "bg-gold text-navy-deep shadow-gold/30 hover:shadow-gold/50 shadow-lg",
            )}
          >
            <span className="relative z-10">{banner.cta}</span>
            <ArrowLeft className="relative z-10 size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span
              className={cn(
                "absolute inset-0 -translate-x-full transition-transform duration-500 group-hover:translate-x-full",
                "bg-linear-to-r from-transparent via-white/60 to-transparent",
              )}
            />
          </Link>
        </div>
      </BannerFrame>
    );
  }

  return (
    <BannerFrame className="from-navy via-navy-mid to-navy text-ivory">
      <div className="flex min-w-0 items-center justify-center gap-3 sm:gap-4">
        <Sparkles className="text-gold size-4.5 shrink-0 motion-reduce:animate-none" />
        <p className="truncate text-xs font-bold sm:text-[13px]">
          <span className="text-gold-light font-black">ارسال رایگان</span> برای
          خریدهای بالای ۱٬۵۰۰٬۰۰۰ تومان
        </p>
      </div>
      <Link
        href="/shipping"
        prefetch={false}
        className="group text-gold-light inline-flex shrink-0 items-center gap-1 text-[11px] font-black underline-offset-4 hover:underline sm:text-xs"
      >
        جزئیات
        <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
      </Link>
    </BannerFrame>
  );
}
