"use client";

import { useEffect, useState } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  CircleCheckIcon,
  InfoIcon,
  TriangleAlertIcon,
  OctagonXIcon,
  Loader2Icon,
} from "lucide-react";

import { useTheme } from "next-themes";

// 🍞 One brand-consistent toast style for the whole app: a start-edge accent
// stripe + icon tint + tinted background wash + colored glow per type (same
// emerald/rose/gold/sky families the admin tables already use for status),
// everything else — shape, base shadow, type — shared. `!` wins the few
// properties sonner's own injected stylesheet also sets (padding, gap,
// alignment, description color); no `!` needed elsewhere.
// The gold sheen hairline along the top edge echoes the same accent line
// used on the admin header and brand logo underline.
// `relative` (not `overflow-hidden`) contains the sheen line — the close
// button is meant to poke past the border on the corner, so the card can't
// clip its own overflow.
//
// Both the background wash and the glow key off one `--toast-accent` custom
// property (set per type below) instead of duplicating a gradient per type:
// unset toasts (default/loading) fall through to the gold/navy-deep fallback
// baked into these two rules, so only types that want a *different* accent
// need to set the variable at all.
const TOAST_BASE =
  "!items-start gap-3 rounded-2xl border !py-3.5 !px-4 relative " +
  "[--normal-bg:linear-gradient(160deg,var(--popover)_0%,color-mix(in_srgb,var(--popover)_80%,var(--toast-accent,var(--color-gold-pale)))_100%)] " +
  "dark:[--normal-bg:linear-gradient(160deg,var(--popover)_0%,color-mix(in_srgb,var(--popover)_73%,var(--toast-accent,var(--color-navy-deep)))_100%)] " +
  "shadow-[0_20px_45px_-24px_rgba(14,42,71,0.35),0_0_30px_-8px_color-mix(in_srgb,var(--toast-accent,var(--color-gold))_45%,transparent)] " +
  "dark:shadow-[0_22px_55px_-26px_rgba(0,0,0,0.85),0_0_34px_-6px_color-mix(in_srgb,var(--toast-accent,var(--color-gold))_55%,transparent)] " +
  "before:pointer-events-none before:absolute before:inset-x-4 before:top-0 before:h-px " +
  "before:bg-linear-to-r before:from-transparent before:via-gold/55 before:to-transparent";

const TOAST_ACCENT = {
  default: "border-s-4 !border-s-navy/25 dark:!border-s-gold/35",
  success:
    "border-s-4 !border-s-emerald-500/70 [--toast-accent:var(--color-emerald-500)] " +
    "[&_[data-icon]_svg]:!text-emerald-600 dark:[&_[data-icon]_svg]:!text-emerald-400",
  error:
    "border-s-4 !border-s-rose/70 [--toast-accent:var(--color-rose)] " +
    "[&_[data-icon]_svg]:!text-rose dark:[&_[data-icon]_svg]:!text-rose-light",
  warning:
    "border-s-4 !border-s-gold/70 [--toast-accent:var(--color-gold-glow)] " +
    "[&_[data-icon]_svg]:!text-gold-deep dark:[&_[data-icon]_svg]:!text-gold-soft",
  info:
    "border-s-4 !border-s-sky-500/70 [--toast-accent:var(--color-sky-500)] " +
    "[&_[data-icon]_svg]:!text-sky-600 dark:[&_[data-icon]_svg]:!text-sky-400",
};

export function Toaster(props: ToasterProps) {
  const [on, setOn] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => setOn(true), []);
  if (!on) return null;

  return (
    <Sonner
      theme={resolvedTheme === "dark" ? "dark" : "light"}
      dir="rtl"
      position="bottom-right"
      className="toaster group"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: TOAST_BASE,
          default: TOAST_ACCENT.default,
          success: TOAST_ACCENT.success,
          error: TOAST_ACCENT.error,
          warning: TOAST_ACCENT.warning,
          info: TOAST_ACCENT.info,
          icon: "mt-0.5",
          title: "!text-[13px] font-black tracking-tight",
          description:
            "!mt-0.5 !text-[11px] font-bold !text-navy/60 dark:!text-wheat/70",
          closeButton:
            "hover:!border-gold hover:!text-gold-deep dark:hover:!text-gold-soft transition-colors",
          actionButton:
            "!rounded-full !bg-gold !px-3 !font-black !text-navy-deep hover:!bg-gold-light",
          cancelButton:
            "!rounded-full !bg-navy/8 !font-bold !text-inherit dark:!bg-white/10",
        },
      }}
      style={
        {
          // 🍞 `--normal-bg` is set per-toast in `TOAST_BASE`/`TOAST_ACCENT`
          // above (it needs to vary by toast type); this only covers the
          // theme-invariant bits.
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius-2xl)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
}
