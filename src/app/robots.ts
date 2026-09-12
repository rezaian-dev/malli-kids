import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // 🚫 `/admin` and `/profile` are deliberately NOT disallowed here even
        // though they're private — both already carry a `noindex` meta tag
        // (`admin/layout.tsx`, `profile/page.tsx`) and Google's own guidance
        // is explicit that combining robots.txt Disallow with noindex is
        // self-defeating: a blocked page is never crawled, so Googlebot never
        // sees the noindex tag and the URL can still surface (bare, without
        // content) if anything ever links to it.
        // https://developers.google.com/search/docs/crawling-indexing/block-indexing
        // Both routes are safe to let Googlebot fetch: neither renders any
        // real data for an unauthenticated request (admin pages redirect to
        // `/admin/login`; `/profile` shows a client-side "please sign in"
        // prompt with no user data in the server-rendered HTML) — so letting
        // them be crawled costs nothing and makes the noindex tag actually
        // work. `/api` stays disallowed: it serves JSON, not pages with
        // metadata, so there's no noindex tag for a Disallow to defeat.
        disallow: ["/api", "/api/"],
      },
    ],
    sitemap: [`${getSiteUrl()}/sitemap.xml`],
    host: getSiteUrl(),
  };
}
