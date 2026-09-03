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
import { toast } from "@/lib/toast";
import { STORAGE } from "@/lib/constants";
import { campaignPrice } from "@/lib/shop/pricing";
import { signOutAction } from "@/lib/auth/actions";
import {
  NO_CAMPAIGN,
  sanitizeCart,
  writeCookie,
  writeJsonCookie,
  type StoreBootstrap,
  type StoredCampaign,
  type StoredCartItem,
} from "@/lib/storefront-state";
import type { FestiveBanner as BannerItem, User } from "@/types";

// 🛒 Cart item shared across storage and UI.
export type CartItem = StoredCartItem;

// 🎉 Campaign state shared across the storefront.
export type Campaign = StoredCampaign;

// 🧠 Small client store for auth, cart and festive state.
type Ctx = {
  ready: boolean;
  user: User | null;
  authOpen: boolean;
  cart: CartItem[];
  cartCount: number;
  campaign: Campaign;
  banner: BannerItem | null;
  setAuthOpen: (v: boolean) => void;
  login: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => Promise<void>;
  addToCart: (id: number, size: string, qty?: number) => void;
  setCartQty: (id: number, size: string, qty: number) => void;
  removeCartItem: (id: number, size: string) => void;
  clearCart: () => void;
  showToast: (text: string) => void;
  priceOf: (price: number) => number;
};

const StoreCtx = createContext<Ctx | null>(null);

// 📦 Every localStorage read below is "parse this key's JSON, sanitize it,
// fall back to what we already have if anything goes wrong" — private
// browsing, a corrupted value, whatever. One generic reader instead of a
// near-identical try/catch per key.
function readLocalJson<T>(
  key: string,
  sanitize: (raw: unknown) => T,
  current: T,
): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw === null ? current : sanitize(JSON.parse(raw));
  } catch {
    return current;
  }
}

function readLocalCart(current: CartItem[]) {
  return readLocalJson(STORAGE.cart, sanitizeCart, current);
}

// 🛒 A cart line is identified by product + size together, never id alone.
function sameLine(item: CartItem, id: number, size: string) {
  return item.id === id && item.size === size;
}

// 🪶 Start from the server snapshot, then sync tiny client deltas. ✨
export function StoreProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: StoreBootstrap;
}) {
  const boot = initialState ?? {
    ready: false,
    user: null,
    cart: [],
    campaign: NO_CAMPAIGN,
    banner: null,
  };

  const [ready, setReady] = useState(boot.ready);
  const [user, setUser] = useState<User | null>(boot.user);
  const [authOpen, setAuthOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(boot.cart);
  // 🎉 Real, server-computed values (see `app/layout.tsx`) — fresh on every
  // navigation, never mutated client-side, so plain variables instead of
  // state that nothing ever sets again.
  const campaign: Campaign = boot.campaign;
  const banner: BannerItem | null = boot.banner;

  useEffect(() => {
    setCart((current) => readLocalCart(current));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      window.localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
    } catch {}

    writeJsonCookie(STORAGE.cart, cart);
    writeCookie(STORAGE.boot, "1");
  }, [ready, cart]);

  // 🔐 Called after a server action (sign in/up) already created the real,
  // httpOnly-cookie-backed session — this only mirrors it into UI state.
  const login = useCallback((nextUser: User) => {
    setUser(nextUser);
    setAuthOpen(false);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<User>) =>
      setUser((current) => (current ? { ...current, ...patch } : current)),
    [],
  );

  // 🔐 Revokes the real session server-side first, then clears UI state.
  const logout = useCallback(async () => {
    await signOutAction();
    setUser(null);
  }, []);

  const addToCart = useCallback((id: number, size: string, qty = 1) => {
    setCart((current) => {
      const hit = current.find((item) => sameLine(item, id, size));
      if (!hit) return [...current, { id, size, qty: Math.min(9, qty) }];

      return current.map((item) =>
        item === hit ? { ...item, qty: Math.min(9, item.qty + qty) } : item,
      );
    });
  }, []);

  const setCartQty = useCallback((id: number, size: string, qty: number) => {
    setCart((current) =>
      qty <= 0
        ? current.filter((item) => !sameLine(item, id, size))
        : current.map((item) =>
            sameLine(item, id, size)
              ? { ...item, qty: Math.min(9, qty) }
              : item,
          ),
    );
  }, []);

  const removeCartItem = useCallback((id: number, size: string) => {
    setCart((current) => current.filter((item) => !sameLine(item, id, size)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const cartCount = useMemo(
    () => cart.reduce((sum, item) => sum + item.qty, 0),
    [cart],
  );

  const showToast = useCallback((text: string) => toast(text), []);

  const priceOf = useCallback(
    (price: number) => campaignPrice(price, campaign),
    [campaign],
  );

  const value = useMemo(
    () => ({
      ready,
      user,
      authOpen,
      cart,
      cartCount,
      campaign,
      banner,
      setAuthOpen,
      login,
      updateUser,
      logout,
      addToCart,
      setCartQty,
      removeCartItem,
      clearCart,
      showToast,
      priceOf,
    }),
    [
      ready,
      user,
      authOpen,
      cart,
      cartCount,
      campaign,
      banner,
      login,
      updateUser,
      logout,
      addToCart,
      setCartQty,
      removeCartItem,
      clearCart,
      showToast,
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
