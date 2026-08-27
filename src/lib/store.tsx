"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { User } from "@/types";

/**
 * UI-only store.
 *
 * منطق کامل سبد خرید (قیمت، تخفیف، تسویه) عمداً اینجا نیست — آن را بک‌اند
 * بعداً می‌آورد. تنها چیزی که نگه می‌داریم «شمارندهٔ نمایشی سبد» است تا بج
 * روی آیکون هدر معنا داشته باشد.
 *
 * تم با next-themes و باز/بسته شدن منوها با کامپوننت‌های shadcn/ui اداره
 * می‌شود؛ هیچ state دستی برای آن‌ها اینجا نیست.
 */
type Ctx = {
  user: User | null;
  authOpen: boolean;
  cartCount: number;
  setAuthOpen: (v: boolean) => void;
  login: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  addToCart: (qty?: number) => void;
  clearCart: () => void;
  showToast: (text: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function Store({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  const login = useCallback((u: User) => {
    const parts = (u.firstName || "").trim().split(/\s+/);
    setUser({ ...u, firstName: parts[0] || "کاربر", lastName: u.lastName || parts.slice(1).join(" ") || undefined });
    setAuthOpen(false);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)), []);
  const logout = useCallback(() => setUser(null), []);

  /** فقط شمارنده را بالا می‌برد — بدون آیتم، بدون قیمت. */
  const addToCart = useCallback((qty = 1) => setCartCount((n) => Math.min(99, n + qty)), []);
  const clearCart = useCallback(() => setCartCount(0), []);

  const showToast = useCallback((text: string) => toast(text), []);

  const value = useMemo(
    () => ({ user, authOpen, cartCount, setAuthOpen, login, updateUser, logout, addToCart, clearCart, showToast }),
    [user, authOpen, cartCount, login, updateUser, logout, addToCart, clearCart, showToast],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}
