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
    <Avatar className={cn("ring-gold dark:ring-gold-soft ring-2", className)}>
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
// up a frame later) with a subtle scale + glow that only plays on a real
// pointer-driven hover, never on mount.
export const TRIGGER_SHELL = cn(
  CLUSTER_H,
  "group shrink-0 cursor-pointer gap-1.5 rounded-full px-1 sm:pe-3 md:pe-1 lg:pe-3",
  "motion-safe:hover:translate-y-0 motion-safe:hover:scale-[1.03] motion-safe:active:scale-[0.97]",
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
