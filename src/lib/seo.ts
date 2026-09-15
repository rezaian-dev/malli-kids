import type { Metadata } from "next";
import { BRAND } from "@/lib/constants";
import { pdpHref } from "@/lib/data/products";
import type { JournalArticle } from "@/lib/articles";
import type { Product } from "@/types";

const SOCIALS = [
  "https://instagram.com/mallikids",
  "https://t.me/mallikids",
  "https://wa.me/982126401234",
  "https://eitaa.com/mallikids",
] as const;

const TITLE_MAX = 56;
const DESC_MAX = 155;

export const SEO = {
  siteNameFa: BRAND.nameFa,
  siteNamePlainFa: "ملی کیدز",
  siteNameEn: BRAND.nameEn,
  defaultTitle: "ملی‌کیدز | پوشاک کودک",
  titleTemplate: "%s | ملی‌کیدز",
  defaultDescription: "پوشاک کودک با دوخت ظریف؛ دخترانه، پسرانه و سیسمونی.",
  defaultImage: "/og.jpg",
  defaultImageAlt: "ملی‌کیدز — دنیای شیکِ کوچولوها",
  locale: "fa_IR",
  keywords: ["ملی‌کیدز", "پوشاک کودک", "لباس بچه", "سیسمونی"],
  themeColorLight: "#fcf7ef",
  themeColorDark: "#061728",
  searchParam: "query",
  ogWidth: 1200,
  ogHeight: 630,
} as const;

type PageType = "website" | "article";
type PageSchemaType =
  "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage" | "FAQPage" | "Article";

type PageMetadataInput = {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  imageAlt?: string;
  keywords?: string[];
  noIndex?: boolean;
  type?: PageType;
  absoluteTitle?: boolean;
};

type PageSchemaInput = {
  title: string;
  description?: string;
  path: string;
  type?: PageSchemaType;
};

type BreadcrumbItem = {
  name: string;
  path: string;
};

type FaqItem = {
  q: string;
  a: string;
};

type ItemListEntry = {
  name: string;
  path: string;
  image?: string;
};

// Read the public site URL from env with a safe local fallback.
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

// Build absolute URLs for canonicals, JSON-LD and sitemap entries.
export function absoluteUrl(path = "/") {
  const safePath = path.startsWith("/") ? path : `/${path}`;
  return new URL(safePath, `${getSiteUrl()}/`).toString();
}

// Crawlers fetch metadata/structured-data images over HTTP — data: URLs are
// neither fetchable nor valid there, and would bloat <head> by ~1MB per page.
export function crawlableImage(
  image: string | undefined,
  fallback: string,
): string {
  if (!image || image.startsWith("data:")) return fallback;
  return image;
}

// Keep OG images consistent and explicit.
function buildOgImage(
  image: string = SEO.defaultImage,
  alt: string = SEO.defaultImageAlt,
) {
  const safe = crawlableImage(image, SEO.defaultImage);
  const isDefault = safe === SEO.defaultImage;
  return {
    url: safe,
    alt,
    type:
      safe.endsWith(".jpg") || safe.endsWith(".jpeg")
        ? "image/jpeg"
        : safe.endsWith(".webp")
          ? "image/webp"
          : "image/png",
    ...(isDefault ? { width: SEO.ogWidth, height: SEO.ogHeight } : {}),
  } as const;
}

// Keep robots rules consistent across public and private pages.
function buildRobots(noIndex = false): Metadata["robots"] {
  const index = !noIndex;
  return {
    index,
    follow: index,
    ...(noIndex ? { nocache: true } : {}),
    googleBot: {
      index,
      follow: index,
      ...(noIndex ? { noimageindex: true } : {}),
      "max-image-preview": noIndex ? "none" : "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  };
}

// One short metadata shape for public routes.
export function buildMetadata({
  title,
  description = SEO.defaultDescription,
  path = "/",
  image = SEO.defaultImage,
  imageAlt,
  keywords = [],
  noIndex = false,
  type = "website",
  absoluteTitle = false,
}: PageMetadataInput = {}): Metadata {
  const desc = clipMeta(description, DESC_MAX);
  const ogTitle = clipMeta(
    absoluteTitle || !title ? (title ?? SEO.defaultTitle) : toFullTitle(title),
    TITLE_MAX,
  );
  const fullImageAlt = imageAlt ?? ogTitle;
  const safeImage = crawlableImage(image, SEO.defaultImage);

  return {
    title: toMetadataTitle(title, absoluteTitle),
    description: desc,
    keywords: keywords.length ? dedupe(keywords) : undefined,
    alternates: { canonical: path },
    robots: buildRobots(noIndex),
    openGraph: {
      title: ogTitle,
      description: desc,
      url: path,
      siteName: SEO.siteNameFa,
      locale: SEO.locale,
      type,
      images: [buildOgImage(safeImage, fullImageAlt)],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: desc,
      images: [safeImage],
    },
  };
}

// Root metadata owns the global defaults and metadataBase.
export function getRootMetadata(): Metadata {
  return {
    ...buildMetadata({ imageAlt: SEO.defaultImageAlt }),
    metadataBase: new URL(getSiteUrl()),
    title: { default: SEO.defaultTitle, template: SEO.titleTemplate },
    applicationName: SEO.siteNameFa,
    referrer: "origin-when-cross-origin",
    category: "shopping",
    creator: SEO.siteNameFa,
    publisher: SEO.siteNameFa,
    authors: [{ name: SEO.siteNameFa, url: absoluteUrl("/") }],
    keywords: [...SEO.keywords],
    manifest: "/manifest.webmanifest",
    icons: {
      icon: [{ url: "/icon.png", sizes: "512x512", type: "image/png" }],
      apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
      shortcut: ["/icon.png"],
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "default",
      title: SEO.siteNameFa,
    },
    formatDetection: {
      telephone: false,
      email: false,
      address: false,
    },
  };
}

// Organization schema for the whole storefront.
export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ClothingStore",
    name: SEO.siteNameFa,
    alternateName: [SEO.siteNamePlainFa, SEO.siteNameEn],
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

// Website schema exposes the catalog search entry point.
export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO.siteNameFa,
    alternateName: SEO.siteNameEn,
    url: absoluteUrl("/"),
    inLanguage: "fa-IR",
    potentialAction: {
      "@type": "SearchAction",
      target: `${absoluteUrl("/shop")}?${SEO.searchParam}={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

// Generic page schema for public informational pages.
export function pageSchema({
  title,
  description = SEO.defaultDescription,
  path,
  type = "WebPage",
}: PageSchemaInput) {
  return {
    "@context": "https://schema.org",
    "@type": type,
    name: title,
    headline: title,
    description,
    url: absoluteUrl(path),
    inLanguage: "fa-IR",
    isPartOf: {
      "@type": "WebSite",
      name: SEO.siteNameFa,
      url: absoluteUrl("/"),
    },
  };
}

// Breadcrumb schema helps search engines read the page path.
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

// ItemList schema supports collection and landing pages.
export function itemListSchema(items: ItemListEntry[], title?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: title,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(item.path),
      name: item.name,
      image: item.image ? absoluteUrl(item.image) : undefined,
    })),
  };
}

// FAQ schema powers rich FAQ results.
export function faqSchema(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

// Contact page schema keeps business contact details explicit.
export function contactPageSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "تماس با ملی‌کیدز",
    description: "راه‌های تماس، آدرس گالری و ساعت پاسخ‌گویی ملی‌کیدز",
    url: absoluteUrl("/contact"),
    mainEntity: {
      "@type": "ClothingStore",
      name: SEO.siteNameFa,
      url: absoluteUrl("/"),
      telephone: BRAND.phone,
      address: {
        "@type": "PostalAddress",
        addressCountry: "IR",
        addressLocality: "تهران",
        streetAddress: BRAND.address,
      },
    },
  };
}

// Ratings only from real visible reviews — Google disallows self-serving ones
export function productSchema(product: Product, reviews: { rate: number }[] = []) {
  const url = absoluteUrl(pdpHref(product.id));
  const aggregateRating = reviews.length
    ? {
        "@type": "AggregateRating" as const,
        ratingValue:
          Math.round(
            (reviews.reduce((sum, r) => sum + r.rate, 0) / reviews.length) * 10,
          ) / 10,
        reviewCount: reviews.length,
        bestRating: 5,
        worstRating: 1,
      }
    : undefined;

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.desc,
    image: [absoluteUrl(crawlableImage(product.img, SEO.defaultImage))],
    url,
    sku: `MK-${product.id}`,
    category: product.cat,
    brand: {
      "@type": "Brand",
      name: SEO.siteNameFa,
    },
    ...(aggregateRating ? { aggregateRating } : {}),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "IRR",
      price: String(product.price * 10),
      availability: product.stock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: SEO.siteNameFa,
      },
    },
  };
}

// Article schema covers editorial content pages.
export function articleSchema(
  article: Pick<
    JournalArticle,
    "slug" | "title" | "excerpt" | "cover" | "publishedAt" | "updatedAt" | "tags"
  >,
) {
  const image = crawlableImage(article.cover, SEO.defaultImage);

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: article.title,
    description: article.excerpt,
    image: [absoluteUrl(image)],
    mainEntityOfPage: absoluteUrl(`/articles/${article.slug}`),
    inLanguage: "fa-IR",
    datePublished: article.publishedAt,
    dateModified: article.updatedAt,
    // Real content taxonomy, not padded — distinct from the page's meta-keywords tag.
    ...(article.tags.length
      ? { keywords: article.tags.map((t) => t.name).join(", ") }
      : {}),
    author: {
      "@type": "Organization",
      name: SEO.siteNameFa,
    },
    publisher: {
      "@type": "Organization",
      name: SEO.siteNameFa,
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logo.png"),
      },
    },
  };
}

function containsBrand(title: string) {
  return title.includes(SEO.siteNameFa) || title.includes(SEO.siteNamePlainFa);
}

function toMetadataTitle(
  title: string | undefined,
  absoluteTitle: boolean,
): Metadata["title"] {
  if (absoluteTitle) return { absolute: title || SEO.defaultTitle };
  if (!title) return undefined;
  if (containsBrand(title)) return { absolute: title };
  return title;
}

function toFullTitle(title?: string) {
  if (!title) return SEO.defaultTitle;
  if (containsBrand(title)) return title;
  return `${title} | ${SEO.siteNameFa}`;
}

function clipMeta(value: string, max: number) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  const base = (space > 24 ? cut.slice(0, space) : cut).replace(/[،,؛.\s]+$/u, "");
  return `${base}…`;
}

function normalizeSiteUrl(value?: string) {
  if (!value?.trim()) return "";
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/$/, "");
}

function dedupe(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}
