import type { MetadataRoute } from "next";
import { loadPublishedArticles } from "@/lib/articles";
import { CATS } from "@/lib/constants";
import { CORE_PRODUCTS, pdpHref, SEASONS } from "@/lib/data/products";
import { absoluteUrl } from "@/lib/seo";
import {
  defaultShopState,
  toShopHref,
} from "@/app/(storefront)/shop/_lib/shop-state";

const now = new Date();

export default function sitemap(): MetadataRoute.Sitemap {
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

  const productRoutes: MetadataRoute.Sitemap = CORE_PRODUCTS.map((product) => ({
    url: absoluteUrl(pdpHref(product.id)),
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  const articleRoutes: MetadataRoute.Sitemap = loadPublishedArticles().map(
    (article) => ({
      url: absoluteUrl(`/articles/${article.slug}`),
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    }),
  );

  return [
    ...staticRoutes,
    ...shopFacetRoutes,
    ...productRoutes,
    ...articleRoutes,
  ];
}
