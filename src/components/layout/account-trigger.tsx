import { ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { CLUSTER_H } from "./header-styles";

export function Face({
  src,
  letter,
  className,
}: {
  src?: string;
  letter: string;
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        "ring-gold dark:ring-gold-soft ring-2",
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
      <AvatarFallback className="bg-navy text-gold-soft dark:bg-dusk-alt font-black">
        {letter}
      </AvatarFallback>
    </Avatar>
  );
}

// 🪪 The account button's shell + content — shared by the real (interactive)
// dropdown trigger in `user-account-menu.tsx` and the Suspense placeholder in
// `user-menu.tsx`, so swapping the lazy-loaded dropdown chunk in never
// visibly moves or blinks anything: only the chevron's click-ability "wakes
// up" a moment later.
// 🖱️ Overrides the base `Button`'s generic `hover:-translate-y-0.5` lift
// (which — since the cursor is usually still parked on this trigger right
// where the previous page left it — was the "tick" on every refresh: hover
// styles apply instantly on load, so the transition animated the button
// up a frame later) with a static position: the button itself never resizes
// or shifts. (Its `active:scale` press feedback is already excluded here —
// it's gated on `not-aria-[haspopup]`, and Radix's `DropdownMenuTrigger`
// stamps `aria-haspopup` on this button — so nothing needs undoing there.)
// The hover cue instead lives on the avatar's ring-pulse halo, see `Face`.
export const TRIGGER_SHELL = cn(
  CLUSTER_H,
  "group shrink-0 cursor-pointer gap-1.5 rounded-full px-1 sm:pe-3 md:pe-1 lg:pe-3",
  "motion-safe:hover:translate-y-0",
  "border-gold/55 hover:border-gold bg-white hover:bg-white hover:shadow-[0_10px_24px_-14px_rgba(193,147,87,.7)]",
  "focus-visible:ring-gold/60 focus-visible:ring-2",
  "dark:border-gold/45 dark:bg-dusk dark:hover:border-gold dark:hover:bg-dusk dark:hover:shadow-[0_10px_24px_-14px_rgba(232,197,122,.35)]",
);

export function AccountFace({ avatar, first }: { avatar?: string; first: string }) {
  return (
    <>
      <Face
        src={avatar}
        letter={first.charAt(0)}
        className="size-7 text-xs sm:size-8"
      />
      <span
        className={cn(
          "hidden max-w-20 truncate min-[480px]:inline md:hidden lg:inline",
          "text-navy text-xs font-extrabold",
          "dark:text-linen",
        )}
      >
        {first}
      </span>
      <ChevronDown
        className={cn(
          "hidden size-3.5 min-[480px]:block md:hidden lg:block",
          "text-gold transition-transform",
          "group-data-open:rotate-180",
        )}
      />
    </>
  );
}
