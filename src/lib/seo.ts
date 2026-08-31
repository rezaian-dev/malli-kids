import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import type { JournalArticle } from "@/lib/articles";
import type { Product } from "@/types";

const SOCIALS = [
  "https://instagram.com/mallikids",
  "https://t.me/mallikids",
  "https://wa.me/982126401234",
  "https://eitaa.com/mallikids",
] as const;

export const SEO = {
  siteNameFa: BRAND.nameFa,
  siteNamePlainFa: "ملی کیدز",
  siteNameEn: BRAND.nameEn,
  defaultTitle: "ملی کیدز | پوشاک کودک",
  titleTemplate: "%s | ملی کیدز",
  defaultDescription:
    "فروشگاه اینترنتی پوشاک کودک ملی کیدز با کالکشن‌های دخترانه، پسرانه، سیسمونی و دستدوز، راهنمای سایز دقیق و تجربه خرید امن.",
  defaultImage: "/brand/hero-dress-editorial.jpg",
  locale: "fa_IR",
  keywords: [
    "ملی کیدز",
    "ملی‌کیدز",
    "پوشاک کودک",
    "لباس بچه",
    "بوتیک کودک",
    "فروشگاه لباس کودک",
    "راهنمای سایز کودک",
    "پرو مجازی لباس کودک",
  ],
} as const;

type PageType = "website" | "article";

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: PageType;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

// 🌐 Read the public site URL from env with a safe local fallback.
export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL,
    process.env.VERCEL_URL,
  ];

  for (const candidate of candidates) {
    const normalized = normalizeSiteUrl(candidate);
    if (normalized) return normalized;
  }

  return "http://localhost:3000";
}

// 🔗 Build absolute URLs for canonicals, JSON-LD and sitemap entries.
export function absoluteUrl(path = "/") {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return new URL(safePath, `${getSiteUrl()}/`).toString();
}

// 🛡️ Keep robots rules consistent across public and private pages.
export function buildRobots(noIndex = false): Metadata["robots"] {
  if (noIndex) {
    return {
      index: false,
      follow: false,
      nocache: true,
      googleBot: {
        index: false,
        follow: false,
        noimageindex: true,
        "max-image-preview": "none",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    };
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

// 🧩 Reuse one metadata shape across the public routes.
export function buildMetadata({
  title,
  description = SEO.defaultDescription,
  path = "/",
  image = SEO.defaultImage,
  imageAlt,
  keywords = [],
  noIndex = false,
  type = "website",
}: PageMetadataInput = {}): Metadata {
  const fullTitle = toFullTitle(title);

  return {
    title,
    description,
    keywords: dedupe([...SEO.keywords, ...keywords]),
    alternates: { canonical: path },
    robots: buildRobots(noIndex),
    category: "shopping",
    creator: SEO.siteNamePlainFa,
    publisher: SEO.siteNamePlainFa,
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: SEO.siteNamePlainFa,
      locale: SEO.locale,
      type,
      images: [{ url: image, alt: imageAlt ?? fullTitle }],
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [image],
    },
  };
}

// 🏠 Root metadata owns the global defaults and metadataBase.
export function getRootMetadata(): Metadata {
  return {
    metadataBase: new URL(getSiteUrl()),
    title: { default: SEO.defaultTitle, template: SEO.titleTemplate },
    description: SEO.defaultDescription,
    applicationName: SEO.siteNamePlainFa,
    alternates: { canonical: "/" },
    robots: buildRobots(false),
    referrer: "origin-when-cross-origin",
    category: "shopping",
    creator: SEO.siteNamePlainFa,
    publisher: SEO.siteNamePlainFa,
    keywords: [...SEO.keywords],
    manifest: "/manifest.webmanifest",
    openGraph: {
      title: SEO.defaultTitle,
      description: SEO.defaultDescription,
      url: "/",
      siteName: SEO.siteNamePlainFa,
      locale: SEO.locale,
      type: "website",
      images: [{ url: SEO.defaultImage, alt: SEO.siteNamePlainFa }],
    },
    twitter: {
      card: "summary_large_image",
      title: SEO.defaultTitle,
      description: SEO.defaultDescription,
      images: [SEO.defaultImage],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: SEO.siteNamePlainFa,
    },
  };
}

// 🏷️ Organization schema for the whole storefront.
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: SEO.siteNamePlainFa,
    alternateName: [SEO.siteNameFa, SEO.siteNameEn],
    description: SEO.defaultDescription,
    url: absoluteUrl("/"),
    logo: absoluteUrl("/brand/logo.png"),
    image: absoluteUrl(SEO.defaultImage),
    telephone: BRAND.phone,
    address: {
      "@type": "PostalAddress",
      addressCountry: "IR",
      addressLocality: "تهران",
      streetAddress: BRAND.address,
    },
    sameAs: [...SOCIALS],
  };
}

// 🔎 Website schema exposes the catalog search entry point.
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO.siteNamePlainFa,
    alternateName: SEO.siteNameEn,
    url: absoluteUrl("/"),
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/shop")}?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// 🧭 Breadcrumb schema helps search engines read the page path.
export function breadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

// 🛍️ Product schema powers rich product snippets.
export function productSchema(product: Product) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    image: [absoluteUrl(product.img)],
    sku: `MK-${product.id}`,
    category: product.cat,
    brand: {
      "@type": "Brand",
      name: SEO.siteNamePlainFa,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: product.rate,
      reviewCount: Math.max(product.sold, 1),
      bestRating: 5,
      worstRating: 1,
    },
    offers: {
      "@type": "Offer",
      url: absoluteUrl(`/product/${product.id}`),
      priceCurrency: "IRR",
      price: String(product.price * 10),
      availability: product.stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SEO.siteNamePlainFa,
      },
    },
  };
}

// 📰 Article schema covers editorial content pages.
export function articleSchema(
  article: Pick<JournalArticle, "slug" | "title" | "excerpt" | "cover">,
) {
  const image = article.cover || SEO.defaultImage;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(image)],
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
    inLanguage: "fa-IR",
    author: {
      "@type": "Organization",
      name: SEO.siteNamePlainFa,
    },
    publisher: {
      "@type": "Organization",
      name: SEO.siteNamePlainFa,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logo.png"),
      },
    },
  };
}

function toFullTitle(title?: string) {
  if (!title) return SEO.defaultTitle;
  if (title.includes(SEO.siteNamePlainFa) || title.includes(SEO.siteNameFa))
    return title;
  return `${title} | ${SEO.siteNamePlainFa}`;
}

function normalizeSiteUrl(value?: string) {
  if (!value?.trim()) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
