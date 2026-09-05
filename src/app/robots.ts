import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 🚫 /admin and /profile stay crawlable so Googlebot sees their noindex tags; /api is safe to disallow (JSON only).
        disallow: ["/api", "/api/"],
      },
    ],
    sitemap: [`${getSiteUrl()}/sitemap.xml`],
    host: getSiteUrl(),
  };
}
