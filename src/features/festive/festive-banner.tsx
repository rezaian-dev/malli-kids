import Link from "next/link";
import { ArrowLeft, Gift, Sparkles, Ticket } from "lucide-react";
import { pickBanner } from "@/features/festive/lib/occasions";
import type { FestiveTheme } from "@/types";
import { getBanners } from "@/lib/data";
import { cn } from "@/lib/utils";
import { FestiveDecor } from "./festive-decor";

// Each theme is a deep navy gradient with gold accents — a premium festive strip.
const TONE: Record<FestiveTheme, string> = {
  navy: "from-navy via-navy-mid to-navy-deep",
  gold: "from-navy-deep via-navy to-navy-mid",
  night: "from-navy-deep via-slate to-navy-deep",
};

/**
 * نوار مناسبتی — Server Component.
 *
 * انتخاب بنر فقط به تاریخِ رندر بستگی دارد، پس روی سرور انجام می‌شود؛
 * دیگر خبری از useEffect و پرشِ «اول null بعد بنر» نیست.
 */
export function FestiveBanner() {
  const item = pickBanner(getBanners());

  if (!item) {
    return (
      <div className="relative isolate overflow-hidden bg-linear-to-l from-navy via-navy-mid to-navy text-ivory">
        <FestiveDecor />
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
    <div className={cn("relative isolate overflow-hidden bg-linear-to-l text-ivory", TONE[item.theme])}>
      <FestiveDecor />

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
