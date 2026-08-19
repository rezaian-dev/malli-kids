import type { ComponentType } from "react";
import {
  Briefcase,
  Handshake,
  History,
  Info,
  LayoutGrid,
  Mail,
  Percent,
  Settings,
  Shirt,
  ShoppingBag,
  Sparkles,
  Star,
  User,
  UsersRound,
} from "lucide-react";

export type AdminNavGroupId = "overview" | "commerce" | "content" | "relations";

export type AdminNavItem = {
  href: string;
  label: string;
  hint: string;
  group: AdminNavGroupId;
  Icon: ComponentType<{ className?: string }>;
};

export const ADMIN_NAV: AdminNavItem[] = [
  {
    href: "/admin",
    label: "داشبورد",
    hint: "نبض لحظه‌ای فروشگاه",
    group: "overview",
    Icon: LayoutGrid,
  },
  {
    href: "/admin/orders",
    label: "سفارش‌ها",
    hint: "پیگیری، پردازش و تحویل",
    group: "commerce",
    Icon: ShoppingBag,
  },
  {
    href: "/admin/products",
    label: "محصولات",
    hint: "کاتالوگ، قیمت و انتشار",
    group: "commerce",
    Icon: Shirt,
  },
  {
    href: "/admin/inventory",
    label: "موجودی",
    hint: "کنترل انبار و تأمین",
    group: "commerce",
    Icon: Briefcase,
  },
  {
    href: "/admin/customers",
    label: "مشتریان",
    hint: "کاربران و سطح دسترسی",
    group: "commerce",
    Icon: User,
  },
  {
    href: "/admin/team",
    label: "تیم مدیریت",
    hint: "ادمین‌ها و ارتقا/تنزل",
    group: "commerce",
    Icon: UsersRound,
  },
  {
    href: "/admin/coupons",
    label: "کد تخفیف",
    hint: "کمپین و نرخ استفاده",
    group: "commerce",
    Icon: Percent,
  },
  {
    href: "/admin/banners",
    label: "بنر مناسبت",
    hint: "تقویم کمپین‌ها",
    group: "content",
    Icon: Sparkles,
  },
  {
    href: "/admin/reviews",
    label: "نظرات",
    hint: "پایش صدای مشتری",
    group: "content",
    Icon: Star,
  },
  {
    href: "/admin/articles",
    label: "مجله",
    hint: "محتوا و انتشار",
    group: "content",
    Icon: Info,
  },
  {
    href: "/admin/messages",
    label: "پیام‌ها",
    hint: "تیکت و پشتیبانی",
    group: "relations",
    Icon: Mail,
  },
  {
    href: "/admin/collab",
    label: "همکاری",
    hint: "سرنخ‌های تجاری",
    group: "relations",
    Icon: Handshake,
  },
  {
    href: "/admin/audit",
    label: "تاریخچه عملیات",
    hint: "رویدادهای حساس",
    group: "relations",
    Icon: History,
  },
  {
    href: "/admin/settings",
    label: "تنظیمات",
    hint: "کمپین سراسری فروشگاه",
    group: "relations",
    Icon: Settings,
  },
];

export const ADMIN_NAV_GROUPS: { id: AdminNavGroupId; label: string }[] = [
  { id: "overview", label: "نمای مدیریتی" },
  { id: "commerce", label: "عملیات فروش" },
  { id: "content", label: "محتوا و تجربه" },
  { id: "relations", label: "ارتباطات" },
];
