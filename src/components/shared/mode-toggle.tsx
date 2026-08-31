"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    const isDark =
      typeof document === "undefined"
        ? resolvedTheme === "dark"
        : document.documentElement.classList.contains("dark");

    setTheme(isDark ? "light" : "dark");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="تغییر حالت روشن و تاریک"
      className={cn("group relative", className)}
    >
      <Sun className="size-5 scale-0 -rotate-90 transition-transform duration-300 dark:scale-100 dark:rotate-0" />
      <Moon className="absolute size-5 scale-100 rotate-0 transition-transform duration-300 dark:scale-0 dark:rotate-90" />
    </Button>
  );
}
