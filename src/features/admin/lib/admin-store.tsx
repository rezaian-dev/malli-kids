"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAdminDb } from "@/lib/data";
import type {
  AdminArticle,
  AdminCoupon,
  AdminCustomer,
  AdminDb,
  AdminMessage,
  AdminReview,
  AdminSettings,
  OrderStatus,
} from "@/types";
import type { FestiveBanner } from "@/types";
import type { Product } from "@/types";

// Read-only data seam. Data comes from lib/data (static sample for now).
// Mutations are placeholders until the backend is wired — swap each for an
// API call then. The hook API is unchanged so no admin page needs edits.
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
  saveCoupons: (list: AdminCoupon[]) => void;
  saveReviews: (list: AdminReview[]) => void;
  saveArticles: (list: AdminArticle[]) => void;
  saveMessages: (list: AdminMessage[]) => void;
  saveSettings: (s: AdminSettings) => void;
  saveBanners: (list: FestiveBanner[]) => void;
  resetDb: () => void;
};

const Ctx = createContext<AdminCtx | null>(null);
const SOON = "این بخش با راه‌اندازی backend فعال می‌شود";

export function AdminStore({ children }: { children: ReactNode }) {
  const router = useRouter();

  const value = useMemo<AdminCtx>(() => {
    const soon = () => toast(SOON);
    return {
      ready: true,
      logged: true,
      db: getAdminDb(),
      login: () => true,
      logout: () => router.push("/"),
      saveProducts: soon,
      upsertProduct: soon,
      removeProduct: soon,
      setOrderStatus: soon,
      saveCustomers: soon,
      saveCoupons: soon,
      saveReviews: soon,
      saveArticles: soon,
      saveMessages: soon,
      saveSettings: soon,
      saveBanners: soon,
      resetDb: soon,
    };
  }, [router]);

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
