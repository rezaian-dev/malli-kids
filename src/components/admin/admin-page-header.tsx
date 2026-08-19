import { Activity, ChevronLeft, LayoutGrid, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";

/** 📋 The kicker/title/description/action header every admin page opens with. */
export function AdminPageHeader({
  kicker,
  title,
  description,
  action,
}: {
  kicker: string;
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <header className="admin-page-head border-navy/9 dark:border-gold-soft/17 relative mb-6 overflow-hidden rounded-[26px] border bg-[linear-gradient(115deg,rgba(193,147,87,0.075),transparent_38%),rgba(255,254,251,0.78)] shadow-[0_24px_58px_-42px_rgba(14,42,71,0.5),inset_0_1px_0_rgba(255,255,255,0.84)] backdrop-blur-[20px] sm:mb-7 dark:bg-[linear-gradient(115deg,rgba(193,147,87,0.09),transparent_42%),rgba(10,31,53,0.72)] dark:shadow-[0_28px_70px_-44px_rgba(0,0,0,0.92),inset_0_1px_0_rgba(255,255,255,0.045),0_0_40px_rgba(193,147,87,0.025)]">
      <span
        className="bg-gold/13 dark:bg-gold/10.5 pointer-events-none absolute -inset-e-16 -top-36 size-60 rounded-full blur-[44px]"
        aria-hidden="true"
      />
      <div className="relative flex flex-col justify-between gap-5 px-4 pt-4 pb-5 sm:flex-row sm:items-end sm:px-6 sm:pt-5 sm:pb-6">
        <div className="min-w-0">
          <div className="text-navy/70 dark:text-wheat/70 mb-3 flex min-w-0 items-center gap-1.5 text-[9px] font-black">
            <LayoutGrid className="text-gold size-3" />
            <span>کنسول مدیریت</span>
            <ChevronLeft className="size-3 opacity-45" />
            <span className="text-navy/70 dark:text-ivory/70 truncate">
              {title}
            </span>
          </div>
          <div className="relative min-w-0 ps-4">
            <span className="from-gold-light via-gold to-gold-deep absolute inset-y-1 inset-s-0 w-1 rounded-full bg-linear-to-b shadow-[0_0_18px_rgba(193,147,87,.28)]" />
            <p className="text-gold text-[9px] font-black tracking-[0.24em]">
              {kicker}
            </p>
            {}
            <h1 className="text-navy dark:text-ivory mt-1 text-[clamp(1.6rem,3vw,2.35rem)] leading-tight font-black">
              {title}
            </h1>
            {description ? (
              <p className="text-navy/70 dark:text-wheat/70 mt-2 max-w-2xl text-[11px] leading-6 font-bold sm:text-xs">
                {description}
              </p>
            ) : null}
          </div>
        </div>
        {action ? (
          <div className="flex w-full shrink-0 *:w-full sm:w-auto sm:*:w-auto">
            {action}
          </div>
        ) : null}
      </div>
      <div className="border-navy/7 bg-navy/[0.018] text-navy/70 dark:border-gold/12 dark:text-wheat/70 relative flex flex-wrap items-center justify-between gap-2 border-t px-4 py-2.5 text-[9px] font-bold sm:px-6 dark:bg-white/[0.018]">
        <span className="flex items-center gap-1.5">
          <Activity className="size-3.5 text-emerald-600 dark:text-emerald-300" />
          <span className="size-1.5 rounded-full bg-emerald-500" /> وضعیت
          داده‌ها: به‌روز
        </span>
        <span className="hidden items-center gap-1.5 sm:flex">
          <ShieldCheck className="text-gold size-3.5" /> سطح دسترسی: مدیریت
        </span>
      </div>
    </header>
  );
}
