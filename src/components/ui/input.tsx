import * as React from "react";

import { FIELD_FOCUS } from "@/lib/field";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 appearance-none rounded-lg px-2.5 py-1 file:inline-flex file:h-6 file:border-0",
        "border-input placeholder:text-muted-foreground file:text-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 border bg-transparent text-base shadow-none transition-[color,box-shadow,border-color] duration-200 outline-none file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        FIELD_FOCUS,
        className,
      )}
      {...props}
    />
  );
}

export { Input };
