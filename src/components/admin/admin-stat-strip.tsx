import type { ComponentType } from "react";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AdminStatItem = {
  label: string;
  value: string | number;
  hint?: string;
  Icon: ComponentType<{ className?: string }>;
  tone?: "gold" | "emerald" | "rose" | "blue";
};

const STAT_TONES: Record<NonNullable<AdminStatItem["tone"]>, string> = {
  gold: "bg-gold/14 text-gold-deep dark:bg-gold/15 dark:text-gold-soft",
  emerald:
    "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300",
  rose: "bg-rose/10 text-rose dark:bg-rose/15 dark:text-rose-light",
  blue: "bg-sky-500/10 text-sky-700 dark:bg-sky-400/12 dark:text-sky-300",
};

/** 📊 The 2–4 KPI tiles at the top of most admin list pages. */
export function AdminStatStrip({
  items,
  className,
}: {
  items: AdminStatItem[];
  className?: string;
}) {
  return (
    <div
      className={cn("mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4", className)}
    >
      {items.map((item) => (
        <article
          key={item.label}
          className={cn(
            "flex min-h-19 min-w-0 items-center gap-[0.65rem] rounded-[18px] border p-3",
            "border-navy/8 bg-paper/88 hover:border-gold/34 shadow-[0_16px_35px_-30px_rgba(14,42,71,0.45)] backdrop-blur-[14px] transition-[transform,border-color] duration-260 ease-[cubic-bezier(.25,.1,.25,1)] hover:-translate-y-0.5",
            "dark:border-gold-soft/13 dark:bg-[rgba(16,43,70,0.62)] dark:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.8)]",
          )}
        >
          <span
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl",
              STAT_TONES[item.tone ?? "gold"],
            )}
          >
            <item.Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="text-navy/45 dark:text-wheat/65 truncate text-[10px] font-black">
              {item.label}
            </p>
            <p className="text-navy dark:text-ivory mt-0.5 text-base font-black sm:text-lg">
              {typeof item.value === "number"
                ? toFaDigits(item.value)
                : item.value}
            </p>
            {item.hint ? (
              <p className="text-navy/35 dark:text-wheat/45 truncate text-[9px] font-bold">
                {item.hint}
              </p>
            ) : null}
          </div>
        </article>
      ))}
    </div>
  );
}
