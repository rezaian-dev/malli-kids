import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const PROFILE_CARD = cn(
  "mt-5 space-y-5 rounded-3xl p-5 sm:p-7",
  "border border-navy/10 bg-white",
  "dark:border-gold/35 dark:bg-dusk",
);

const SKELETON_BAR = "rounded-2xl bg-navy/4 dark:bg-white/4";

// 🪶 Small skeleton while each profile panel hydrates.
export function ProfilePanelFallback({
  title,
  text = "در حال آماده‌سازی این بخش…",
}: {
  title: string;
  text?: string;
}) {
  return (
    <section className={PROFILE_CARD} aria-live="polite" aria-busy="true">
      <div className="flex items-center gap-3">
        <span className="bg-gold/15 text-gold grid size-10 place-items-center rounded-2xl">
          <Loader2 className="size-5 animate-spin" />
        </span>
        <div>
          <h2 className="text-navy dark:text-linen text-lg font-black">
            {title}
          </h2>
          <p className="text-navy/70 dark:text-wheat mt-1 text-xs">{text}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className={cn("h-12", SKELETON_BAR)} />
        <div className={cn("h-24", SKELETON_BAR)} />
        <div className={cn("h-12", SKELETON_BAR)} />
      </div>
    </section>
  );
}
