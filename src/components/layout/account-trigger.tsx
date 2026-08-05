import { UserRound } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CLUSTER_H, ICON_W } from "./header-styles";

export function Face({
  src,
  letter,
  className,
}: {
  src?: string;
  /** Accessible label only now — no picture means a clean person-icon
   *  silhouette, not a text initial (see `AvatarFallback` below). */
  letter: string;
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        "ring-gold dark:ring-gold-soft ring-2",
        // ✨ A quiet, always-on glow (not just on hover) so the avatar reads
        // as the header's one "premium" accent — cheap (a static box-shadow,
        // no extra DOM) and, since it's baked into this shared `Face`, it's
        // identical in the Suspense fallback and the hydrated button: never
        // something that "turns on" a beat after paint.
        "shadow-[0_2px_14px_-6px_rgba(193,147,87,.75)]",
        "dark:shadow-[0_2px_14px_-6px_rgba(232,197,122,.5)]",
        // 🌀 Hover halo: a ring that expands outward and fades, echoing the
        // trigger's gold ring instead of scaling the button itself. Only
        // ever fires nested under `TRIGGER_SHELL`'s `group` (hovering it) —
        // the larger `Face` rendered inside the open dropdown panel has no
        // such ancestor, so it stays inert there.
        "before:border-gold before:absolute before:inset-0 before:rounded-full before:border-2 before:opacity-0",
        "motion-safe:group-hover:before:animate-ring-pulse dark:before:border-gold-soft",
        className,
      )}
    >
      <AvatarImage src={src} alt="" />
      <AvatarFallback className="from-navy to-navy-mid dark:from-dusk-alt dark:to-dusk bg-linear-to-br">
        <UserRound className="text-gold-soft size-1/2" strokeWidth={2.25} />
        <span className="sr-only">{letter}</span>
      </AvatarFallback>
    </Avatar>
  );
}

// 🪪 The account button's shell — shared by the real (interactive) dropdown
// trigger in `user-account-menu.tsx` and the Suspense placeholder in
// `user-menu.tsx`, so swapping the lazy-loaded dropdown chunk in never
// visibly moves anything: only its click-ability "wakes up" a moment later.
// 🎯 Icon-only by design (no photo, no name, no chevron — see `AccountIcon`
// below): sized off the same `CLUSTER_H`/`ICON_W` tokens as the header's
// other icon buttons (cart, notices) so it sits in that same visual rhythm
// instead of the wider name+chevron pill it used to be.
// 🖱️ Overrides the base `Button`'s generic `hover:-translate-y-0.5` lift
// (which — since the cursor is usually still parked on this trigger right
// where the previous page left it — was the "tick" on every refresh: hover
// styles apply instantly on load, so the transition animated the button
// up a frame later) with a static position: the button itself never resizes
// or shifts. (Its `active:scale` press feedback is already excluded here —
// it's gated on `not-aria-[haspopup]`, and Radix's `DropdownMenuTrigger`
// stamps `aria-haspopup` on this button — so nothing needs undoing there.)
// The hover cue instead lives on `AccountIcon`'s own ring-pulse halo.
export const TRIGGER_SHELL = cn(
  CLUSTER_H,
  ICON_W,
  "group shrink-0 cursor-pointer rounded-full p-0",
  "motion-safe:hover:translate-y-0",
  "focus-visible:ring-gold/60 focus-visible:ring-2",
);

// ✨ The trigger's entire content now: a navy medallion behind a plain
// person-glyph — no avatar photo, no initial, no name, no chevron.
// 🚫 Deliberately no idle/ambient animation (no "breathing" glow, no
// mount-in pop): this exact node gets thrown away and recreated once,
// a beat after first paint, when the Suspense fallback in `user-menu.tsx`
// swaps for the real (lazy-loaded) button. Any animation that plays
// automatically on mount would restart from scratch at that swap — a
// visible twitch/jump on every single refresh. All motion here is
// hover-triggered instead (scale, icon lift, the ring-pulse halo below),
// same rule the old avatar's glow followed — see the static box-shadow
// note on `Face` above.
export function AccountIcon() {
  return (
    <span
      className={cn(
        "border-gold from-navy to-navy-mid relative flex size-full items-center justify-center rounded-full border-2 bg-linear-to-br",
        "shadow-[0_2px_14px_-6px_rgba(193,147,87,.75)] transition-[transform,box-shadow] duration-300",
        "group-hover:scale-[1.08] group-hover:shadow-[0_4px_20px_-6px_rgba(193,147,87,.9)]",
        "before:border-gold before:absolute before:inset-0 before:rounded-full before:border-2 before:opacity-0",
        "motion-safe:group-hover:before:animate-ring-pulse",
        "dark:border-gold-soft dark:from-dusk-alt dark:to-dusk dark:shadow-[0_2px_14px_-6px_rgba(232,197,122,.5)] dark:before:border-gold-soft",
      )}
    >
      <UserRound
        className="text-gold-soft size-[58%] transition-transform duration-300 group-hover:-translate-y-0.5"
        strokeWidth={2.25}
      />
    </span>
  );
}
