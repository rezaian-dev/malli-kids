// 🛍️ Storefront catalog domain model. Shared across product cards, PDP, shop,
// admin catalog and the data seed.

export type Season = "بهاره" | "تابستانه" | "پاییزه" | "زمستانه";
export type Gender = "دخترانه" | "پسرانه" | "یونیسکس";

export type ProductVariant = {
  size: string;
  color?: string;
  stock: number;
};

export type Product = {
  id: number;
  img: string;
  images: string[];
  name: string;
  cat: string;
  gender?: Gender;
  ageRange?: string;
  slug?: string;
  price: number;
  old?: number;
  disc?: string;
  rate: number;
  badge?: string;
  stock: boolean;
  variants: ProductVariant[];
  sold: number;
  season?: Season;
  desc: string;
  seoTitle?: string;
  seoDescription?: string;
  visible: boolean;
  featured: boolean;
  // 🧵 Admin-curated "complete the look" pairing — other product ids to
  // suggest as a matching outfit on this product's page (see
  // `getCompleteTheLook` in `@/lib/shop/products`). Empty/undefined for most
  // products; deliberately manual, not algorithmic — a dress+cardigan+shoes
  // set only means something if a human picked it.
  pairsWith?: number[];
  // 🕒 ISO 8601, real DB rows only (undefined for the static seed catalog) —
  // sitemap's `lastModified` uses it when present instead of "now every time".
  updatedAt?: string;
};
