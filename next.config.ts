import type { NextConfig } from "next";

// 🔐 Nonce-free CSP keeps static rendering intact; script/style unsafe-inline
// is the accepted trade-off. Esri tiles (img-src) power the profile map, the
// OSM embed iframe (frame-src) the contact map, and worker-src blob: is the
// avatar uploader's compression worker.
const isDev = process.env.NODE_ENV !== "production";
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob: https://server.arcgisonline.com;
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
  // 🌍 geolocation=(self) for the profile map's GPS button; all else denied
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
  // 🧪 Next's gzip leaks drain listeners under concurrency; the host
  // compresses at the edge anyway
  compress: false,
  // 🔐 Allow local and Arena preview origins in dev.
  allowedDevOrigins: ["*.e2b.app", "127.0.0.1", "localhost"],
  // 🎯 Keep admin/storefront CSS split (`cssChunking: "graph"`).
  experimental: {
    cssChunking: "graph",
  },
  images: {
    qualities: [75, 85, 90, 95],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/(.*)", headers: securityHeaders }];
  },
};

// 💡 On slow disks, junction .next to fast storage rather than enabling
// experimental.turbopackFileSystemCacheForDev (loud banner, slow cold rebuilds).

export default nextConfig;
