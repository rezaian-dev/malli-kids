import type { MetadataRoute } from "next";
import { loadPublishedArticles } from "@/lib/articles";
import { CATS } from "@/lib/constants";
import { pdpHref, SEASONS } from "@/lib/data/products";
import { getAllProducts } from "@/lib/shop/products";
import { absoluteUrl } from "@/lib/seo";
import {
  defaultShopState,
  toShopHref,
} from "@/lib/shop/shop-state";

const now = new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: absoluteUrl("/"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: absoluteUrl("/shop"),
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.95,
    },
    {
      url: absoluteUrl("/about"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/articles"),
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/size-guide"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: absoluteUrl("/shipping"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/faq"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/contact"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: absoluteUrl("/collab"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: absoluteUrl("/fabrics"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/patterns"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/kits"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/tutorials"),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.65,
    },
    {
      url: absoluteUrl("/privacy"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: absoluteUrl("/terms"),
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  const shopFacetRoutes: MetadataRoute.Sitemap = [
    ...CATS.filter((cat) => cat !== "همه").map((cat) => ({
      url: absoluteUrl(toShopHref({ ...defaultShopState(), cat })),
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.9,
    })),
    ...SEASONS.map((season) => ({
      url: absoluteUrl(toShopHref({ ...defaultShopState(), season })),
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
  ];

  const [products, articles] = await Promise.all([
    getAllProducts(),
    loadPublishedArticles(),
  ]);

  const productRoutes: MetadataRoute.Sitemap = products.map((product) => ({
    url: absoluteUrl(pdpHref(product.id)),
    // 🕒 The product's real last-write time when we have it (every DB row
    // does; only the static seed catalog wouldn't) — a sitemap that reports
    // every URL as "modified right now" on every regeneration is a signal
    // crawlers learn to discount.
    lastModified: product.updatedAt ?? now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: absoluteUrl(`/articles/${article.slug}`),
    lastModified: article.updatedAt,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [
    ...staticRoutes,
    ...shopFacetRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
