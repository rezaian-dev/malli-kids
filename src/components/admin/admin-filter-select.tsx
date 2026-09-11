"use client";

import { useId } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { FILTER_LABEL } from "./admin-filter-bar";

export type AdminFilterOption = {
  value: string;
  label: string;
  // 🔢 دیگر رندر نمی‌شود — Radix، محتوای همین SelectItem را عیناً در دکمهٔ
  // بستهٔ Select هم نمایش می‌داد، و عدد کنارِ برچسب باعث می‌شد متنِ دکمه در
  // عرضِ محدودش بشکند. همچنان اختیاری مانده تا صداکنندهٔ فعلی نشکند.
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
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
