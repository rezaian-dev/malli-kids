import { useId, type CSSProperties } from "react";

type OrnamentProps = {
  className?: string;
  style?: CSSProperties;
};

// 🎁 Hand-crafted 3D ornaments (inline SVG, zero assets): layered gradients,
// bevel lights and soft shadows give real depth on both dark-navy and gold
// strip backgrounds. Gradient ids are per-instance (`useId`) so repeated
// ornaments never clash.

export function Gift3D({ className, style }: OrnamentProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 72 72"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`box-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff9ee" />
          <stop offset="0.55" stopColor="#f3e3c2" />
          <stop offset="1" stopColor="#dfc194" />
        </linearGradient>
        <linearGradient id={`lid-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f8ecd4" />
          <stop offset="1" stopColor="#e6c896" />
        </linearGradient>
        <linearGradient id={`rib-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1d4568" />
          <stop offset="0.6" stopColor="#0e2a47" />
          <stop offset="1" stopColor="#060f1e" />
        </linearGradient>
        <linearGradient id={`ge-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f7e3bb" />
          <stop offset="0.5" stopColor="#c19357" />
          <stop offset="1" stopColor="#8a5a1e" />
        </linearGradient>
        <linearGradient id={`side-${uid}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.35" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
          <stop offset="1" stopColor="#041427" stopOpacity="0.18" />
        </linearGradient>
        <radialGradient id={`knot-${uid}`} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#2c5680" />
          <stop offset="0.55" stopColor="#16385a" />
          <stop offset="1" stopColor="#041427" />
        </radialGradient>
        <radialGradient id={`gsh-${uid}`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#041427" stopOpacity="0.4" />
          <stop offset="1" stopColor="#041427" stopOpacity="0" />
        </radialGradient>
      </defs>
      <ellipse cx="36" cy="63" rx="21" ry="4.5" fill={`url(#gsh-${uid})`} />
      <rect
        x="14"
        y="30"
        width="44"
        height="30"
        rx="3"
        fill={`url(#box-${uid})`}
      />
      <rect
        x="14"
        y="30"
        width="44"
        height="30"
        rx="3"
        fill={`url(#side-${uid})`}
      />
      <rect
        x="14"
        y="30"
        width="44"
        height="3"
        rx="1.5"
        fill="#fffdf6"
        opacity="0.55"
      />
      <rect
        x="11"
        y="21"
        width="50"
        height="10"
        rx="3"
        fill={`url(#lid-${uid})`}
      />
      <rect
        x="12"
        y="31"
        width="48"
        height="2.5"
        fill="#7a4d16"
        opacity="0.45"
      />
      <rect
        x="11"
        y="21"
        width="50"
        height="2.5"
        rx="1.2"
        fill="#ffffff"
        opacity="0.65"
      />
      <rect
        x="12"
        y="23.5"
        width="48"
        height="5"
        fill="#0e2a47"
        opacity="0.88"
      />
      <rect x="12" y="25.6" width="48" height="1.4" fill="#f0c878" />
      <rect x="31" y="21" width="10" height="39" fill={`url(#rib-${uid})`} />
      <rect
        x="31"
        y="21"
        width="1.2"
        height="39"
        fill="#ffffff"
        opacity="0.35"
      />
      <rect
        x="39.8"
        y="21"
        width="1.2"
        height="39"
        fill="#020a16"
        opacity="0.55"
      />
      <rect x="34" y="21" width="4" height="39" fill={`url(#ge-${uid})`} />
      <rect
        x="34"
        y="21"
        width="1.3"
        height="39"
        fill="#ffffff"
        opacity="0.5"
      />
      <path
        d="M36 21C30 9 17 10 19 17.5 20.5 23.5 30 23 36 21Z"
        fill="#16385a"
      />
      <path
        d="M33 20C29 13 22 13.5 22.8 17.5 23.4 20.5 29 20.5 33 20Z"
        fill="#041427"
        opacity="0.55"
      />
      <path
        d="M36 21C42 9 55 10 53 17.5 51.5 23.5 42 23 36 21Z"
        fill="#0e2a47"
      />
      <path
        d="M39 20C43 13 50 13.5 49.2 17.5 48.6 20.5 43 20.5 39 20Z"
        fill="#020a16"
        opacity="0.6"
      />
      <circle cx="36" cy="19.5" r="4.6" fill={`url(#knot-${uid})`} />
      <circle cx="34.4" cy="17.8" r="1.4" fill="#ffffff" opacity="0.85" />
      <rect
        x="17.5"
        y="35"
        width="5.5"
        height="21"
        rx="2.75"
        fill="#ffffff"
        opacity="0.25"
      />
      <circle
        cx="36"
        cy="55"
        r="2.2"
        fill="#f0c878"
        stroke="#8a5a1e"
        strokeWidth="0.8"
      />
    </svg>
  );
}

export function Coin3D({ className, style }: OrnamentProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 56 56"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`rim-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#1d4568" />
          <stop offset="0.55" stopColor="#0e2a47" />
          <stop offset="1" stopColor="#020a16" />
        </linearGradient>
        <radialGradient id={`face-${uid}`} cx="0.38" cy="0.3" r="0.95">
          <stop offset="0" stopColor="#f9ead0" />
          <stop offset="0.45" stopColor="#f0c878" />
          <stop offset="0.78" stopColor="#c19357" />
          <stop offset="1" stopColor="#8a5a1e" />
        </radialGradient>
        <linearGradient id={`csh-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.55" stopColor="#041427" stopOpacity="0" />
          <stop offset="1" stopColor="#041427" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <ellipse cx="28" cy="51" rx="15" ry="3" fill="#041427" opacity="0.3" />
      <circle cx="28" cy="27" r="24" fill={`url(#rim-${uid})`} />
      <path
        d="M7 24 A23 23 0 0 1 49 24"
        fill="none"
        stroke="#ffffff"
        strokeWidth="1.5"
        opacity="0.25"
        strokeLinecap="round"
      />
      <path
        d="M9 32 A22.5 22.5 0 0 0 47 32"
        fill="none"
        stroke="#020a16"
        strokeWidth="1.5"
        opacity="0.45"
        strokeLinecap="round"
      />
      <circle cx="28" cy="27" r="18.5" fill={`url(#face-${uid})`} />
      <circle cx="28" cy="27" r="18.5" fill={`url(#csh-${uid})`} />
      <circle
        cx="28"
        cy="27"
        r="14.5"
        fill="none"
        stroke="#8a5a1e"
        strokeWidth="1.3"
        opacity="0.75"
        strokeDasharray="3 2.4"
      />
      <path d="M28 17.5 L35.5 27 L28 36.5 L20.5 27 Z" fill="#9c6a24" />
      <path d="M28 17.5 L28 36.5 L20.5 27 Z" fill="#020a16" opacity="0.28" />
      <path d="M28 17.5 L35.5 27 L28 27 Z" fill="#ffffff" opacity="0.4" />
      <circle cx="28" cy="27" r="1.6" fill="#f9ead0" />
      <ellipse
        cx="21.5"
        cy="20.5"
        rx="6"
        ry="3.8"
        fill="#ffffff"
        opacity="0.5"
        transform="rotate(-25 21.5 20.5)"
      />
      <circle cx="19" cy="18.5" r="1.5" fill="#ffffff" opacity="0.85" />
    </svg>
  );
}

export function Balloon3D({ className, style }: OrnamentProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 56 84"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`bal-${uid}`} cx="0.36" cy="0.28" r="1">
          <stop offset="0" stopColor="#ffa4b8" />
          <stop offset="0.42" stopColor="#e5486f" />
          <stop offset="0.72" stopColor="#b81f4d" />
          <stop offset="1" stopColor="#7a0e2c" />
        </radialGradient>
        <linearGradient id={`bsh-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.5" stopColor="#040a14" stopOpacity="0" />
          <stop offset="1" stopColor="#040a14" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id={`str-${uid}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8c57a" />
          <stop offset="1" stopColor="#b8893f" />
        </linearGradient>
      </defs>
      <path
        d="M28 59 C23 64 33 68 28 74 C24.5 78 30 80.5 28 83"
        fill="none"
        stroke={`url(#str-${uid})`}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path d="M24.5 52.5 L31.5 52.5 L28 59 Z" fill="#a4133c" />
      <ellipse cx="28" cy="30" rx="20" ry="24" fill={`url(#bal-${uid})`} />
      <ellipse cx="28" cy="30" rx="20" ry="24" fill={`url(#bsh-${uid})`} />
      <ellipse
        cx="20.5"
        cy="20.5"
        rx="5"
        ry="8"
        fill="#ffffff"
        opacity="0.55"
        transform="rotate(-18 20.5 20.5)"
      />
      <circle cx="18" cy="15.5" r="1.7" fill="#ffffff" opacity="0.9" />
      <path
        d="M43 38 A20 24 0 0 1 36 50"
        fill="none"
        stroke="#ffa4b8"
        strokeWidth="1.6"
        opacity="0.55"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Gem3D({ className, style }: OrnamentProps) {
  const uid = useId().replace(/:/g, "");
  return (
    <svg
      viewBox="0 0 56 56"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`gem-${uid}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fffdf4" />
          <stop offset="0.3" stopColor="#f7e3bb" />
          <stop offset="0.55" stopColor="#e8c57a" />
          <stop offset="0.8" stopColor="#b8893f" />
          <stop offset="1" stopColor="#7a4d16" />
        </linearGradient>
      </defs>
      <path
        d="M28 3 C30 17 34.5 23.5 52 28 C34.5 32.5 30 39 28 53 C26 39 21.5 32.5 4 28 C21.5 23.5 26 17 28 3 Z"
        fill={`url(#gem-${uid})`}
      />
      <path
        d="M28 3 C30 17 34.5 23.5 52 28 L28 28 Z"
        fill="#ffffff"
        opacity="0.38"
      />
      <path
        d="M28 53 C26 39 21.5 32.5 4 28 L28 28 Z"
        fill="#041427"
        opacity="0.22"
      />
      <circle cx="28" cy="28" r="4.2" fill="#fffdf4" />
      <circle
        cx="28"
        cy="28"
        r="4.2"
        fill="none"
        stroke="#b8893f"
        strokeWidth="1"
        opacity="0.6"
      />
      <path
        d="M28 24.5 L28 31.5 M24.5 28 L31.5 28"
        stroke="#c19357"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}
