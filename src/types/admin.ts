// 🛠️ Admin-panel domain model (orders, customers, coupons, reviews and
// articles) — the client-facing shapes every admin server action/data
// function returns. Real, database-backed reads/writes live in
// `@/lib/shop/*` and each admin route's own `_lib/`.

export type OrderStatus =
  "جدید" | "در حال آماده‌سازی" | "ارسال‌شده" | "تحویل‌شده" | "مرجوعی";
export type PayStatus = "پرداخت‌شده" | "در انتظار" | "ناموفق";

export type AdminOrderItem = {
  id: number;
  name: string;
  img: string;
  size: string;
  qty: number;
  price: number;
};

export type AdminOrder = {
  id: string;
  userId: string;
  date: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
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

  avatar?: string;
  joined: string;

  role?: "user" | "admin";

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

  body?: string;

  cover?: string;
  published: boolean;
  // 🏷️ `Tag.slug` references — see `ArticleDoc.tags`.
  tags: string[];
  date: string;
};
