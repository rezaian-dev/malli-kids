"use client";

import { Minus, Plus } from "lucide-react";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";

const SIZES = {
  md: { btn: "size-10", icon: "size-4", digits: "w-10 text-base" },
  sm: { btn: "size-6.5", icon: "size-3.5", digits: "min-w-5 text-xs" },
} as const;

/** 🔢 The one qty +/− control — used to be reimplemented once on the PDP
 *  and again in the cart sheet with slightly different sizes/colors/button
 *  order for no real reason. One shape now, two sizes. */
export function QtyStepper({
  qty,
  onChange,
  min = 1,
  max = 9,
  size = "md",
  className,
  "aria-label": ariaLabel = "تعداد",
}: {
  qty: number;
  onChange: (qty: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md";
  className?: string;
  "aria-label"?: string;
}) {
  const s = SIZES[size];

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center gap-1 rounded-full border p-1",
        "border-navy/10 bg-sand",
        "dark:border-gold/30 dark:bg-night",
        className,
      )}
    >
      <button
        type="button"
        aria-label="کم کردن"
        disabled={qty <= min}
        onClick={() => onChange(qty - 1)}
        className={cn(
          s.btn,
          "grid place-items-center rounded-full bg-white text-navy transition-transform duration-150 motion-safe:hover:scale-110 motion-safe:active:scale-90 disabled:opacity-40 disabled:motion-safe:hover:scale-100",
          "dark:bg-slate dark:text-ivory",
        )}
      >
        <Minus className={s.icon} />
      </button>
      <span
        className={cn(
          "text-navy dark:text-ivory text-center font-black tabular-nums",
          s.digits,
        )}
      >
        {toFaDigits(qty)}
      </span>
      <button
        type="button"
        aria-label="زیاد کردن"
        disabled={qty >= max}
        onClick={() => onChange(qty + 1)}
        className={cn(
          s.btn,
          "grid place-items-center rounded-full bg-navy text-cream transition-transform duration-150 motion-safe:hover:scale-110 motion-safe:active:scale-90 disabled:opacity-40 disabled:motion-safe:hover:scale-100",
        )}
      >
        <Plus className={s.icon} />
      </button>
    </div>
  );
}
