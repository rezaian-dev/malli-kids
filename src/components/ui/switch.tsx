"use client";

import * as React from "react";
import { Switch as SwitchPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default";
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border transition-all duration-300 outline-none",
        "data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-4 data-[size=sm]:w-7",
        "focus-visible:ring-3 focus-visible:ring-gold/40",
        
        "border-navy/15 bg-navy/10 dark:border-white/15 dark:bg-white/10",
        
        "data-[state=checked]:border-gold-deep/60",
        "data-[state=checked]:bg-linear-to-l data-[state=checked]:from-gold-deep data-[state=checked]:via-gold data-[state=checked]:to-gold-light",
        "data-[state=checked]:shadow-[0_0_16px_-2px_var(--color-gold)]",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block translate-x-0 rounded-full bg-white shadow-[0_1px_4px_rgba(14,42,71,.45)] ring-1 ring-gold-deep/25 transition-transform duration-200",
          "group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3",
          // 🔁 Let the thumb travel exactly one width in each direction.
          "ltr:data-[state=checked]:translate-x-full rtl:data-[state=checked]:-translate-x-full",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
