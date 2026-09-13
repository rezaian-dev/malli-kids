import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Allow private pages to be crawled so their noindex tags can be read.
        disallow: ["/api", "/api/"],
      },
    ],
    sitemap: [`${getSiteUrl()}/sitemap.xml`],
    host: getSiteUrl(),
  };
}
