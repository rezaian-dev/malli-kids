// 🛍️ Storefront catalog domain model
import type { ProductVariant } from "@/lib/shop/inventory";

export type Season = "بهاره" | "تابستانه" | "پاییزه" | "زمستانه";
type Gender = "دخترانه" | "پسرانه" | "یونیسکس";

export type { ProductVariant };

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
  // 🧵 Admin-curated "complete the look" ids — manual, not algorithmic
  pairsWith?: number[];
  // 🕒 Real DB rows only — sitemap's lastModified uses it when present
  updatedAt?: string;
};
