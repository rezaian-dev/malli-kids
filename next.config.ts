import { existsSync, lstatSync, rmSync } from "node:fs";
import { join } from "node:path";
import type { NextConfig } from "next";

try {
  const nextDir = join(process.cwd(), ".next");
  if (existsSync(nextDir) && lstatSync(nextDir).isSymbolicLink()) {
    rmSync(nextDir, { force: true });
  }
} catch {
  /* leftover Windows junction from a previous cache move */
}

const onSlowWin =
  process.platform === "win32" && !/^c:/i.test(process.cwd());

const nextConfig: NextConfig = {
  // 🧪 Skip dev gzip to avoid noisy upstream listener warnings in Next 16.
  compress: process.env.NODE_ENV === "production",
  // 🔐 Allow local and Arena preview origins in dev.
  allowedDevOrigins: ["*.e2b.app", "127.0.0.1", "localhost"],
  experimental: {
    // Heavy `.next/dev` LSM cache on a slow D: drive trips the FS
    // benchmark and must stay in-repo (PostCSS resolves from distDir).
    turbopackFileSystemCacheForDev: !onSlowWin,
  },
  images: {
    qualities: [75, 85, 90, 95],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "kimi-web-img.kimi.ai" }],
  },
};

export default nextConfig;
