import Link from "next/link";
import { ArrowLeft, Gift, Sparkles, Ticket } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FestiveBanner as BannerItem, FestiveTheme } from "@/types";
import { FestiveDecor } from "./festive-decor";

const TONE: Record<FestiveTheme, string> = {
  navy: "from-navy via-navy-mid to-navy-deep",
  gold: "from-navy-deep via-navy to-navy-mid",
  night: "from-navy-deep via-slate to-navy-deep",
};

// 🎀 Static banner keeps the top ribbon visible before client hydration.
export function FestiveBannerFallback({ item }: { item: BannerItem | null }) {
  if (item) {
    return (
      <div
        className={cn(
          "text-ivory relative isolate overflow-hidden bg-linear-to-l",
          TONE[item.theme],
        )}
      >
        <FestiveDecor />
        <span
          className="via-gold/60 pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-l from-transparent to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-4 gap-y-2 px-3 py-3.5 sm:flex-nowrap sm:justify-between sm:px-6 sm:py-4">
          <div className="flex min-w-0 items-center gap-3 sm:gap-4">
            <span className="bg-gold text-navy-deep shadow-gold/70 relative inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-[10px] font-black shadow-[0_4px_14px_-4px] sm:px-3.5 sm:text-[11px]">
              <Gift className="size-3.5" />
              {item.occasion}
              <span
                className="absolute inset-0 rounded-full ring-1 ring-white/40 ring-inset"
                aria-hidden
              />
            </span>
            <div className="min-w-0 text-center sm:text-start">
              <p className="truncate text-[13px] font-black tracking-tight sm:text-[15px]">
                {item.title}
              </p>
              <p className="text-ivory/70 mt-0.5 hidden truncate text-[11px] font-bold min-[560px]:block sm:text-xs">
                {item.subtitle}
              </p>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2.5 sm:gap-3">
            {item.coupon ? (
              <span
                className="border-gold/60 bg-gold/10 text-gold-light hidden items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-[11px] font-black tracking-[0.14em] md:inline-flex"
                title="کد تخفیف را در صفحهٔ پرداخت وارد کنید"
              >
                <Ticket className="size-3.5" />
                {item.coupon}
              </span>
            ) : null}
            <Link
              href={item.href}
              prefetch={false}
              className="group bg-gold text-navy-deep shadow-gold/30 hover:shadow-gold/50 relative inline-flex shrink-0 items-center gap-1.5 overflow-hidden rounded-full px-4 py-2 text-[11px] font-black shadow-lg transition-all hover:scale-[1.04] sm:px-5 sm:text-xs"
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
    <div className="from-navy via-navy-mid to-navy text-ivory relative isolate overflow-hidden bg-linear-to-l">
      <FestiveDecor />
      <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-4 py-3.5 text-center sm:py-4">
        <Sparkles className="text-gold size-4.5 shrink-0" />
        <p className="text-xs font-bold sm:text-[13px]">
          <span className="text-gold-light font-black">ارسال رایگان</span> برای
          خریدهای بالای ۱٬۵۰۰ تومان
        </p>
        <Link
          href="/shipping"
          prefetch={false}
          className="group inline-flex items-center gap-1 text-[11px] font-black text-gold-light underline-offset-4 hover:underline sm:text-xs"
        >
          جزئیات
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
