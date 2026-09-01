import * as React from "react";

import { FIELD_FOCUS } from "@/lib/field";
import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "flex field-sizing-content min-h-16 w-full appearance-none rounded-lg px-2.5 py-2",
        "border-input placeholder:text-muted-foreground aria-invalid:border-destructive aria-invalid:ring-destructive/20 border bg-transparent text-base shadow-none transition-[color,box-shadow,border-color] duration-200 outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm",
        "dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
        FIELD_FOCUS,
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
