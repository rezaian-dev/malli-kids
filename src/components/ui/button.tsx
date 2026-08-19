"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Slot } from "radix-ui";
import { motion, type HTMLMotionProps } from "motion/react";

import { cn } from "@/lib/utils";

// 🪄 `asChild` needs a motion-capable version of Radix's polymorphic Slot —
// `motion.create()` wraps any ref-forwarding component so it can drive the
// SAME spring gestures below on whatever element `asChild` renders as
// (`<Link>`, `<a>`, …), not just a plain `<button>`.
const MotionSlot = motion.create(Slot.Root);

// 🎬 Interaction is real spring physics now (whileHover/whileTap below), not
// CSS transitions — a soft rise on hover, a snappy press-down on click, with
// actual bounce. `prefers-reduced-motion` is handled once, globally, by
// `MotionProvider` (`reducedMotion="user"` — see components/motion), so no
// manual motion-safe:/motion-reduce: transform classes are needed here.
const HOVER_SPRING = { type: "spring", stiffness: 420, damping: 24 } as const;
const TAP_SPRING = { type: "spring", stiffness: 500, damping: 30 } as const;

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-lg border border-transparent bg-clip-padding text-sm font-medium whitespace-nowrap transition-[color,background-color,border-color,box-shadow] duration-200 ease-out outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground hover:bg-primary/80 motion-safe:hover:shadow-lg motion-safe:hover:shadow-primary/20",
        outline:
          "border-border bg-background hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_5%)] aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-muted hover:text-foreground aria-expanded:bg-muted aria-expanded:text-foreground dark:hover:bg-muted/50",
        destructive:
          "bg-destructive/10 text-destructive hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:bg-destructive/20 dark:hover:bg-destructive/30 dark:focus-visible:ring-destructive/40",
        link: "text-primary underline-offset-4 hover:underline",
        navy: "rounded-full bg-navy text-ivory hover:bg-navy-mid motion-safe:not-aria-expanded:hover:shadow-lg motion-safe:not-aria-expanded:hover:shadow-navy/25 dark:bg-gold-soft dark:text-navy-deep dark:hover:bg-gold-glow dark:motion-safe:not-aria-expanded:hover:shadow-gold/25",
        gold: "rounded-full bg-gold text-navy-deep hover:bg-gold-light motion-safe:not-aria-expanded:hover:shadow-lg motion-safe:not-aria-expanded:hover:shadow-gold/30",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        pill: "h-12 gap-2 rounded-full px-6 font-black",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pe-1.5 has-data-[icon=inline-start]:ps-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pe-2 has-data-[icon=inline-start]:ps-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  disabled,
  ...props
}: HTMLMotionProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? MotionSlot : motion.button;

  // 🧭 Dropdown/menu triggers (`aria-haspopup`) skip the press-down — that
  // gesture reads as "activated", which a trigger only is once its panel
  // opens; while open (`aria-expanded`) the hover-lift also stays off so the
  // trigger doesn't float above its own open panel.
  const isPopupTrigger = props["aria-haspopup"] != null;
  const isExpanded =
    props["aria-expanded"] === true || props["aria-expanded"] === "true";

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      disabled={disabled}
      className={cn(buttonVariants({ variant, size, className }))}
      whileHover={
        !disabled && !isExpanded
          ? { y: -2, transition: HOVER_SPRING }
          : undefined
      }
      whileTap={
        !disabled && !isPopupTrigger
          ? { scale: 0.97, y: 0, transition: TAP_SPRING }
          : undefined
      }
      {...props}
    />
  );
}

export { Button, buttonVariants };
