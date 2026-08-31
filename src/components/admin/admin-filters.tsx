"use client";

import { useId, type ComponentType, type ReactNode } from "react";
import { RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";

export type AdminFilterOption = {
  value: string;
  label: string;
  count?: number;
};

type AdminFilterBarProps = {
  children?: ReactNode;
  search?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  resultCount: number;
  resultLabel?: string;
  activeCount?: number;
  onReset?: () => void;
  className?: string;
};

export function AdminFilterBar({
  children,
  search,
  onSearchChange,
  searchPlaceholder = "جستجو…",
  resultCount,
  resultLabel = "مورد",
  activeCount = 0,
  onReset,
  className,
}: AdminFilterBarProps) {
  const hasSearch = typeof search === "string" && !!onSearchChange;

  return (
    <section className={cn("rounded-[22px] max-[639px]:rounded-[19px] border border-navy/9 bg-paper/94 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] dark:border-gold-soft/16 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] animate-admin-reveal motion-reduce:animate-none mb-5", className)} aria-label="جستجو و فیلترها">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-navy/8 px-3.5 py-3 dark:border-gold/15 sm:px-4">
        <div className="flex min-w-0 items-center gap-2.5">
          <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-navy text-gold shadow-sm dark:bg-gold/15 dark:text-gold-soft">
            <SlidersHorizontal className="size-4" />
          </span>
          <div className="min-w-0">
            <h2 className="text-xs font-black text-navy dark:text-ivory">فیلتر و مرتب‌سازی</h2>
            <p className="mt-0.5 text-[10px] font-bold text-navy/45 dark:text-wheat/65">
              {toFaDigits(resultCount)} {resultLabel} پیدا شد
              {activeCount > 0 ? ` · ${toFaDigits(activeCount)} فیلتر فعال` : ""}
            </p>
          </div>
        </div>

        {activeCount > 0 && onReset ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="h-8 rounded-xl px-2.5 text-[11px] font-black text-rose hover:bg-rose/10 hover:text-rose"
          >
            <RotateCcw className="size-3.5" /> پاک‌کردن فیلترها
          </Button>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-2.5 p-3 sm:grid-cols-2 sm:p-4 xl:flex xl:flex-wrap xl:items-end">
        {hasSearch ? (
          <label className="min-w-0 sm:col-span-2 xl:min-w-[16rem] xl:flex-1">
            <span className="mb-1.5 block text-[10px] font-black text-navy/50 dark:text-wheat/75">جستجو</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute inset-s-3 top-1/2 size-4 -translate-y-1/2 text-gold" />
              <Input
                value={search}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-11 w-full rounded-xl bg-white ps-10 pe-10 shadow-none dark:bg-navy-deep/45"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  aria-label="پاک‌کردن جستجو"
                  className="absolute inset-e-2.5 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded-lg text-navy/40 transition hover:bg-navy/7 hover:text-navy dark:text-wheat/60 dark:hover:bg-white/8 dark:hover:text-ivory"
                >
                  <X className="size-3.5" />
                </button>
              ) : null}
            </span>
          </label>
        ) : null}
        {children}
      </div>
    </section>
  );
}

export function AdminFilterSelect({
  label,
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: readonly AdminFilterOption[];
  placeholder?: string;
  className?: string;
}) {
  const id = useId();

  return (
    <div className={cn("min-w-0 xl:w-44 xl:shrink-0", className)}>
      <label htmlFor={id} className="mb-1.5 block text-[10px] font-black text-navy/50 dark:text-wheat/75">
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} dir="rtl">
        <SelectTrigger id={id} className="h-11 rounded-xl bg-white shadow-none dark:bg-navy-deep/45" aria-label={label}>
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex w-full items-center justify-between gap-4">
                <span>{option.label}</span>
                {typeof option.count === "number" ? (
                  <span className="rounded-md bg-navy/6 px-1.5 py-0.5 text-[10px] text-navy/50 dark:bg-white/8 dark:text-wheat">
                    {toFaDigits(option.count)}
                  </span>
                ) : null}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export type AdminStatItem = {
  label: string;
  value: string | number;
  hint?: string;
  Icon: ComponentType<{ className?: string }>;
  tone?: "gold" | "emerald" | "rose" | "blue";
};

const STAT_TONES: Record<NonNullable<AdminStatItem["tone"]>, string> = {
  gold: "bg-gold/14 text-gold-deep dark:bg-gold/15 dark:text-gold-soft",
  emerald: "bg-emerald-500/12 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300",
  rose: "bg-rose/10 text-rose dark:bg-rose/15 dark:text-rose-light",
  blue: "bg-sky-500/10 text-sky-700 dark:bg-sky-400/12 dark:text-sky-300",
};

export function AdminStatStrip({ items, className }: { items: AdminStatItem[]; className?: string }) {
  return (
    <div className={cn("mb-5 grid grid-cols-2 gap-2.5 lg:grid-cols-4", className)}>
      {items.map((item, index) => (
        <article
          key={item.label}
          className="flex min-w-0 items-center gap-[0.65rem] min-h-19 p-3 border border-navy/8 rounded-[18px] bg-paper/88 shadow-[0_16px_35px_-30px_rgba(14,42,71,0.45)] backdrop-blur-[14px] transition-[transform,border-color] duration-260 ease-[cubic-bezier(.25,.1,.25,1)] hover:-translate-y-0.5 hover:border-gold/34 dark:border-gold-soft/13 dark:bg-[rgba(16,43,70,0.62)] dark:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.8)] animate-admin-reveal motion-reduce:animate-none"
          style={{ animationDelay: `${Math.min(index * 55, 220)}ms` }}
        >
          <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl", STAT_TONES[item.tone ?? "gold"])}>
            <item.Icon className="size-4" />
          </span>
          <div className="min-w-0">
            <p className="truncate text-[10px] font-black text-navy/45 dark:text-wheat/65">{item.label}</p>
            <p className="mt-0.5 text-base font-black text-navy dark:text-ivory sm:text-lg">
              {typeof item.value === "number" ? toFaDigits(item.value) : item.value}
            </p>
            {item.hint ? <p className="truncate text-[9px] font-bold text-navy/35 dark:text-wheat/45">{item.hint}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}
