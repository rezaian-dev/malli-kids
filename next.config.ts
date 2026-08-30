import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // *.e2b.app = پیش‌نمایشِ Arena؛ دو مورد بعدی برای تست از 127.0.0.1/localhost (Playwright و cURL)
  allowedDevOrigins: ["*.e2b.app", "127.0.0.1", "localhost"],
  images: {
    qualities: [75, 85, 90, 95],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "kimi-web-img.kimi.ai" }],
  },
};

export default nextConfig;
