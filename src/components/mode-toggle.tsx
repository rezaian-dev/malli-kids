"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/** سوییچ تم — الگوی رسمی shadcn/ui، بدون هیچ state دستی. */
export function ModeToggle({ className }: { className?: string }) {
  const { setTheme } = useTheme();

  return (
    <DropdownMenu dir="rtl">
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={className} aria-label="تغییر حالت روشن و تاریک">
          <Sun className="size-5 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
          <Moon className="absolute size-5 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="z-90">
        <DropdownMenuItem onSelect={() => setTheme("light")}>
          <Sun className="size-4 text-gold" /> روشن
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("dark")}>
          <Moon className="size-4 text-gold" /> تاریک
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => setTheme("system")}>سیستم</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
