"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const FLOAT = {
  animate: { y: [0, -8, 0] },
  transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const },
};

const RING_PULSE = {
  animate: { opacity: [0.35, 0.7, 0.35], scale: [1, 1.08, 1] },
  transition: { duration: 3.4, repeat: Infinity, ease: "easeInOut" as const },
};

/**
 * 🌱 Shown instead of a broken/blank grid when a section's collection is
 * genuinely empty (no products/articles yet) — a designed "coming soon",
 * never a padded-with-fixtures fake shelf. Ambient-loop motion only (no
 * mount fade), so it never flashes on server-rendered pages.
 */
// 🎨 "light" sits on the paper/cream sections; "dark" sits on a navy
// section (Handmade) where light-on-light text would vanish.
const TONE = {
  light: {
    card: "border-navy/10 bg-white/70 dark:border-gold/20 dark:bg-dusk-alt/40",
    badge: "bg-sand text-gold dark:bg-navy-mid",
    title: "text-navy dark:text-ivory",
    desc: "text-navy/70 dark:text-wheat",
  },
  dark: {
    card: "border-white/12 bg-white/6",
    badge: "bg-white/10 text-gold-light",
    title: "text-white",
    desc: "text-cream/60",
  },
} as const;

export function EmptyState({
  icon,
  title,
  description,
  action,
  tone = "light",
  className,
}: {
  // 🪶 A rendered icon element (e.g. `<Newspaper className="size-6" />`),
  // not the component itself — a bare component reference can't cross the
  // server→client boundary as a prop, only its rendered output can.
  icon: ReactNode;
  title: string;
  description?: string;
  action?: { href: string; label: string };
  tone?: keyof typeof TONE;
  className?: string;
}) {
  const t = TONE[tone];

  return (
    <div
      className={cn(
        "relative grid place-items-center overflow-hidden rounded-3xl border px-6 py-14 text-center sm:py-16",
        t.card,
        className,
      )}
    >
      <div className="relative mb-5 grid size-16 place-items-center">
        <motion.span
          aria-hidden
          className="absolute inset-0 rounded-full bg-gold/20"
          animate={RING_PULSE.animate}
          transition={RING_PULSE.transition}
        />
        <motion.span
          className={cn(
            "relative grid size-14 place-items-center rounded-full",
            t.badge,
          )}
          animate={FLOAT.animate}
          transition={FLOAT.transition}
        >
          {icon}
        </motion.span>
      </div>
      <p className={cn("max-w-sm text-sm font-black sm:text-base", t.title)}>
        {title}
      </p>
      {description ? (
        <p className={cn("mt-2 max-w-sm text-xs leading-6 sm:text-sm", t.desc)}>
          {description}
        </p>
      ) : null}
      {action ? (
        <Link
          href={action.href}
          className="text-gold mt-5 inline-flex items-center gap-1.5 text-xs font-black hover:underline sm:text-sm"
        >
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}
