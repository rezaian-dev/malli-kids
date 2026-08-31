"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import { STORAGE } from "@/lib/constants";
import {
  NO_CAMPAIGN,
  sanitizeCampaign,
  sanitizeCart,
  sanitizeUser,
  type StoredCampaign,
  type StoredCartItem,
} from "@/lib/storefront-state";
import type { User } from "@/types";

// 🛒 Cart item shared across storage and UI.
export type CartItem = StoredCartItem;

// 🎉 Campaign state shared across the storefront.
export type Campaign = StoredCampaign;

// 🧠 Small client store for auth, cart and campaign state.
type Ctx = {
  ready: boolean;
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

function readCampaignFromAdminDb() {
  try {
    const raw = window.localStorage.getItem(STORAGE.adminDb);
    if (!raw) return NO_CAMPAIGN;
    return sanitizeCampaign(JSON.parse(raw)?.settings?.campaign);
  } catch {
    return NO_CAMPAIGN;
  }
}

function readLocalUser() {
  try {
    const raw = window.localStorage.getItem(STORAGE.user);
    return raw ? sanitizeUser(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}

function readLocalCart() {
  try {
    const raw = window.localStorage.getItem(STORAGE.cart);
    return raw ? sanitizeCart(JSON.parse(raw)) : [];
  } catch {
    return [];
  }
}

function normalizeUser(input: User) {
  const parts = (input.firstName || "").trim().split(/\s+/);
  return {
    ...input,
    firstName: parts[0] || "کاربر",
    lastName: input.lastName || parts.slice(1).join(" ") || undefined,
  } satisfies User;
}

// 🪶 Wait for local storage once, then keep the header stable. ✨
export function StoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [campaign, setCampaign] = useState<Campaign>(NO_CAMPAIGN);

  useEffect(() => {
    setUser(readLocalUser());
    setCart(readLocalCart());
    setCampaign(readCampaignFromAdminDb());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      if (user) window.localStorage.setItem(STORAGE.user, JSON.stringify(user));
      else window.localStorage.removeItem(STORAGE.user);

      window.localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
    } catch {}

    document.documentElement.dataset.auth = user ? "user" : "guest";
  }, [ready, user, cart]);

  const login = useCallback((nextUser: User) => {
    setUser(normalizeUser(nextUser));
    setAuthOpen(false);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<User>) =>
      setUser((current) => (current ? { ...current, ...patch } : current)),
    [],
  );

  const logout = useCallback(() => setUser(null), []);

  const addToCart = useCallback((id: number, size: string, qty = 1) => {
    setCart((current) => {
      const hit = current.find((item) => item.id === id && item.size === size);

      if (hit) {
        return current.map((item) =>
          item === hit ? { ...item, qty: Math.min(9, item.qty + qty) } : item,
        );
      }

      return [...current, { id, size, qty: Math.min(9, qty) }];
    });
  }, []);

  const setCartQty = useCallback((id: number, size: string, qty: number) => {
    setCart((current) =>
      qty <= 0
        ? current.filter((item) => !(item.id === id && item.size === size))
        : current.map((item) =>
            item.id === id && item.size === size
              ? { ...item, qty: Math.min(9, qty) }
              : item,
          ),
    );
  }, []);

  const removeCartItem = useCallback((id: number, size: string) => {
    setCart((current) =>
      current.filter((item) => !(item.id === id && item.size === size)),
    );
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.qty, 0), [cart]);

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
      ready,
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
      ready,
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
