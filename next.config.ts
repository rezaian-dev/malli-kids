import type { NextConfig } from "next";

// 🔐 Content-Security-Policy — deliberately *without* a per-request nonce:
// nonces force every page into dynamic rendering (no static optimization/
// ISR — see Next's CSP guide), which this mostly-static storefront doesn't
// want. `'unsafe-inline'` on script/style is the accepted trade-off for a
// static-first CSP; it's still a large step up from having no CSP at all,
// and blocks the things that actually matter here: arbitrary third-party
// script origins, framing, plugins/objects, mixed content.
// `server.arcgisonline.com` is allow-listed for the profile page's map —
// the free Esri tile images it fetches directly in the browser (everything
// else about that map, including the `leaflet` package itself and its
// marker icons, is bundled same-origin — see
// `src/app/(storefront)/profile/_components/leaflet-loader.ts`; reverse
// geocoding happens server-side in `reverseGeocodeAction`, never from the
// browser, so it needs no `connect-src` entry here). This used to point at
// `*.tile.openstreetmap.org` — switched to Esri because OSM's own tile
// server started silently serving its "Access blocked" placeholder tile
// (still HTTP 200 — see `address-map-field.tsx`) instead of real imagery
// under their tile-usage policy.
// `frame-src www.openstreetmap.org` is for the *contact* page's embedded
// map iframe (`contact-map.tsx`) — a different OSM surface (their embed
// widget, not the tile server) that was silently CSP-blocked (no
// `frame-src` fell back to `default-src 'self'`) until this was added.
// `worker-src 'self' blob:` — the profile avatar uploader's
// `browser-image-compression` step (`components/ui/image-upload.ts`) does
// its resizing on a Web Worker it spins up from a same-origin `blob:` URL;
// without this, `worker-src` falls back to `script-src` (no `blob:` there),
// so the worker was silently blocked and every upload fell back to
// compressing on the main thread instead.
const isDev = process.env.NODE_ENV !== "production";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://server.arcgisonline.com https://kimi-web-img.kimi.ai;
  font-src 'self' data:;
  connect-src 'self';
  frame-src https://www.openstreetmap.org;
  worker-src 'self' blob:;
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
  // 🎯 The default `true` chunking merges CSS across the (admin)/(storefront)
  // route-group split in `storefront.css`/`admin.css` back into shared
  // chunks that both sides download in full (optimizing request count over
  // per-route bytes) — exactly the case the docs call out `graph` for:
  // route-aware, minimizes the unused CSS each route actually ships.
  experimental: {
    cssChunking: "graph",
  },
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
