// Occasion / festive announcement banner model (storefront header + admin).

export type FestiveTheme = "navy" | "gold" | "night";

export type FestiveBanner = {
  id: string;
  occasion: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  coupon?: string;
  theme: FestiveTheme;
  from: string;
  to: string;
  active: boolean;
  pinned: boolean;
};
