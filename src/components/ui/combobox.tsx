"use client";

import * as React from "react";
import { Check, ChevronDown, Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { FIELD_FOCUS } from "@/lib/field";
import { cn } from "@/lib/utils";

export type ComboboxProps = {
  value: string;
  onChange: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
  options: readonly string[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  id?: string;
  className?: string;
  "aria-required"?: boolean;
  "aria-invalid"?: boolean;
  "aria-describedby"?: string;
};

/** 🔎 A searchable, RTL-aware select — Radix `Popover` + a filtered list,
 *  no extra dependency. Full keyboard nav: ↑/↓ to move, Enter to pick,
 *  Esc to close. */
export function Combobox({
  value,
  onChange,
  onOpenChange,
  options,
  placeholder = "انتخاب کنید",
  searchPlaceholder = "جستجو…",
  emptyText = "نتیجه‌ای یافت نشد.",
  id,
  className,
  ...aria
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  const searchRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    const q = query.trim();
    return q ? options.filter((o) => o.includes(q)) : options;
  }, [options, query]);

  function setOpenState(next: boolean) {
    setOpen(next);
    onOpenChange?.(next);
    if (!next) setQuery("");
    setActive(0);
  }

  function pick(city: string) {
    onChange(city);
    setOpenState(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[active]) pick(filtered[active]);
    } else if (e.key === "Escape") {
      setOpenState(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpenState}>
      <PopoverTrigger asChild>
        <button
          type="button"
          id={id}
          {...aria}
          className={cn(
            "group/combobox flex w-full cursor-pointer items-center justify-between gap-2 rounded-2xl border px-3.5",
            "border-navy/12 text-navy hover:border-gold/50 aria-invalid:border-destructive bg-white text-sm font-bold shadow-none transition-[color,box-shadow,border-color] duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50",
            FIELD_FOCUS,
            "dark:border-gold/25 dark:bg-navy-mid dark:text-ivory dark:hover:border-gold/50",
            !value && "text-navy/70 dark:text-wheat/70",
            className,
          )}
        >
          <span className="truncate">{value || placeholder}</span>
          <ChevronDown className="text-gold size-4 shrink-0 transition-transform duration-200 group-data-open/combobox:rotate-180" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) overflow-hidden p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          searchRef.current?.focus();
        }}
      >
        <div className="border-navy/10 dark:border-gold/15 flex items-center gap-2 border-b px-3">
          <Search className="text-gold size-4 shrink-0" />
          <input
            ref={searchRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            className="text-navy placeholder:text-navy/50 dark:text-ivory dark:placeholder:text-wheat/50 h-11 w-full bg-transparent text-sm font-semibold outline-none"
          />
        </div>

        <ul role="listbox" className="scrollbar-thin max-h-64 overflow-y-auto p-1">
          {filtered.length === 0 ? (
            <li className="text-navy/60 dark:text-wheat/60 px-3 py-6 text-center text-xs font-bold">
              {emptyText}
            </li>
          ) : (
            filtered.map((city, i) => (
              <li key={city}>
                <button
                  type="button"
                  role="option"
                  aria-selected={city === value}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => pick(city)}
                  className={cn(
                    "text-navy dark:text-ivory flex w-full cursor-pointer items-center justify-between rounded-xl px-3 py-2 text-sm font-bold",
                    i === active && "bg-gold/12 text-gold-deep dark:bg-gold/20 dark:text-gold-soft",
                    city === value && "text-gold-deep dark:text-gold-soft",
                  )}
                >
                  {city}
                  {city === value ? <Check className="size-4 shrink-0" /> : null}
                </button>
              </li>
            ))
          )}
        </ul>
      </PopoverContent>
    </Popover>
  );
}
