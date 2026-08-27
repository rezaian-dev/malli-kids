"use client";

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { User } from "@/types";

/**
 * UI-only store.
 *
 * منطق سبد خرید / علاقه‌مندی‌ها به‌طور کامل حذف شد؛ این استور فقط
 * وضعیت‌های «هویتِ نمایشی کاربر» و «باز بودن دیالوگ ورود» را نگه می‌دارد.
 * تم با next-themes مدیریت می‌شود و باز/بسته شدن منوها با خودِ کامپوننت‌های
 * shadcn/ui (Sheet, DropdownMenu, NavigationMenu, Accordion) — بدون state دستی.
 */
type Ctx = {
  user: User | null;
  authOpen: boolean;
  setAuthOpen: (v: boolean) => void;
  login: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  showToast: (text: string) => void;
};

const StoreCtx = createContext<Ctx | null>(null);

export function Store({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const login = useCallback((u: User) => {
    const parts = (u.firstName || "").trim().split(/\s+/);
    setUser({ ...u, firstName: parts[0] || "کاربر", lastName: u.lastName || parts.slice(1).join(" ") || undefined });
    setAuthOpen(false);
  }, []);

  const updateUser = useCallback((patch: Partial<User>) => setUser((prev) => (prev ? { ...prev, ...patch } : prev)), []);
  const logout = useCallback(() => setUser(null), []);
  const showToast = useCallback((text: string) => toast(text), []);

  const value = useMemo(
    () => ({ user, authOpen, setAuthOpen, login, updateUser, logout, showToast }),
    [user, authOpen, login, updateUser, logout, showToast],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}
