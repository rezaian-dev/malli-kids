// 🛍️ Storefront catalog domain model. Shared across product cards, PDP, shop,
// admin catalog and the data seed.

export type Season = "بهاره" | "تابستانه" | "پاییزه" | "زمستانه";

export type Product = {
  id: number;
  img: string;
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
};
