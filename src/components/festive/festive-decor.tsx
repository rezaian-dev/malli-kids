import { cn } from "@/lib/utils";

const STARS = [
  { top: "18%", left: "9%", size: "size-1", delay: "0s" },
  { top: "64%", left: "17%", size: "size-1.5", delay: ".6s" },
  { top: "30%", left: "38%", size: "size-1", delay: "1.1s" },
  { top: "72%", left: "62%", size: "size-1", delay: ".3s" },
  { top: "22%", left: "78%", size: "size-1.5", delay: ".9s" },
  { top: "56%", left: "90%", size: "size-1", delay: "1.4s" },
];

export function FestiveDecor() {
  return (
    <>
      {/* dotted gold texture */}
      <span
        className="pointer-events-none absolute inset-0 opacity-[0.12]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* floating glow orbs */}
      <span
        className={cn(
          "animate-floaty pointer-events-none absolute -inset-s-12 top-1/2 size-40 -translate-y-1/2 rounded-full blur-3xl motion-reduce:animate-none",
          "bg-gold/20",
        )}
      />
      <span
        className={cn(
          "animate-floaty-slow pointer-events-none absolute -inset-e-8 -top-8 size-32 rounded-full blur-2xl motion-reduce:animate-none",
          "bg-gold-glow/15",
        )}
      />
      {/* diagonal shine sweep */}
      <span
        className={cn(
          "animate-shimmer pointer-events-none absolute -inset-x-1/4 inset-y-0 w-1/3 -skew-x-12 motion-reduce:animate-none",
          "bg-linear-to-r from-transparent via-white/12 to-transparent",
        )}
      />
      {/* twinkling stars */}
      {STARS.map((s) => (
        <span
          key={`${s.top}-${s.left}`}
          className={cn(
            "animate-twinkle pointer-events-none absolute motion-reduce:animate-none",
            s.size,
            "bg-gold-light shadow-gold/50 rounded-full shadow-[0_0_8px_1px]",
          )}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
      {/* gold hairline at the bottom edge */}
      <span
        className={cn(
          "pointer-events-none absolute inset-x-0 bottom-0 h-px",
          "via-gold/60 bg-linear-to-l from-transparent to-transparent",
        )}
      />
    </>
  );
}
