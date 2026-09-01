"use client";

import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function SliderArrow({
  direction,
  onClick,
  label,
  chevron = false,
  className,
  disabled,
}: {
  direction: "prev" | "next";
  onClick?: () => void;
  label: string;

  chevron?: boolean;
  className?: string;
  disabled?: boolean;
}) {
  const Icon = chevron
    ? direction === "prev"
      ? ChevronRight
      : ChevronLeft
    : direction === "prev"
      ? ArrowRight
      : ArrowLeft;

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "group inline-flex size-11 shrink-0 items-center justify-center rounded-full",
        "border-navy/10 text-navy border bg-white/90 backdrop-blur",
        "transition-all duration-300 ease-out",
        "hover:from-gold-deep hover:via-gold hover:to-gold-light hover:text-navy-deep hover:scale-110 hover:border-transparent hover:bg-linear-to-l",
        "hover:shadow-[0_12px_28px_-10px_var(--color-gold)]",
        "active:animate-arrow-ripple active:scale-90 active:duration-100",
        "disabled:pointer-events-none disabled:opacity-40",
        "focus-visible:outline-gold focus-visible:outline-2 focus-visible:outline-offset-2",
        "dark:border-gold/30 dark:bg-dusk-mid/80 dark:text-gold-light dark:hover:text-navy-deep",
        className,
      )}
    >
      <Icon
        className={cn(
          "size-4.5 transition-transform duration-300 group-active:scale-75",

          direction === "next"
            ? "group-hover:-translate-x-1"
            : "group-hover:translate-x-1",
        )}
      />
    </button>
  );
}
