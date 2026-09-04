"use client";

import { useId } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import { FILTER_LABEL } from "./admin-filter-bar";

export type AdminFilterOption = {
  value: string;
  label: string;
  count?: number;
};

/** 🎚️ One labeled dropdown filter, dropped inside `<AdminFilterBar>`. */
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
      <label htmlFor={id} className={FILTER_LABEL}>
        {label}
      </label>
      <Select value={value} onValueChange={onValueChange} dir="rtl">
        <SelectTrigger
          id={id}
          className="dark:bg-navy-deep/45 h-11 rounded-xl bg-white shadow-none"
          aria-label={label}
        >
          <SelectValue placeholder={placeholder ?? label} />
        </SelectTrigger>
        <SelectContent align="start">
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <span className="flex w-full items-center justify-between gap-4">
                <span>{option.label}</span>
                {typeof option.count === "number" ? (
                  <span
                    className={cn(
                      "rounded-md px-1.5 py-0.5 text-[10px]",
                      "bg-navy/6 text-navy/70",
                      "dark:text-wheat dark:bg-white/8",
                    )}
                  >
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
