export const BRAND = {
  nameFa: "ملی‌کیدز",
  nameEn: "MALLI KIDS",
  phone: "+982126401234",
  phoneFa: "۰۲۱ — ۲۶۴۰ ۱۲۳۴",
  address: "تهران، ولیعصر، گالری ملی‌کیدز",
  map: { lat: 35.7575, lng: 51.40995 },
  coupon: "MALLI10",
  couponRate: 0.1,
  freeShipFrom: 1_500_000,
};

export const RETIRED_CATS = ["راحتی و خانگی", "بیرونی و مجلسی"] as const;

export function isRetiredCategory(category: string) {
  return (RETIRED_CATS as readonly string[]).includes(category);
}

export const CATS = [
  "همه",
  "دخترانه",
  "پسرانه",
  "سیسمونی",
  "لباس مشاغل",
  "اکسسوری",
  "دستدوز",
] as const;

export { SEASONS } from "@/lib/data/products";

export const SORTS: Record<string, string> = {
  new: "جدیدترین",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
  rate: "بیشترین امتیاز",
};

export const STORAGE = {
  theme: "malli_theme",
  themeResolved: "malli_theme_resolved",
  boot: "malli_boot",
  user: "malli_user",
  purchases: "malli_purchases",
  cart: "malli_cart",
  campaign: "malli_campaign",
  banner: "malli_banner",
  admin: "malli_admin",
  adminDb: "malli_admin_db",
};

export const PRICE_CAP = 4_000_000;
export const PER_PAGE = 9;
