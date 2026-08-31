import { isRetiredCategory, STORAGE } from "@/lib/constants";
import { seedAdminDb } from "@/lib/admin/admin-data";
import { CATALOG } from "@/lib/data/products";
import type { AdminCoupon, AdminReview, FestiveBanner, Product } from "@/types";

type Saved = { products?: Product[]; coupons?: AdminCoupon[]; banners?: FestiveBanner[]; reviews?: AdminReview[] };

function read(): Saved | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE.adminDb);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

export function loadCatalog(): Product[] {
  const saved = read()?.products;
  const source = saved?.length ? saved : CATALOG;
  return source.filter((product) => !isRetiredCategory(product.cat));
}

export function findCatalogProduct(id: number): Product | undefined {
  return loadCatalog().find((p) => p.id === id);
}

export function loadCoupons(): AdminCoupon[] {
  return read()?.coupons ?? seedAdminDb().coupons;
}

export function loadBanners(): FestiveBanner[] {
  return read()?.banners ?? seedAdminDb().banners;
}

export function loadReviews(visibleOnly = false): AdminReview[] {
  const list = read()?.reviews ?? seedAdminDb().reviews;
  return visibleOnly ? list.filter((r) => r.visible) : list;
}
