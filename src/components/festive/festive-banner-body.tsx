"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift, PartyPopper, Sparkles, Ticket } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { loadBanners } from "@/lib/admin-sync";
import { pickBanner } from "@/lib/festive/occasions";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FestiveBanner as BannerItem, FestiveTheme } from "@/types";
import { FestiveDecor } from "./festive-decor";

const TONE: Record<FestiveTheme, string> = {
  navy: "from-navy via-navy-mid to-navy-deep",
  gold: "from-navy-deep via-navy to-navy-mid",
  night: "from-navy-deep via-slate to-navy-deep",
};

export function FestiveBannerBody({ item: serverItem }: { item: BannerItem | null }) {
  const { campaign } = useStore();
  const [seen, setSeen] = useState(false);
  const [item, setItem] = useState<BannerItem | null>(serverItem);
  useEffect(() => setSeen(true), []);
  
  useEffect(() => setItem(pickBanner(loadBanners()) ?? null), []);

  if (seen && campaign.active && campaign.percent > 0) {
    return (
      <div className="relative isolate overflow-hidden bg-linear-to-l from-gold-deep via-gold-light to-gold text-navy-deep" role="status">
        <FestiveDecor />
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-white/70 to-transparent" aria-hidden />
        <div className="animate-fade-up relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-3.5 text-center sm:py-4">
          <PartyPopper className="size-4.5 shrink-0" />
          <p className="text-xs font-black sm:text-[13px]">
            {campaign.title || "جشنواره"} — {toFaDigits(campaign.percent)}٪ تخفیف روی همهٔ محصولات
          </p>
          <Link href="/shop" className="group inline-flex items-center gap-1 text-[11px] font-black underline-offset-4 hover:underline sm:text-xs">
            خرید
            <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
          </Link>
        </div>
      </div>
    );
  }

  if (item) {
    return (
      <div className={cn("relative isolate overflow-hidden bg-linear-to-l text-ivory", TONE[item.theme])}>
        <FestiveDecor />
        {/* gold hairline at the top edge too — the strip reads as a framed ribbon */}
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent via-gold/60 to-transparent" aria-hidden />

        <div className="animate-fade-up relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-3 py-3.5 sm:flex-nowrap sm:justify-between sm:px-6 sm:py-4">
          {/* right cluster: occasion pill + title/subtitle */}
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="relative inline-flex shrink-0 items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-[10px] font-black text-navy-deep shadow-[0_4px_14px_-4px] shadow-gold/70 sm:px-3.5 sm:text-[11px]">
              <Gift className="animate-orn-sway motion-reduce:animate-none size-3.5" />
              {item.occasion}
              <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" aria-hidden />
            </span>
            <div className="min-w-0 text-center sm:text-start">
              <p className="truncate text-[13px] font-black tracking-tight sm:text-[15px]">{item.title}</p>
              <p className="mt-0.5 hidden truncate text-[11px] font-bold text-ivory/70 min-[560px]:block sm:text-xs">{item.subtitle}</p>
            </div>
          </div>

          {/* left cluster: coupon chip + CTA with hover shine */}
          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {item.coupon ? (
              <span
                className="hidden items-center gap-1.5 rounded-lg border border-dashed border-gold/60 bg-gold/10 px-3 py-1.5 text-[11px] font-black tracking-[0.14em] text-gold-light md:inline-flex"
                title="کد تخفیف را در صفحهٔ پرداخت وارد کنید"
              >
                <Ticket className="size-3.5" />
                {item.coupon}
              </span>
            ) : null}
            <Link
              href={item.href}
              className="group relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full bg-gold px-4 py-2 text-[11px] font-black text-navy-deep shadow-lg shadow-gold/30 transition-all hover:scale-[1.04] hover:shadow-gold/50 sm:px-5 sm:text-xs"
            >
              <span className="relative z-10">{item.cta}</span>
              <ArrowLeft className="relative z-10 size-3.5 transition-transform group-hover:-translate-x-0.5" />
              <span className="absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/60 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative isolate overflow-hidden bg-linear-to-l from-navy via-navy-mid to-navy text-ivory">
      <FestiveDecor />
      <div className="animate-fade-up relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-3.5 text-center sm:py-4">
        <Sparkles className="animate-twinkle motion-reduce:animate-none size-4.5 shrink-0 text-gold" />
        <p className="text-xs font-bold sm:text-[13px]">
          <span className="font-black text-gold-light">ارسال رایگان</span> برای خریدهای بالای ۱٬۵٬۰۰ تومان
        </p>
        <Link href="/shipping" className="group inline-flex items-center gap-1 text-[11px] font-black text-gold-light underline-offset-4 hover:underline sm:text-xs">
          جزئیات
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
