const STARS = Array.from({ length: 30 }, (_, i) => i);
const DELAYS = [
  "[animation-delay:-.2s]",
  "[animation-delay:-.8s]",
  "[animation-delay:-1.4s]",
  "[animation-delay:-2s]",
  "[animation-delay:-2.6s]",
  "[animation-delay:-3.2s]",
];

export function BackgroundScene() {
  return (
    <div
      aria-hidden="true"
      className="bg-cream dark:bg-ink pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      {/* Light: a vivid, logo-inspired blend — navy·gold·cream with warm coral
          & sky accents, plus a soft golden ring echoing the brand mark. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_18%_16%,color-mix(in_srgb,var(--color-gold)_30%,transparent),transparent_48%),radial-gradient(ellipse_at_88%_8%,color-mix(in_srgb,var(--color-navy-soft)_22%,transparent),transparent_44%),radial-gradient(ellipse_at_86%_88%,color-mix(in_srgb,#f6cdc2_30%,transparent),transparent_46%),radial-gradient(ellipse_at_6%_86%,color-mix(in_srgb,#a9d4ec_26%,transparent),transparent_46%),radial-gradient(ellipse_at_50%_50%,color-mix(in_srgb,var(--color-cream)_58%,transparent),transparent_70%),linear-gradient(160deg,var(--color-paper-warm)_0%,var(--color-sand)_42%,var(--color-cream)_100%)] dark:hidden" />
      {/* Golden halo ring — a soft echo of the circular gold mark in the logo. */}
      <div className="border-gold/20 absolute -top-32 left-1/2 hidden size-168 -translate-x-1/2 rounded-full border-[1.5px] md:block dark:hidden" />
      <div className="border-gold/15 absolute -top-20 left-1/2 hidden size-136 -translate-x-1/2 rounded-full border md:block dark:hidden" />
      <div className="absolute -inset-e-40 top-10 hidden size-104 rounded-full bg-[radial-gradient(circle_at_40%_35%,color-mix(in_srgb,var(--color-gold)_22%,transparent),transparent_62%)] blur-2xl md:block dark:hidden" />
      <div className="absolute -inset-s-40 bottom-0 hidden size-96 rounded-full bg-[radial-gradient(circle_at_45%_60%,color-mix(in_srgb,var(--color-navy-soft)_18%,transparent),transparent_62%)] blur-2xl md:block dark:hidden" />
      {/* Dark: a completely different midnight-gallery direction. */}
      <div className="absolute inset-0 hidden bg-[radial-gradient(ellipse_at_62%_10%,color-mix(in_srgb,var(--color-navy-light)_16%,transparent),transparent_32%),radial-gradient(ellipse_at_22%_82%,color-mix(in_srgb,var(--color-gold)_6%,transparent),transparent_34%),linear-gradient(135deg,var(--color-ink)_0%,var(--color-navy-deep)_46%,var(--color-night-deep)_100%)] dark:block" />
      <div className="absolute -inset-e-72 -top-72 hidden size-136 rounded-full bg-[radial-gradient(ellipse_at_50%_15%,color-mix(in_srgb,var(--color-gold)_7%,transparent),transparent_64%)] blur-3xl dark:block" />
      <div className="absolute -inset-s-56 -bottom-72 hidden size-152 rounded-full bg-[radial-gradient(ellipse_at_50%_20%,color-mix(in_srgb,var(--color-navy-light)_9%,transparent),transparent_62%)] blur-3xl dark:block" />
      <div className="via-gold/20 absolute inset-y-0 inset-s-[12%] hidden w-px bg-linear-to-b from-transparent to-transparent dark:block" />
      <div className="via-gold/10 absolute inset-y-0 inset-e-[18%] hidden w-px bg-linear-to-b from-transparent to-transparent dark:block" />

      <svg
        className="text-gold absolute inset-0 hidden h-full w-full opacity-[0.16] mix-blend-screen dark:block"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <pattern
            id="midnight-seam"
            width="96"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M0 0L96 96M-24 24L24 -24M72 120L120 72"
              fill="none"
              stroke="currentColor"
              strokeWidth=".45"
              opacity=".55"
            />
            <path
              d="M0 48H96M48 0V96"
              fill="none"
              stroke="currentColor"
              strokeWidth=".3"
              opacity=".3"
            />
            <circle cx="48" cy="48" r="1.4" fill="currentColor" opacity=".65" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#midnight-seam)" />
        <path
          d="M-40 78C180 10 320 150 560 82S920 8 1180 92 1500 150 1760 55"
          fill="none"
          stroke="currentColor"
          strokeWidth=".8"
          opacity=".5"
        />
        <path
          d="M-80 82C150 20 340 170 590 95S930 20 1200 110 1500 164 1790 65"
          fill="none"
          stroke="currentColor"
          strokeWidth=".35"
          opacity=".45"
        />
      </svg>

      {/* Dark constellation points */}
      <div className="absolute inset-0 hidden dark:block">
        {STARS.map((i) => {
          const x = (i * 43) % 100;
          const y = (i * 67) % 100;
          const size = i % 5 === 0 ? "size-1.5" : "size-1";
          return (
            <span
              key={i}
              className={`absolute ${size} bg-gold-light/40 animate-twinkle rounded-full shadow-[0_0_8px_color-mix(in_srgb,var(--color-gold)_45%,transparent)] ${DELAYS[i % DELAYS.length]}`}
              style={{ top: `${y}%`, left: `${x}%` }}
            />
          );
        })}
      </div>

      {/* Header/footer blending */}
      <div className="from-cream/95 dark:from-ink/90 absolute inset-x-0 top-0 h-28 bg-linear-to-b to-transparent" />
      <div className="from-cream/85 dark:from-ink/80 absolute inset-x-0 bottom-0 h-36 bg-linear-to-t to-transparent" />
    </div>
  );
}
