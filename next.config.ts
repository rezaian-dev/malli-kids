import type { NextConfig } from "next";

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
