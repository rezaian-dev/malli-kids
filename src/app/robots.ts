import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/profile",
          "/profile/",
          "/api",
          "/api/",
        ],
      },
    ],
    sitemap: [`${getSiteUrl()}/sitemap.xml`],
    host: getSiteUrl(),
  };
}
