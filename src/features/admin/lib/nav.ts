import type { ComponentType } from "react";
import {
  Briefcase,
  Handshake,
  Info,
  LayoutGrid,
  Mail,
  Percent,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  User,
} from "lucide-react";

export const ADMIN_NAV: { href: string; label: string; hint: string; Icon: ComponentType<{ className?: string }> }[] = [
  { href: "/admin", label: "داشبورد", hint: "نمای کلی فروش", Icon: LayoutGrid },
  { href: "/admin/orders", label: "سفارش‌ها", hint: "پیگیری و وضعیت", Icon: ShoppingBag },
  { href: "/admin/products", label: "محصولات", hint: "کاتالوگ و قیمت", Icon: Shirt },
  { href: "/admin/inventory", label: "موجودی", hint: "انبار و ناموجودی", Icon: Briefcase },
  { href: "/admin/customers", label: "مشتریان", hint: "مادران عضو", Icon: User },
  { href: "/admin/coupons", label: "کد تخفیف", hint: "MALLI10 و کمپین", Icon: Percent },
  { href: "/admin/banners", label: "بنر مناسبت", hint: "جشنواره و اعیاد", Icon: Sparkles },
  { href: "/admin/reviews", label: "نظرات", hint: "تأیید دیدگاه PDP", Icon: Star },
  { href: "/admin/articles", label: "مجله", hint: "مقالات فروشگاه", Icon: Info },
  { href: "/admin/messages", label: "پیام‌ها", hint: "تیکت پشتیبانی", Icon: Mail },
  { href: "/admin/collab", label: "همکاری", hint: "درخواست‌های همکاری", Icon: Handshake },
];
