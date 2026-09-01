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
  images: {
    qualities: [75, 85, 90, 95],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "kimi-web-img.kimi.ai" }],
  },
};

if (onSlowWin) {
  // Default-on since 16.1 — only opt out on a slow non-C: Windows volume.
  // Setting the flag at all prints "Experiments (use with caution)".
  nextConfig.experimental = { turbopackFileSystemCacheForDev: false };
}

export default nextConfig;
