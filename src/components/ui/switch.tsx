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
        "peer group/switch relative inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors outline-none",
        "data-[size=default]:h-6 data-[size=default]:w-11 data-[size=sm]:h-4 data-[size=sm]:w-7",
        "focus-visible:ring-3 focus-visible:ring-gold/40",
        // OFF — clearly visible neutral track in both themes
        "border-navy/20 bg-navy/15 dark:border-white/35 dark:bg-white/25",
        // ON — solid gold (Radix emits data-state="checked")
        "data-[state=checked]:border-gold data-[state=checked]:bg-gold",
        "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block translate-x-0 rounded-full bg-white shadow-md ring-0 transition-transform duration-200",
          "group-data-[size=default]/switch:size-5 group-data-[size=sm]/switch:size-3",
          // Thumb carries its own data-state. translate-x-full = 100% of the thumb's
          // width = exactly its travel for BOTH sizes; direction pinned per writing mode.
          "ltr:data-[state=checked]:translate-x-full rtl:data-[state=checked]:-translate-x-full",
          "dark:data-[state=checked]:bg-navy-deep",
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
