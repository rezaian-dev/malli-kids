import * as React from "react";

import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input file:text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 h-8 w-full min-w-0 rounded-lg border bg-transparent px-2.5 py-1 text-base transition-[color,box-shadow,border-color] duration-200 outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium autofill:bg-transparent autofill:shadow-[0_0_0_1000px_var(--color-paper)_inset] autofill:[-webkit-text-fill-color:var(--color-navy)] focus-visible:ring-3 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm dark:autofill:shadow-[0_0_0_1000px_color-mix(in_srgb,var(--color-navy-deep)_60%,var(--color-dusk))_inset] dark:autofill:[-webkit-text-fill-color:var(--color-ivory)]",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
