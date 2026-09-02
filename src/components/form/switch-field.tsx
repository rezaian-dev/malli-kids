"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { useField } from "./use-field";

export function SwitchField({
  name,
  label,
  description,
  className,
}: {
  name: string;
  label: ReactNode;
  description?: ReactNode;
  className?: string;
}) {
  const { field } = useField(name);
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center justify-between gap-3 rounded-2xl border px-4 py-3 transition-colors",
        "border-navy/10 hover:border-gold/50",
        "dark:border-gold/20",
        className,
      )}
      data-field={name}
    >
      <span className="min-w-0">
        <span className="text-navy dark:text-ivory block text-sm font-black">
          {label}
        </span>
        {description ? (
          <span className="text-navy/70 dark:text-wheat block text-[11px] font-bold">
            {description}
          </span>
        ) : null}
      </span>
      <Switch
        checked={Boolean(field.value)}
        onCheckedChange={field.onChange}
        name={field.name}
        onBlur={field.onBlur}
      />
    </label>
  );
}
