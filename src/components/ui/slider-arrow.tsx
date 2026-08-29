"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * دکمهٔ یکدستِ اسلایدرها در تمامِ صفحه‌های سایت.
 * هاور: گرادیانِ طلایی + هالهٔ نور + بزرگ‌نمایی + سُرخوردنِ آیکن در جهتِ حرکت.
 * کلیک: موجِ طلایی (arrow-ripple) + فشرده‌شدنِ لحظه‌ای.
 */
export function SliderArrow({
  direction,
  onClick,
  label,
  chevron = false,
  className,
  disabled,
}: {
  /** prev = فلش به راست (RTL)، next = فلش به چپ */
  direction: "prev" | "next";
  onClick?: () => void;
  label: string;
  /** برای اسلایدرِ روی تصویر (گالری محصول) به‌جای Arrow از Chevron استفاده می‌شود */
  chevron?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const Icon = chevron
    ? direction === "prev"
      ? ChevronRight
      : ChevronLeft
    : direction === "prev"
      ? ArrowRight
      : ArrowLeft;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "slider-arrow group inline-flex size-11 shrink-0 items-center justify-center rounded-full",
        "border border-navy/10 bg-white/90 text-navy backdrop-blur",
        "transition-all duration-300 ease-out",
        "hover:scale-110 hover:border-transparent hover:bg-linear-to-l hover:from-gold-deep hover:via-gold hover:to-gold-light hover:text-navy-deep",
        "hover:shadow-[0_12px_28px_-10px_var(--color-gold)]",
        "active:scale-90 active:duration-100",
        "dark:border-gold/30 dark:bg-dusk-mid/80 dark:text-gold-light dark:hover:text-navy-deep",
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-[18px] transition-transform duration-300 group-active:scale-75",
          // سُرخوردنِ آیکن در جهتِ حرکت — حسِ «هل‌دادنِ» اسلاید
          direction === "next" ? "group-hover:-translate-x-1" : "group-hover:translate-x-1",
        )}
      />
    </button>
  );
}
