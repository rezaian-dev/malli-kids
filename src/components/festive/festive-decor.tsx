import { cn } from "@/lib/utils";

const STARS = [
  { top: "16%", left: "7%", size: "size-1", delay: "0s" },
  { top: "62%", left: "14%", size: "size-1.5", delay: ".6s" },
  { top: "28%", left: "33%", size: "size-1", delay: "1.1s" },
  { top: "70%", left: "48%", size: "size-1", delay: ".3s" },
  { top: "20%", left: "64%", size: "size-1.5", delay: ".9s" },
  { top: "58%", left: "81%", size: "size-1", delay: "1.4s" },
  { top: "36%", left: "22%", size: "size-1", delay: "1.7s" },
  { top: "66%", left: "91%", size: "size-1.5", delay: ".45s" },
];

/** ✨ Layered premium decor for the festival strip — a static texture plus
 *  slow ambient motion only (everything is `motion-reduce`-gated and
 *  absolutely positioned inside an `overflow-hidden` frame, so it can never
 *  shift layout). `tone` matches the branch background: gold campaign strips
 *  get light decor, navy/night strips get gold decor. */
export function FestiveDecor({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const light = tone === "light";
  return (
    <>
      {/* dotted texture */}
      <span
        className={cn(
          "pointer-events-none absolute inset-0",
          light ? "opacity-[0.22]" : "opacity-[0.12]",
        )}
        style={{
          backgroundImage: light
            ? "radial-gradient(circle at 1px 1px, rgb(255 255 255 / 0.9) 1px, transparent 0)"
            : "radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* soft top sheen */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-7 bg-linear-to-b to-transparent",
          light ? "from-white/30" : "from-white/10",
        )}
      />
      {/* floating glow orbs */}
      <span
        className={cn(
          "animate-floaty pointer-events-none absolute -inset-s-12 top-1/2 size-44 -translate-y-1/2 rounded-full blur-3xl motion-reduce:animate-none",
          light ? "bg-white/25" : "bg-gold/20",
        )}
      />
      <span
        className={cn(
          "animate-floaty-slow pointer-events-none absolute -inset-e-8 -top-10 size-36 rounded-full blur-2xl motion-reduce:animate-none",
          light ? "bg-white/20" : "bg-gold-glow/15",
        )}
      />
      {/* diagonal shine sweep */}
      <span
        className={cn(
          "animate-shimmer pointer-events-none absolute -inset-x-1/4 inset-y-0 w-1/4 -skew-x-12 motion-reduce:animate-none",
          "bg-linear-to-r from-transparent to-transparent",
          light ? "via-white/40" : "via-white/12",
        )}
      />
      {/* twinkling stars */}
      {STARS.map((s) => (
        <span
          key={`${s.top}-${s.left}`}
          className={cn(
            "animate-twinkle pointer-events-none absolute rounded-full motion-reduce:animate-none",
            s.size,
            light
              ? "bg-white shadow-[0_0_8px_1px_rgb(255_255_255/0.6)]"
              : "bg-gold-light shadow-gold/50 shadow-[0_0_8px_1px]",
          )}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
      {/* edge vignettes */}
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0 w-28 bg-linear-to-r to-transparent",
          light ? "from-navy-deep/10" : "from-black/25",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-y-0 right-0 w-28 bg-linear-to-l to-transparent",
          light ? "from-navy-deep/10" : "from-black/25",
        )}
      />
      {/* gold hairline at the bottom edge */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-l from-transparent to-transparent",
          light ? "via-white/60" : "via-gold/60",
        )}
      />
    </>
  );
}
