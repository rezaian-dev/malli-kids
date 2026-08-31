const STARS = Array.from({ length: 30 }, (_, i) => i);
const DELAYS = [
  "[animation-delay:-.2s]",
  "[animation-delay:-.8s]",
  "[animation-delay:-1.4s]",
  "[animation-delay:-2s]",
  "[animation-delay:-2.6s]",
  "[animation-delay:-3.2s]",
];
const RAYS = Array.from({ length: 32 }, (_, i) => i);

function LightAtelier() {
  return (
    <div className="absolute inset-0 dark:hidden">
      <div className="absolute inset-0 bg-[#ece6dc]" />
      <div className="absolute inset-0 bg-[linear-gradient(158deg,#cfc3b3_0%,#ece6dc_16%,#f6efe4_30%,#e8d4b0_48%,#d4b585_64%,#c19357_80%,#b7a07c_100%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(118deg,rgba(14,42,71,0.30)_0%,rgba(14,42,71,0.10)_20%,rgba(250,246,239,0.34)_42%,rgba(193,147,87,0.40)_64%,rgba(193,147,87,0.12)_82%,rgba(14,42,71,0.18)_100%)]" />
      {/* Logo mix (navy + gold + cream) as one silk wash — slightly less blur. */}
      <div className="absolute inset-[-16%] blur-[52px]">
        <div className="absolute top-[-8%] left-[20%] h-[44%] w-[52%] rounded-full bg-[rgba(193,147,87,0.46)]" />
        <div className="absolute top-[10%] right-[-8%] h-[40%] w-[44%] rounded-full bg-[rgba(14,42,71,0.18)]" />
        <div className="absolute bottom-[-10%] left-[-10%] h-[48%] w-[54%] rounded-full bg-[rgba(14,42,71,0.22)]" />
        <div className="absolute right-[10%] bottom-[8%] h-[38%] w-[42%] rounded-full bg-[rgba(250,246,239,0.58)]" />
        <div className="absolute top-[34%] left-[36%] h-[34%] w-[36%] rounded-full bg-[rgba(193,147,87,0.24)]" />
      </div>

      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden
      >
        <defs>
          <pattern
            id="mk-damask"
            width="72"
            height="84"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M36 10c-5.2 0-9.6 3.4-11.6 8.4C22.4 13.4 18 10 12.8 10 5.6 10 0 15.8 0 23c0 16 36 28 36 28s36-12 36-28c0-7.2-5.6-13-12.8-13Z"
              fill="#c19357"
              fillOpacity="0.055"
            />
            <path
              d="M36 42L48 63L36 84L24 63Z"
              fill="none"
              stroke="#0e2a47"
              strokeOpacity="0.05"
              strokeWidth="0.7"
            />
            <circle
              cx="36"
              cy="63"
              r="1.15"
              fill="#c19357"
              fillOpacity="0.18"
            />
          </pattern>
          <linearGradient id="mk-silk" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#0e2a47" stopOpacity="0" />
            <stop offset="0.22" stopColor="#0e2a47" stopOpacity="0.28" />
            <stop offset="0.4" stopColor="#c19357" stopOpacity="0.7" />
            <stop offset="0.5" stopColor="#faf6ef" stopOpacity="0.55" />
            <stop offset="0.62" stopColor="#c19357" stopOpacity="0.68" />
            <stop offset="0.82" stopColor="#0e2a47" stopOpacity="0.22" />
            <stop offset="1" stopColor="#0e2a47" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mk-navy-silk" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0e2a47" stopOpacity="0" />
            <stop offset="0.5" stopColor="#0e2a47" stopOpacity="0.18" />
            <stop offset="1" stopColor="#c19357" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="mk-cream-well" cx="50%" cy="28%" r="48%">
            <stop offset="0" stopColor="#faf6ef" stopOpacity="0.2" />
            <stop offset="0.4" stopColor="#f0e2cc" stopOpacity="0.1" />
            <stop offset="1" stopColor="#ece6dc" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="mk-gold-halo" cx="50%" cy="18%" r="34%">
            <stop offset="0" stopColor="#c19357" stopOpacity="0.28" />
            <stop offset="1" stopColor="#c19357" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width="1440" height="900" fill="url(#mk-damask)" />
        <rect width="1440" height="900" fill="url(#mk-cream-well)" />
        <rect width="1440" height="900" fill="url(#mk-gold-halo)" />

        <rect
          x="48"
          y="40"
          width="1344"
          height="820"
          rx="8"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.28"
          strokeWidth="1.1"
        />
        <rect
          x="58"
          y="50"
          width="1324"
          height="800"
          rx="4"
          fill="none"
          stroke="#0e2a47"
          strokeOpacity="0.08"
          strokeWidth="0.7"
        />

        <g
          stroke="#c19357"
          strokeOpacity="0.22"
          fill="none"
          transform="translate(720 196)"
        >
          {RAYS.map((i) => {
            const a = (i / 32) * Math.PI * 2;
            const inner = i % 2 === 0 ? 54 : 70;
            const outer = i % 4 === 0 ? 210 : i % 2 === 0 ? 168 : 132;
            return (
              <line
                key={i}
                x1={Math.cos(a) * inner}
                y1={Math.sin(a) * inner}
                x2={Math.cos(a) * outer}
                y2={Math.sin(a) * outer}
                strokeWidth={i % 4 === 0 ? 1.15 : 0.65}
              />
            );
          })}
          <circle
            r="48"
            stroke="#0e2a47"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          <circle r="78" strokeOpacity="0.32" strokeWidth="1.15" />
          <circle r="118" strokeOpacity="0.2" strokeWidth="0.9" />
          <circle
            r="158"
            stroke="#0e2a47"
            strokeOpacity="0.08"
            strokeDasharray="3 9"
            strokeWidth="0.8"
          />
        </g>

        <path
          d="M720 148c-28 0-52 18-63 46-11-28-35-46-63-46-39 0-72 33-72 72 0 88 135 152 135 152s135-64 135-152c0-39-33-72-72-72Z"
          fill="#c19357"
          fillOpacity="0.2"
        />
        <path
          d="M720 164c-22 0-41 14-50 36-9-22-28-36-50-36-31 0-56 26-56 57 0 70 106 121 106 121s106-51 106-121c0-31-25-57-56-57Z"
          fill="none"
          stroke="#c19357"
          strokeOpacity="0.7"
          strokeWidth="1.8"
        />
        <path
          d="M720 186c-14 0-26 9-32 24-6-15-18-24-32-24-20 0-36 17-36 37 0 46 68 80 68 80s68-34 68-80c0-20-16-37-36-37Z"
          fill="#faf6ef"
          fillOpacity="0.35"
        />

        <text
          x="488"
          y="548"
          fill="#0e2a47"
          fillOpacity="0.07"
          fontFamily="var(--font-display), 'Playfair Display', Georgia, serif"
          fontSize="268"
          fontWeight="700"
        >
          M
        </text>
        <text
          x="738"
          y="612"
          fill="#0e2a47"
          fillOpacity="0.07"
          fontFamily="var(--font-display), 'Playfair Display', Georgia, serif"
          fontSize="268"
          fontWeight="700"
        >
          L
        </text>

        <path
          d="M-40 250C180 80 360 280 560 140s390 10 640 180 280 40 420-40"
          fill="none"
          stroke="url(#mk-silk)"
          strokeWidth="1.6"
        />
        <path
          d="M-20 290C200 130 380 310 580 180s370 20 620 200"
          fill="none"
          stroke="url(#mk-silk)"
          strokeWidth="0.6"
          opacity="0.7"
        />
        <path
          d="M40 720C260 560 480 820 700 640s360-40 520 80 280 60 360-20"
          fill="none"
          stroke="url(#mk-navy-silk)"
          strokeWidth="1.4"
        />

        <g fill="none" stroke="#c19357" strokeWidth="1.05">
          <path
            d="M86 86h96M86 86v96"
            strokeOpacity="0.45"
            strokeLinecap="square"
          />
          <path d="M86 86l42 42" strokeOpacity="0.28" />
          <path
            d="M86 128h38M128 86v38"
            strokeOpacity="0.22"
            strokeWidth="0.7"
          />
          <circle cx="128" cy="128" r="5.5" strokeOpacity="0.4" />
          <path
            d="M108 108l20-32 20 32-20 20Z"
            strokeOpacity="0.22"
            strokeWidth="0.7"
          />

          <path
            d="M1354 86h-96M1354 86v96"
            strokeOpacity="0.45"
            strokeLinecap="square"
          />
          <path d="M1354 86l-42 42" strokeOpacity="0.28" />
          <circle cx="1312" cy="128" r="5.5" strokeOpacity="0.4" />

          <path
            d="M86 814h96M86 814v-96"
            strokeOpacity="0.45"
            strokeLinecap="square"
          />
          <path d="M86 814l42-42" strokeOpacity="0.28" />
          <circle cx="128" cy="772" r="5.5" strokeOpacity="0.4" />

          <path
            d="M1354 814h-96M1354 814v-96"
            strokeOpacity="0.45"
            strokeLinecap="square"
          />
          <path d="M1354 814l-42-42" strokeOpacity="0.28" />
          <circle cx="1312" cy="772" r="5.5" strokeOpacity="0.4" />
        </g>

        <g fill="#c19357" fillOpacity="0.38">
          <circle cx="220" cy="118" r="2.2" />
          <circle cx="1180" cy="96" r="1.8" />
          <circle cx="160" cy="430" r="1.7" />
          <circle cx="1288" cy="390" r="2.1" />
          <circle cx="310" cy="760" r="1.8" />
          <circle cx="1124" cy="710" r="2" />
          <circle cx="720" cy="70" r="1.6" />
          <circle cx="540" cy="820" r="1.5" />
          <circle cx="980" cy="800" r="1.7" />
        </g>
        <g fill="#0e2a47" fillOpacity="0.12">
          <circle cx="400" cy="90" r="1.4" />
          <circle cx="1040" cy="140" r="1.3" />
          <circle cx="90" cy="560" r="1.5" />
        </g>
      </svg>
    </div>
  );
}

export function BackgroundScene() {
  return (
    <div
      aria-hidden="true"
      className="dark:bg-ink pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-[#ece6dc]"
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
