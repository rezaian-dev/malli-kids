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
      <div className="absolute inset-0 bg-[#e8eef4]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_-12%,rgba(193,147,87,0.28),transparent_46%),radial-gradient(ellipse_at_100%_0%,rgba(14,42,71,0.14),transparent_42%),radial-gradient(ellipse_at_0%_100%,rgba(14,42,71,0.16),transparent_48%),radial-gradient(ellipse_at_80%_90%,rgba(193,147,87,0.14),transparent_40%)]" />

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 800"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern
            id="mk-lattice"
            width="56"
            height="96"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M28 0L56 48L28 96L0 48Z"
              fill="none"
              stroke="#c19357"
              strokeOpacity="0.16"
              strokeWidth="0.8"
            />
            <path
              d="M28 16L42 48L28 80L14 48Z"
              fill="none"
              stroke="#0e2a47"
              strokeOpacity="0.07"
              strokeWidth="0.6"
            />
          </pattern>
          <linearGradient id="mk-gold-arc" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#c19357" stopOpacity="0" />
            <stop offset="0.5" stopColor="#c19357" stopOpacity="0.55" />
            <stop offset="1" stopColor="#0e2a47" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="mk-gold-core" cx="50%" cy="38%" r="38%">
            <stop offset="0" stopColor="#c19357" stopOpacity="0.22" />
            <stop offset="1" stopColor="#c19357" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1200" height="800" fill="url(#mk-lattice)" />
        <rect width="1200" height="800" fill="url(#mk-gold-core)" />

        <circle
          cx="980"
          cy="90"
          r="260"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.22"
          strokeWidth="1.2"
        />
        <circle
          cx="980"
          cy="90"
          r="190"
          fill="none"
          stroke="#0e2a47"
          strokeOpacity="0.1"
          strokeWidth="1"
        />
        <circle
          cx="980"
          cy="90"
          r="120"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.28"
          strokeWidth="1.3"
        />

        <circle
          cx="140"
          cy="720"
          r="220"
          fill="none"
          stroke="#0e2a47"
          strokeOpacity="0.12"
          strokeWidth="1"
        />
        <circle
          cx="140"
          cy="720"
          r="150"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.2"
          strokeWidth="1.1"
        />

        <path
          d="M600 168c-26 0-48 17-58 42-10-25-32-42-58-42-36 0-66 30-66 66 0 80 124 138 124 138s124-58 124-138c0-36-30-66-66-66Z"
          fill="#c19357"
          fillOpacity="0.16"
        />
        <path
          d="M600 184c-20 0-38 13-46 33-8-20-26-33-46-33-28 0-52 23-52 52 0 64 98 110 98 110s98-46 98-110c0-29-24-52-52-52Z"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.45"
          strokeWidth="1.6"
        />

        <text
          x="430"
          y="470"
          fill="#0e2a47"
          fillOpacity="0.08"
          fontFamily="var(--font-display), 'Playfair Display', Georgia, serif"
          fontSize="240"
          fontWeight="700"
        >
          M
        </text>
        <text
          x="640"
          y="530"
          fill="#0e2a47"
          fillOpacity="0.08"
          fontFamily="var(--font-display), 'Playfair Display', Georgia, serif"
          fontSize="240"
          fontWeight="700"
        >
          L
        </text>

        <path
          d="M70 560C250 420 430 680 610 520s350-150 520 70"
          fill="none"
          stroke="url(#mk-gold-arc)"
          strokeWidth="1.3"
        />
        <path
          d="M-20 220C200 80 380 260 580 130s380-20 640 140"
          fill="none"
          stroke="#0e2a47"
          strokeOpacity="0.1"
          strokeWidth="1"
        />

        <g fill="#c19357" fillOpacity="0.42">
          <circle cx="210" cy="120" r="2.4" />
          <circle cx="860" cy="70" r="1.8" />
          <circle cx="90" cy="360" r="1.7" />
          <circle cx="1120" cy="340" r="2.2" />
          <circle cx="300" cy="680" r="1.8" />
          <circle cx="980" cy="640" r="2.1" />
          <circle cx="520" cy="60" r="1.6" />
        </g>
      </svg>
    </div>
  );
}

export function BackgroundScene() {
  return (
    <div
      aria-hidden="true"
      className="dark:bg-ink pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#e8eef4]"
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
    </div>
  );
}
