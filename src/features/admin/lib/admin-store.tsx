"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { STORAGE } from "@/lib/constants";
import type {
  AdminArticle,
  AdminCoupon,
  AdminCustomer,
  AdminDb,
  AdminMessage,
  AdminReview,
  AdminSettings,
  FestiveBanner,
  OrderStatus,
  Product,
} from "@/types";
import { seedAdminDb } from "./admin-data";

// دیتابیسِ پنل روی localStorage زنده می‌ماند (کلیدِ malli_admin_db) تا هر تغییرِ
// ادمین — از مقاله و بنر تا موجودی و جشنواره — بعد از refresh هم بماند.
// API هوک دست‌نخورده است؛ هیچ صفحه‌ای نیاز به ویرایش ندارد.
type AdminCtx = {
  ready: boolean;
  logged: boolean;
  db: AdminDb;
  login: (user: string, pass: string) => boolean;
  logout: () => void;
  saveProducts: (list: Product[]) => void;
  upsertProduct: (p: Product) => void;
  removeProduct: (id: number) => void;
  setOrderStatus: (id: string, status: OrderStatus) => void;
  saveCustomers: (list: AdminCustomer[]) => void;
  saveCustomer: (c: AdminCustomer) => void;
  removeCustomer: (id: string) => void;
  saveCoupons: (list: AdminCoupon[]) => void;
  saveCoupon: (c: AdminCoupon) => void;
  removeCoupon: (code: string) => void;
  saveReviews: (list: AdminReview[]) => void;
  saveReview: (r: AdminReview) => void;
  removeReview: (id: string) => void;
  saveArticles: (list: AdminArticle[]) => void;
  upsertArticle: (a: AdminArticle) => void;
  removeArticle: (slug: string) => void;
  saveMessages: (list: AdminMessage[]) => void;
  saveSettings: (s: AdminSettings) => void;
  saveBanners: (list: FestiveBanner[]) => void;
  saveBanner: (b: FestiveBanner) => void;
  removeBanner: (id: string) => void;
  resetDb: () => void;
};

const Ctx = createContext<AdminCtx | null>(null);
const KEY = STORAGE.adminDb;

/** خواندنِ دیتابیسِ پنل: دادهٔ ذخیره‌شده با دانهٔ نمونه ادغام می‌شود */
function loadDb(): AdminDb {
  const seed = seedAdminDb();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed;
    const saved = JSON.parse(raw) as Partial<AdminDb>;
    return {
      products: saved.products?.length ? saved.products : seed.products,
      orders: saved.orders ?? seed.orders,
      customers: saved.customers ?? seed.customers,
      coupons: saved.coupons ?? seed.coupons,
      reviews: saved.reviews ?? seed.reviews,
      articles: saved.articles ?? seed.articles,
      messages: saved.messages ?? seed.messages,
      banners: saved.banners ?? seed.banners,
      // ادغامِ عمیق تا فیلدهای تازهٔ تنظیمات (مثل جشنواره) از قلم نیفتند
      settings: { ...seed.settings, ...saved.settings },
    };
  } catch {
    return seed;
  }
}

export function AdminStore({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [db, setDb] = useState<AdminDb>(() => seedAdminDb());
  const [hydrated, setHydrated] = useState(false);

  // هیدریت از localStorage (فقط در مرورگر — رندرِ سرور با دانه یکسان می‌ماند)
  useEffect(() => {
    setDb(loadDb());
    setHydrated(true);
  }, []);

  // ذخیرهٔ خودکارِ هر تغییر
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* حافظهٔ مرورگر در دسترس نیست */
    }
  }, [db, hydrated]);

  const value = useMemo<AdminCtx>(
    () => ({
      ready: hydrated,
      logged: true,
      db,
      login: () => true,
      logout: () => router.push("/"),
      saveProducts: (list) => {
        setDb((d) => ({ ...d, products: list }));
        toast("محصولات ذخیره شد");
      },
      upsertProduct: (p) => {
        setDb((d) => ({
          ...d,
          products: d.products.some((x) => x.id === p.id) ? d.products.map((x) => (x.id === p.id ? p : x)) : [p, ...d.products],
        }));
        toast("محصول ذخیره شد", { description: p.name });
      },
      removeProduct: (id) => {
        setDb((d) => ({ ...d, products: d.products.filter((x) => x.id !== id) }));
        toast("محصول حذف شد");
      },
      setOrderStatus: (id, status) => {
        setDb((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
        toast("وضعیت سفارش تغییر کرد", { description: status });
      },
      saveCustomers: (list) => {
        setDb((d) => ({ ...d, customers: list }));
        toast("مشتری‌ها ذخیره شد");
      },
      saveCustomer: (c) => {
        setDb((d) => ({
          ...d,
          customers: d.customers.some((x) => x.id === c.id) ? d.customers.map((x) => (x.id === c.id ? c : x)) : [c, ...d.customers],
        }));
        toast("مشتری ذخیره شد", { description: `${c.firstName} ${c.lastName}` });
      },
      removeCustomer: (id) => {
        setDb((d) => ({ ...d, customers: d.customers.filter((x) => x.id !== id) }));
        toast("مشتری حذف شد");
      },
      saveCoupons: (list) => {
        setDb((d) => ({ ...d, coupons: list }));
        toast("کدهای تخفیف ذخیره شد");
      },
      saveCoupon: (c) => {
        setDb((d) => ({
          ...d,
          coupons: d.coupons.some((x) => x.code === c.code) ? d.coupons.map((x) => (x.code === c.code ? c : x)) : [c, ...d.coupons],
        }));
        toast("کد تخفیف ذخیره شد", { description: c.code });
      },
      removeCoupon: (code) => {
        setDb((d) => ({ ...d, coupons: d.coupons.filter((x) => x.code !== code) }));
        toast("کد تخفیف حذف شد", { description: code });
      },
      saveReviews: (list) => {
        setDb((d) => ({ ...d, reviews: list }));
        toast("دیدگاه‌ها ذخیره شد");
      },
      saveReview: (r) => {
        setDb((d) => ({
          ...d,
          reviews: d.reviews.some((x) => x.id === r.id) ? d.reviews.map((x) => (x.id === r.id ? r : x)) : [r, ...d.reviews],
        }));
        toast("دیدگاه ذخیره شد");
      },
      removeReview: (id) => {
        setDb((d) => ({ ...d, reviews: d.reviews.filter((x) => x.id !== id) }));
        toast("دیدگاه حذف شد");
      },
      saveArticles: (list) => {
        setDb((d) => ({ ...d, articles: list }));
        toast("مقاله‌ها ذخیره شد");
      },
      upsertArticle: (a) => {
        setDb((d) => ({
          ...d,
          articles: d.articles.some((x) => x.slug === a.slug) ? d.articles.map((x) => (x.slug === a.slug ? a : x)) : [a, ...d.articles],
        }));
        toast("مقاله ذخیره شد", { description: a.published ? "منتشر شد و در مجله دیده می‌شود." : "به‌صورت پیش‌نویس ماند." });
      },
      removeArticle: (slug) => {
        setDb((d) => ({ ...d, articles: d.articles.filter((x) => x.slug !== slug) }));
        toast("مقاله حذف شد");
      },
      saveMessages: (list) => {
        setDb((d) => ({ ...d, messages: list }));
        toast("پیام‌ها ذخیره شد");
      },
      saveSettings: (s) => {
        setDb((d) => ({ ...d, settings: s }));
        toast("تنظیمات ذخیره شد");
      },
      saveBanners: (list) => {
        setDb((d) => ({ ...d, banners: list }));
        toast("بنرها ذخیره شد");
      },
      saveBanner: (b) => {
        setDb((d) => ({
          ...d,
          banners: d.banners.some((x) => x.id === b.id) ? d.banners.map((x) => (x.id === b.id ? b : x)) : [b, ...d.banners],
        }));
        toast("بنر ذخیره شد");
      },
      removeBanner: (id) => {
        setDb((d) => ({ ...d, banners: d.banners.filter((x) => x.id !== id) }));
        toast("بنر حذف شد");
      },
      resetDb: () => {
        try {
          window.localStorage.removeItem(KEY);
        } catch {
          /* noop */
        }
        setDb(seedAdminDb());
        toast("داده‌ها بازنشانی شد", { description: "همه‌چیز به حالت اولیه برگشت." });
      },
    }),
    [db, hydrated, router],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AdminStore missing");
  return ctx;
}

// No auth yet — the backend will add real gating. Pass-through for now.
export function AdminGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
