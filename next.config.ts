import type { NextConfig } from "next";

// 🔐 Content-Security-Policy — deliberately *without* a per-request nonce:
// nonces force every page into dynamic rendering (no static optimization/
// ISR — see Next's CSP guide), which this mostly-static storefront doesn't
// want. `'unsafe-inline'` on script/style is the accepted trade-off for a
// static-first CSP; it's still a large step up from having no CSP at all,
// and blocks the things that actually matter here: arbitrary third-party
// script origins, framing, plugins/objects, mixed content.
// `*.neshan.org` is allow-listed for the profile page's map (SDK script +
// stylesheet from `static.neshan.org`, vector map tiles fetched by that SDK)
// — see `src/app/(storefront)/profile/_components/neshan-loader.ts`.
const isDev = process.env.NODE_ENV !== "production";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://*.neshan.org${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline' https://*.neshan.org;
  img-src 'self' data: blob: https://*.neshan.org https://kimi-web-img.kimi.ai;
  font-src 'self' data:;
  connect-src 'self' https://*.neshan.org;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

const securityHeaders = [
  { key: "Content-Security-Policy", value: cspHeader },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // 🌍 geolocation=(self): the profile page's "پیدا کردن مکان من" GPS button
  // needs it; everything else this app never uses stays denied.
  {
    key: "Permissions-Policy",
    value: "geolocation=(self), camera=(), microphone=(), payment=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  // 🧪 Off everywhere, not just dev: Next's built-in gzip (the `compression`
  // package) can leak `drain` listeners on its shared Gzip stream under
  // concurrent requests to the same route ("MaxListenersExceededWarning...
  // added to [Gzip]") — we saw it happen in `next start`, not just dev. A
  // real host (Vercel, a CDN, nginx) already compresses at the edge, so
  // Next doing it again in-process is redundant on top of being the thing
  // that leaks.
  compress: false,
  // 🔐 Allow local and Arena preview origins in dev.
  allowedDevOrigins: ["*.e2b.app", "127.0.0.1", "localhost"],
  images: {
    qualities: [75, 85, 90, 95],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "kimi-web-img.kimi.ai" }],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

// Note: On a slow filesystem (e.g. a non-C: volume), point the `.next` build
// cache at a fast local disk with a Windows junction instead of disabling
// Turbopack's filesystem cache via `experimental` (which prints a loud
// "Experiments (use with caution)" banner and slows cold rebuilds):
//
//   mklink /J <project>\.next D:\fast-cache\malli-kids-next
//
// `.next` must be a real join pointing at the fast volume — do NOT let it
// remain a symlink that Next resolves on every disk probe.
//
// We intentionally avoid setting `experimental.turbopackFileSystemCacheForDev`
// here: it only trades one warning (the filesystem benchmark) for another
// (the experimental banner) without fixing the underlying disk bottleneck.

export default nextConfig;
