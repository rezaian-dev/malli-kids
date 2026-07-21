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

/** 🚚 Flat shipping fee below `BRAND.freeShipFrom` — shared by order
 *  creation (server) and every checkout total preview (client). */
export const SHIPPING_FEE = 95_000;

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

export const GENDERS = ["دخترانه", "پسرانه", "یونیسکس"] as const;

export const SORTS: Record<string, string> = {
  new: "جدیدترین",
  "price-asc": "ارزان‌ترین",
  "price-desc": "گران‌ترین",
  rate: "بیشترین امتیاز",
};

export const STORAGE = {
  theme: "malli_theme",
  boot: "malli_boot",
  cart: "malli_cart",
};

export const PRICE_CAP = 4_000_000;
export const PER_PAGE = 9;

export const COLLAB_KINDS = [
  "خرید عمده و نمایندگی",
  "همکاری در دوخت و تولید",
  "تولید محتوا و بلاگر",
  "عکاسی و مدلینگ",
] as const;
