// 🛍️ Storefront catalog domain model. Shared across product cards, PDP, shop,
// admin catalog and the data seed.

export type Season = "بهاره" | "تابستانه" | "پاییزه" | "زمستانه";

export type Product = {
  id: number;
  img: string;
  images: string[];
  name: string;
  cat: string;
  price: number;
  old?: number;
  disc?: string;
  rate: number;
  badge?: string;
  stock: boolean;
  sold: number;
  season?: Season;
  desc: string;
  // 🕒 ISO 8601, real DB rows only (undefined for the static seed catalog) —
  // sitemap's `lastModified` uses it when present instead of "now every time".
  updatedAt?: string;
};
