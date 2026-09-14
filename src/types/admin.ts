// Admin-panel domain model — shapes returned by admin actions/data

export type OrderStatus =
  "جدید" | "در حال آماده‌سازی" | "ارسال‌شده" | "تحویل‌شده" | "مرجوعی" | "لغوشده";
export type PayStatus = "پرداخت‌شده" | "در انتظار" | "ناموفق" | "بازگشت به کیف پول";

type AdminOrderItem = {
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
  paymentVerified?: boolean;
  paidAmount?: number;
  paymentReference?: string;
  paidAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  inventoryState?: "pending" | "done" | "review";
  refundedAmount?: number;
  refundReference?: string;
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
  // `Tag.slug` references — see `ArticleDoc.tags`.
  tags: string[];
  date: string;
};
