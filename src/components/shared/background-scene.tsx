const STARS = Array.from({ length: 30 }, (_, i) => i);
const DELAYS = [
  "[animation-delay:-.2s]",
  "[animation-delay:-.8s]",
  "[animation-delay:-1.4s]",
  "[animation-delay:-2s]",
  "[animation-delay:-2.6s]",
  "[animation-delay:-3.2s]",
];

function LightAtelier() {
  return (
    <div className="absolute inset-0 dark:hidden">
      <div className="absolute inset-0 bg-linear-to-br from-[#fff9f1] via-[#f6ead6] to-[#efe0c8]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-8%,rgba(193,147,87,0.34),transparent_52%),radial-gradient(ellipse_at_100%_8%,rgba(14,42,71,0.12),transparent_46%),radial-gradient(ellipse_at_0%_100%,rgba(14,42,71,0.10),transparent_48%),radial-gradient(ellipse_at_82%_88%,rgba(232,197,122,0.26),transparent_42%)]" />

      <div className="border-gold/25 absolute -top-36 left-1/2 size-120 -translate-x-1/2 rounded-full border md:size-168" />
      <div className="border-gold/20 absolute -top-20 left-1/2 size-88 -translate-x-1/2 rounded-full border md:size-136" />
      <div className="border-navy/10 absolute -top-6 left-1/2 size-56 -translate-x-1/2 rounded-full border md:size-88" />

      <div className="absolute top-8 left-1/2 size-64 -translate-x-1/2 rounded-full bg-[radial-gradient(circle,rgba(232,197,122,0.32),transparent_68%)] blur-3xl md:size-104" />
      <div className="absolute -inset-s-24 -bottom-16 size-88 rounded-full bg-[radial-gradient(circle,rgba(14,42,71,0.10),transparent_70%)] blur-3xl" />
      <div className="absolute -inset-e-16 top-1/3 size-72 rounded-full bg-[radial-gradient(circle,rgba(193,147,87,0.16),transparent_68%)] blur-3xl" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <linearGradient id="mk-gold-line" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c19357" stopOpacity="0" />
            <stop offset="0.45" stopColor="#c19357" stopOpacity="0.45" />
            <stop offset="1" stopColor="#0e2a47" stopOpacity="0" />
          </linearGradient>
        </defs>

        <path
          d="M600 92c-28 0-52 18-64 44-12-26-36-44-64-44-40 0-72 32-72 72 0 86 136 148 136 148s136-62 136-148c0-40-32-72-72-72Z"
          fill="#c19357"
          fillOpacity="0.09"
        />
        <path
          d="M600 108c-22 0-41 14-50 35-9-21-28-35-50-35-31 0-56 25-56 56 0 68 106 116 106 116s106-48 106-116c0-31-25-56-56-56Z"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.28"
          strokeWidth="1.4"
        />

        <circle
          cx="600"
          cy="210"
          r="210"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.16"
          strokeWidth="1.1"
        />
        <circle
          cx="600"
          cy="210"
          r="148"
          fill="none"
          stroke="#0e2a47"
          strokeOpacity="0.08"
          strokeWidth="1"
        />
        <circle
          cx="600"
          cy="210"
          r="92"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.22"
          strokeWidth="1.2"
        />

        <path
          d="M80 620C260 480 420 700 600 560s340-160 520 40"
          fill="none"
          stroke="url(#mk-gold-line)"
          strokeWidth="1.15"
        />
        <path
          d="M40 240C220 120 380 280 560 160s360-40 600 120"
          fill="none"
          stroke="#0e2a47"
          strokeOpacity="0.08"
          strokeWidth="1"
        />

        <g fill="#c19357" fillOpacity="0.28">
          <circle cx="180" cy="140" r="2.2" />
          <circle cx="980" cy="120" r="1.8" />
          <circle cx="160" cy="430" r="1.6" />
          <circle cx="1040" cy="390" r="2" />
          <circle cx="240" cy="700" r="1.7" />
          <circle cx="920" cy="680" r="2.1" />
          <circle cx="430" cy="80" r="1.5" />
          <circle cx="760" cy="70" r="1.6" />
        </g>
      </svg>
    </div>
  );
}

export function BackgroundScene() {
  return (
    <div
      aria-hidden="true"
      className="bg-cream dark:bg-ink pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <LightAtelier />

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

      <div className="from-cream/90 dark:from-ink/90 absolute inset-x-0 top-0 h-28 bg-linear-to-b to-transparent" />
      <div className="from-cream/80 dark:from-ink/80 absolute inset-x-0 bottom-0 h-36 bg-linear-to-t to-transparent" />
    </div>
  );
}
