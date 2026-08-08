import { Heart, Sparkles } from "lucide-react";
import { ABOUT } from "@/lib/data/pages";
import { cn } from "@/lib/utils";

export function ClosingQuote() {
  const { studio } = ABOUT;

  return (
    <section className="container mx-auto mb-14 max-w-5xl px-3 sm:px-5 lg:px-7">
      <div
        className={cn(
          "relative overflow-hidden rounded-[28px] border px-6 py-10 text-center sm:px-12 sm:py-14",
          "border-gold/30 bg-white/90 shadow-[0_18px_40px_-28px_rgba(14,42,71,.28)]",
          "dark:border-gold/35 dark:bg-slate/50",
        )}
      >
        <span
          className={cn(
            "animate-orn-spin pointer-events-none absolute inset-e-[8%] top-[18%] hidden select-none opacity-[0.07] sm:block",
            "text-gold",
          )}
          aria-hidden
        >
          <Sparkles className="size-24" />
        </span>
        <span className="bg-gold/15 text-gold mx-auto flex size-12 items-center justify-center rounded-2xl">
          <Heart className="size-6" />
        </span>
        <p className="text-navy dark:text-ivory relative mt-5 text-lg leading-9 font-black sm:text-xl">
          {studio.closing}
          <br className="hidden sm:block" /> {studio.closingBold}
        </p>
        <span
          className="from-transparent via-gold to-transparent mx-auto mt-6 block h-px w-24 bg-linear-to-l"
          aria-hidden
        />
        <p className="text-brown-mid dark:text-gold mt-6 text-sm font-black tracking-widest sm:text-base">
          {studio.tagline} 🤍
        </p>
      </div>
    </section>
  );
}
