"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ModeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  function toggleTheme() {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      aria-label="تغییر حالت روشن و تاریک"
      className={cn("group relative", className)}
    >
      <Sun
        className={cn(
          "size-5 scale-0 -rotate-90 transition-transform duration-300",
          "dark:scale-100 dark:rotate-0",
        )}
      />
      <Moon
        className={cn(
          "absolute size-5 scale-100 rotate-0 transition-transform duration-300",
          "dark:scale-0 dark:rotate-90",
        )}
      />
    </Button>
  );
}
