

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
          backgroundImage: "radial-gradient(circle at 1px 1px, var(--color-gold) 1px, transparent 0)",
          backgroundSize: "22px 22px",
        }}
      />
      {/* floating glow orbs */}
      <span className="animate-floaty motion-reduce:animate-none pointer-events-none absolute -inset-s-12 top-1/2 size-40 -translate-y-1/2 rounded-full bg-gold/20 blur-3xl" />
      <span className="animate-floaty-slow motion-reduce:animate-none pointer-events-none absolute -inset-e-8 -top-8 size-32 rounded-full bg-gold-glow/15 blur-2xl" />
      {/* diagonal shine sweep */}
      <span className="animate-shimmer motion-reduce:animate-none pointer-events-none absolute inset-y-0 -inset-x-1/4 w-1/3 -skew-x-12 bg-linear-to-r from-transparent via-white/12 to-transparent" />
      {/* twinkling stars */}
      {STARS.map((s) => (
        <span
          key={`${s.top}-${s.left}`}
          className={`animate-twinkle motion-reduce:animate-none pointer-events-none absolute ${s.size} rounded-full bg-gold-light shadow-[0_0_8px_1px] shadow-gold/50`}
          style={{ top: s.top, left: s.left, animationDelay: s.delay }}
        />
      ))}
      {/* gold hairline at the bottom edge */}
      <span className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-linear-to-l from-transparent via-gold/60 to-transparent" />
    </>
  );
}
