"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { STORAGE } from "@/lib/constants";
import type { User } from "@/types";

// 🛒 Cart item kept in local storage.
export type CartItem = { id: number; size: string; qty: number };

// 🎉 Active campaign shared across the storefront.
export type Campaign = { active: boolean; percent: number; title: string };

export const NO_CAMPAIGN: Campaign = { active: false, percent: 0, title: "" };

// 🧠 Small client store for auth, cart and campaign state.
type Ctx = {
  user: User | null;
  authOpen: boolean;
  cart: CartItem[];
  cartCount: number;
  setAuthOpen: (v: boolean) => void;
  login: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => void;
  addToCart: (id: number, size: string, qty?: number) => void;
  setCartQty: (id: number, size: string, qty: number) => void;
  removeCartItem: (id: number, size: string) => void;
  clearCart: () => void;
  showToast: (text: string) => void;
  campaign: Campaign;

  priceOf: (price: number) => number;
};

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [campaign, setCampaign] = useState<Campaign>(NO_CAMPAIGN);
  const hydrated = useRef(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE.adminDb);
      const c = raw
        ? (JSON.parse(raw)?.settings?.campaign as Campaign | undefined)
        : undefined;
      if (c && typeof c.percent === "number") {
        setCampaign({
          active: !!c.active,
          percent: Math.min(90, Math.max(0, c.percent)),
          title: c.title ?? "",
        });
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (!hydrated.current) {
      hydrated.current = true;
      try {
        const rawUser = window.localStorage.getItem(STORAGE.user);
        if (rawUser) setUser(JSON.parse(rawUser) as User);
        const rawCart = window.localStorage.getItem(STORAGE.cart);
        if (rawCart) {
          const parsed = JSON.parse(rawCart) as CartItem[];
          if (Array.isArray(parsed))
            setCart(
              parsed.filter((i) => i && typeof i.id === "number" && i.qty > 0),
            );
        }
        return;
      } catch {}
    }
    try {
      if (user) window.localStorage.setItem(STORAGE.user, JSON.stringify(user));
      else window.localStorage.removeItem(STORAGE.user);
      window.localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
    } catch {}
  }, [user, cart]);

  const login = useCallback((u: User) => {
    const parts = (u.firstName || "").trim().split(/\s+/);
    setUser({
      ...u,
      firstName: parts[0] || "کاربر",
      lastName: u.lastName || parts.slice(1).join(" ") || undefined,
    });
    setAuthOpen(false);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<User>) =>
      setUser((prev) => (prev ? { ...prev, ...patch } : prev)),
    [],
  );
  const logout = useCallback(() => setUser(null), []);

  const addToCart = useCallback((id: number, size: string, qty = 1) => {
    setCart((prev) => {
      const hit = prev.find((i) => i.id === id && i.size === size);
      if (hit)
        return prev.map((i) =>
          i === hit ? { ...i, qty: Math.min(9, i.qty + qty) } : i,
        );
      return [...prev, { id, size, qty: Math.min(9, qty) }];
    });
  }, []);

  const setCartQty = useCallback((id: number, size: string, qty: number) => {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.id === id && i.size === size))
        : prev.map((i) =>
            i.id === id && i.size === size
              ? { ...i, qty: Math.min(9, qty) }
              : i,
          ),
    );
  }, []);

  const removeCartItem = useCallback((id: number, size: string) => {
    setCart((prev) => prev.filter((i) => !(i.id === id && i.size === size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((n, i) => n + i.qty, 0), [cart]);

  const showToast = useCallback((text: string) => toast(text), []);

  const priceOf = useCallback(
    (price: number) =>
      campaign.active
        ? Math.max(
            0,
            Math.round((price * (1 - campaign.percent / 100)) / 1000) * 1000,
          )
        : price,
    [campaign],
  );

  const value = useMemo(
    () => ({
      user,
      authOpen,
      cart,
      cartCount,
      setAuthOpen,
      login,
      updateUser,
      logout,
      addToCart,
      setCartQty,
      removeCartItem,
      clearCart,
      showToast,
      campaign,
      priceOf,
    }),
    [
      user,
      authOpen,
      cart,
      cartCount,
      login,
      updateUser,
      logout,
      addToCart,
      setCartQty,
      removeCartItem,
      clearCart,
      showToast,
      campaign,
      priceOf,
    ],
  );

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreCtx);
  if (!ctx) throw new Error("Store missing");
  return ctx;
}
