import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.e2b.app"],
  images: {
    remotePatterns: [{ protocol: "https", hostname: "kimi-web-img.kimi.ai" }],
  },
};

export default nextConfig;
