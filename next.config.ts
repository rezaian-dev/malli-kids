import type { NextConfig } from "next";

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

export default nextConfig;
