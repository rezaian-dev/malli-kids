/**
 * Storefront background — pure Tailwind and inline SVG, no background image.
 * Light keeps the editorial paper direction; dark is intentionally rebuilt as
 * a quiet midnight gallery with velvet gradients, fine seams, and constellations.
 */
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
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-cream dark:bg-ink">
      {/* Light: editorial paper, gold swatch, and a restrained navy undertone. */}
      <div className="absolute inset-0 bg-[radial-gradient(at_top_right,theme(colors.gold/16),transparent_55%),radial-gradient(at_bottom_left,theme(colors.navy/7),transparent_50%),linear-gradient(180deg,theme(colors.paper-soft)_0%,theme(colors.cream)_60%,theme(colors.fog)_100%)] dark:hidden" />
      {/* Dark: a completely different midnight-gallery direction. */}
      <div className="absolute inset-0 hidden dark:block bg-[radial-gradient(ellipse_at_78%_12%,theme(colors.navy-light/35),transparent_27%),radial-gradient(ellipse_at_15%_82%,theme(colors.gold/12),transparent_30%),linear-gradient(135deg,theme(colors.ink)_0%,theme(colors.navy-deep)_46%,theme(colors.night-deep)_100%)]" />
      <div className="absolute -end-48 -top-48 hidden size-[42rem] rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.gold/16),transparent_68%)] blur-3xl dark:block" />
      <div className="absolute -bottom-64 -start-52 hidden size-[46rem] rounded-full bg-[radial-gradient(ellipse_at_center,theme(colors.navy-light/28),transparent_68%)] blur-3xl dark:block" />
      <div className="absolute inset-y-0 start-[12%] hidden w-px bg-gradient-to-b from-transparent via-gold/20 to-transparent dark:block" />
      <div className="absolute inset-y-0 end-[18%] hidden w-px bg-gradient-to-b from-transparent via-gold/10 to-transparent dark:block" />

      <svg className="absolute inset-0 hidden h-full w-full opacity-[0.22] text-gold mix-blend-screen dark:block" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="midnight-seam" width="96" height="96" patternUnits="userSpaceOnUse">
            <path d="M0 0L96 96M-24 24L24 -24M72 120L120 72" fill="none" stroke="currentColor" strokeWidth=".45" opacity=".55" />
            <path d="M0 48H96M48 0V96" fill="none" stroke="currentColor" strokeWidth=".3" opacity=".3" />
            <circle cx="48" cy="48" r="1.4" fill="currentColor" opacity=".65" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#midnight-seam)" />
        <path d="M-40 78C180 10 320 150 560 82S920 8 1180 92 1500 150 1760 55" fill="none" stroke="currentColor" strokeWidth=".8" opacity=".5" />
        <path d="M-80 82C150 20 340 170 590 95S930 20 1200 110 1500 164 1790 65" fill="none" stroke="currentColor" strokeWidth=".35" opacity=".45" />
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
              className={`absolute ${size} rounded-full bg-gold-light/60 shadow-[0_0_12px_theme(colors.gold/70)] animate-twinkle ${DELAYS[i % DELAYS.length]}`}
              style={{ top: `${y}%`, left: `${x}%` }}
            />
          );
        })}
      </div>

      {/* Header/footer blending */}
      <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-cream/95 to-transparent dark:from-ink/90" />
      <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-cream/85 to-transparent dark:from-ink/80" />
    </div>
  );
}
