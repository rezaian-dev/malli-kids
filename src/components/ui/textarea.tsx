import * as React from "react";

import { cn } from "@/lib/utils";

function Textarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        "border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 disabled:bg-input/50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 flex field-sizing-content min-h-16 w-full rounded-lg border bg-white/80 px-2.5 py-2 text-base shadow-[0_12px_36px_-18px_rgba(14,42,71,0.28),0_0_24px_-12px_rgba(193,147,87,0.22)] backdrop-blur-md transition-colors outline-none focus-visible:ring-3 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:ring-3 md:text-sm dark:bg-white/5 dark:shadow-[0_14px_40px_-18px_rgba(0,0,0,0.45),0_0_24px_-12px_rgba(193,147,87,0.18)]",
        className,
      )}
      {...props}
    />
  );
}

export { Textarea };
