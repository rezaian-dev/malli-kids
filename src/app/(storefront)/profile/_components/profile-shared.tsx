import { Loader2 } from "lucide-react";

export const PROFILE_CARD =
  "mt-5 space-y-5 rounded-[24px] border border-navy/10 bg-white p-5 dark:border-gold/35 dark:bg-dusk sm:p-7";

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
        <span className="grid size-10 place-items-center rounded-2xl bg-gold/15 text-gold">
          <Loader2 className="size-5 animate-spin" />
        </span>
        <div>
          <h2 className="text-lg font-black text-navy dark:text-linen">{title}</h2>
          <p className="mt-1 text-xs text-navy/50 dark:text-wheat">{text}</p>
        </div>
      </div>
      <div className="space-y-3">
        <div className="h-12 rounded-2xl bg-navy/4 dark:bg-white/4" />
        <div className="h-24 rounded-2xl bg-navy/4 dark:bg-white/4" />
        <div className="h-12 rounded-2xl bg-navy/4 dark:bg-white/4" />
      </div>
    </section>
  );
}
