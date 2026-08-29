// Admin-panel domain model (orders, customers, coupons, reviews, articles,
// messages, settings and the aggregate in-memory DB).

import type { Product } from "./product";
import type { FestiveBanner } from "./festive";

export type OrderStatus = "جدید" | "در حال آماده‌سازی" | "ارسال‌شده" | "تحویل‌شده" | "مرجوعی";
export type PayStatus = "پرداخت‌شده" | "در انتظار" | "ناموفق";

export type AdminOrderItem = { id: number; name: string; img: string; size: string; qty: number; price: number };

export type AdminOrder = {
  id: string;
  date: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  items: AdminOrderItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  coupon?: string;
  status: OrderStatus;
  pay: PayStatus;
  note?: string;
};

export type AdminCustomer = {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  orders: number;
  spent: number;
  childName?: string;
  joined: string;
  /** وضعیتِ حساب — مسدود یعنی اجازهٔ ثبت سفارش ندارد */
  status?: "فعال" | "مسدود";
};

export type AdminCoupon = {
  code: string;
  title: string;
  rate: number;
  used: number;
  cap: number;
  active: boolean;
  min: number;
  until: string;
};

export type AdminReview = {
  id: string;
  product: string;
  author: string;
  rate: number;
  text: string;
  date: string;
  visible: boolean;
};

export type AdminArticle = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  /** بدنهٔ مقاله — متنِ ساده (دانه) یا HTML خروجیِ ویرایشگرِ ادمین */
  body?: string;
  /** تصویرِ شاخص — مسیرِ فایل یا dataURL آپلودِ ادمین */
  cover?: string;
  published: boolean;
  date: string;
};

export type AdminMessage = {
  id: string;
  name: string;
  phone: string;
  text: string;
  date: string;
  read: boolean;
};

export type AdminCampaign = {
  /** جشنوارهٔ تخفیفِ سراسری روی همهٔ محصولات */
  active: boolean;
  /** درصدِ تخفیفِ سراسری (۰ تا ۹۰) */
  percent: number;
  /** عنوانِ جشنواره — در نوارِ بالایِ فروشگاه و برچسبِ قیمت نمایش داده می‌شود */
  title: string;
};

export type AdminSettings = {
  freeShipFrom: number;
  phoneFa: string;
  address: string;
  otpDemo: string;
  storeOpen: boolean;
  campaign: AdminCampaign;
};

export type AdminDb = {
  products: Product[];
  orders: AdminOrder[];
  customers: AdminCustomer[];
  coupons: AdminCoupon[];
  reviews: AdminReview[];
  articles: AdminArticle[];
  messages: AdminMessage[];
  settings: AdminSettings;
  banners: FestiveBanner[];
};
