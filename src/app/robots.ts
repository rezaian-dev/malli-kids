import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 🚫 /admin and /profile stay crawlable on purpose: Disallow would
        // hide their noindex tags from Googlebot. Both render no data
        // unauthenticated. /api serves JSON, so Disallow is safe there.
        // https://developers.google.com/search/docs/crawling-indexing/block-indexing
        disallow: ["/api", "/api/"],
      },
    ],
    sitemap: [`${getSiteUrl()}/sitemap.xml`],
    host: getSiteUrl(),
  };
}
