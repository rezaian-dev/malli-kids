"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isRetiredCategory, STORAGE } from "@/lib/constants";
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
import { ADMIN_CREDS, seedAdminDb } from "./admin-data";

export type AdminIdentity = {
  username: string;
  name: string;
  avatar?: string;
};

type AdminSession = {
  username: string;
  loggedAt: string | null;
};

type AdminCtx = {
  ready: boolean;
  logged: boolean;
  profile: AdminIdentity;
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
const SESSION_KEY = STORAGE.admin;
const DEFAULT_SESSION: AdminSession = { username: ADMIN_CREDS.user, loggedAt: null };

function loadSession(): AdminSession {
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw) return DEFAULT_SESSION;
    const saved = JSON.parse(raw) as Partial<AdminSession> | string;
    if (typeof saved === "string") return { username: saved, loggedAt: null };
    return {
      username: saved.username?.trim() || ADMIN_CREDS.user,
      loggedAt: saved.loggedAt ?? null,
    };
  } catch {
    return DEFAULT_SESSION;
  }
}

function loadDb(): AdminDb {
  const seed = seedAdminDb();
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return seed;
    const saved = JSON.parse(raw) as Partial<AdminDb>;
    const legacyCustomers = (saved.customers ?? seed.customers).map((customer) => ({
      ...customer,
      role: customer.role ?? ("user" as const),
    }));
    
    
    const adminSeed = seed.customers.find((customer) => customer.role === "admin");
    const customers = legacyCustomers.some((customer) => customer.role === "admin") || !adminSeed
      ? legacyCustomers
      : [adminSeed, ...legacyCustomers];
    return {
      products: (saved.products?.length ? saved.products : seed.products).filter((product) => !isRetiredCategory(product.cat)),
      orders: saved.orders ?? seed.orders,
      customers,
      coupons: saved.coupons ?? seed.coupons,
      reviews: saved.reviews ?? seed.reviews,
      articles: saved.articles ?? seed.articles,
      messages: saved.messages ?? seed.messages,
      banners: saved.banners ?? seed.banners,
      
      settings: { ...seed.settings, ...saved.settings },
    };
  } catch {
    return seed;
  }
}

export function AdminStore({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [db, setDb] = useState<AdminDb>(() => seedAdminDb());
  const [session, setSession] = useState<AdminSession>(DEFAULT_SESSION);
  const [hydrated, setHydrated] = useState(false);

  
  useEffect(() => {
    setDb(loadDb());
    setSession(loadSession());
    setHydrated(true);
  }, []);

  
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      
    }
  }, [db, hydrated]);

  const value = useMemo<AdminCtx>(() => {
    const admins = db.customers.filter((customer) => customer.role === "admin");
    const account = admins.find((customer) => customer.email?.split("@")[0]?.toLocaleLowerCase("en") === session.username.toLocaleLowerCase("en")) ?? admins[0];
    const name = account ? `${account.firstName} ${account.lastName}`.trim() : session.username;
    const profile: AdminIdentity = {
      username: session.username,
      name,
      avatar: account?.avatar,
    };

    return {
      ready: hydrated,
      logged: true,
      profile,
      db,
      login: (user, pass) => {
        const username = user.trim();
        if (username.toLocaleLowerCase("en") !== ADMIN_CREDS.user.toLocaleLowerCase("en") || pass !== ADMIN_CREDS.pass) return false;
        const nextSession = { username, loggedAt: new Date().toISOString() };
        setSession(nextSession);
        try {
          window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
        } catch {
          
        }
        return true;
      },
      logout: () => {
        try {
          window.localStorage.removeItem(SESSION_KEY);
        } catch {
          /* 🪶 No-op. */
        }
        setSession(DEFAULT_SESSION);
        
        
        router.push("/");
      },
      saveProducts: (list) => {
        setDb((d) => ({ ...d, products: list.filter((product) => !isRetiredCategory(product.cat)) }));
        toast("محصولات ذخیره شد");
      },
      upsertProduct: (p) => {
        if (isRetiredCategory(p.cat)) {
          toast.error("این دسته‌بندی دیگر فعال نیست");
          return;
        }
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
          /* 🪶 No-op. */
        }
        setDb(seedAdminDb());
        toast("داده‌ها بازنشانی شد", { description: "همه‌چیز به حالت اولیه برگشت." });
      },
    };
  }, [db, hydrated, router, session]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("AdminStore missing");
  return ctx;
}

// 🪶 Real auth can wrap this gate later.
export function AdminGate({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
