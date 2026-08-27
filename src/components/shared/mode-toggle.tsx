"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * سوییچ تم — با یک کلیک بین روشن و تاریک جابه‌جا می‌شود (بدون منوی کشویی).
 * وضعیت را next-themes نگه می‌دارد؛ هیچ state دستی اینجا نیست.
 */
export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      aria-label="تغییر حالت روشن و تاریک"
      className={cn("group relative", className)}
    >
      <Sun className="size-5 scale-0 -rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
      <Moon className="absolute size-5 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:rotate-90" />
    </Button>
  );
}
