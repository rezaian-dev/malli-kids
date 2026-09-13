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
  // Label only — the fallback shows a person-icon, not an initial
  letter: string;
  className?: string;
}) {
  return (
    <Avatar
      className={cn(
        "ring-gold dark:ring-gold-soft ring-2",
        // Always-on glow, baked into the shared Face so fallback and hydrated button stay identical
        "shadow-[0_2px_14px_-6px_rgba(193,147,87,.75)]",
        "dark:shadow-[0_2px_14px_-6px_rgba(232,197,122,.5)]",
        // Expanding hover halo — inert outside the trigger's `group`
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

// Keep the trigger and loading placeholder the same size.
export const TRIGGER_SHELL = cn(
  CLUSTER_H,
  ICON_W,
  "group shrink-0 cursor-pointer rounded-full p-0",
  "motion-safe:hover:translate-y-0",
  "focus-visible:ring-gold/60 focus-visible:ring-2",
);

// Shadow-only hover feedback — transforms would "tick" on refresh
export function AccountIcon() {
  return (
    <span
      className="border-gold from-navy to-navy-mid relative flex size-full items-center justify-center rounded-full border-2 bg-linear-to-br shadow-[0_2px_14px_-6px_rgba(193,147,87,.75)] transition-shadow duration-300 group-hover:shadow-[0_4px_20px_-6px_rgba(193,147,87,.9)] dark:border-gold-soft dark:from-dusk-alt dark:to-dusk dark:shadow-[0_2px_14px_-6px_rgba(232,197,122,.5)]"
    >
      <UserRound className="text-gold-soft size-[58%]" strokeWidth={2.25} />
    </span>
  );
}
