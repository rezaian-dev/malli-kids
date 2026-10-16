// Storefront catalog domain model
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
  // Multi-select values from the admin form; `cat`/`season` stay as the
  // primary (first) entry for legacy displays and single-value filters.
  cats?: string[];
  seasons?: Season[];
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
  // Admin-curated "complete the look" ids — manual, not algorithmic
  pairsWith?: number[];
  // Real DB rows only — sitemap's lastModified uses it when present
  updatedAt?: string;
};

export function productCats(product: Pick<Product, "cat" | "cats">): string[] {
  return product.cats?.length ? product.cats : [product.cat];
}

export function productSeasons(
  product: Pick<Product, "season" | "seasons">,
): Season[] {
  return product.seasons?.length
    ? product.seasons
    : product.season
      ? [product.season]
      : [];
}
