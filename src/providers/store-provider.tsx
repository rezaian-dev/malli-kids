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
import { pickBanner } from "@/lib/festive/occasions";
import {
  NO_CAMPAIGN,
  clearCookie,
  sanitizeCampaign,
  sanitizeCart,
  sanitizeUser,
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
  logout: () => void;
  addToCart: (id: number, size: string, qty?: number) => void;
  setCartQty: (id: number, size: string, qty: number) => void;
  removeCartItem: (id: number, size: string) => void;
  clearCart: () => void;
  showToast: (text: string) => void;
  priceOf: (price: number) => number;
};

const StoreCtx = createContext<Ctx | null>(null);

function readCampaignFromAdminDb(current: Campaign) {
  try {
    const raw = window.localStorage.getItem(STORAGE.adminDb);
    if (!raw) return current;
    return sanitizeCampaign(JSON.parse(raw)?.settings?.campaign);
  } catch {
    return current;
  }
}

function readBannerFromAdminDb(current: BannerItem | null) {
  try {
    const raw = window.localStorage.getItem(STORAGE.adminDb);
    if (!raw) return current;
    const banners = JSON.parse(raw)?.banners;
    if (!Array.isArray(banners)) return current;
    return pickBanner(banners) ?? null;
  } catch {
    return current;
  }
}

function readLocalUser(current: User | null) {
  try {
    const raw = window.localStorage.getItem(STORAGE.user);
    if (raw === null) return current;
    return sanitizeUser(JSON.parse(raw));
  } catch {
    return current;
  }
}

function readLocalCart(current: CartItem[]) {
  try {
    const raw = window.localStorage.getItem(STORAGE.cart);
    if (raw === null) return current;
    return sanitizeCart(JSON.parse(raw));
  } catch {
    return current;
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
  const [campaign, setCampaign] = useState<Campaign>(boot.campaign);
  const [banner, setBanner] = useState<BannerItem | null>(boot.banner);

  useEffect(() => {
    setUser((current) => readLocalUser(current));
    setCart((current) => readLocalCart(current));
    setCampaign((current) => readCampaignFromAdminDb(current));
    setBanner((current) => readBannerFromAdminDb(current));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

    try {
      if (user) window.localStorage.setItem(STORAGE.user, JSON.stringify(user));
      else window.localStorage.removeItem(STORAGE.user);

      window.localStorage.setItem(STORAGE.cart, JSON.stringify(cart));
    } catch {}

    if (user) writeJsonCookie(STORAGE.user, user);
    else clearCookie(STORAGE.user);

    writeJsonCookie(STORAGE.cart, cart);
    writeJsonCookie(STORAGE.campaign, campaign);
    if (banner) writeJsonCookie(STORAGE.banner, banner);
    else clearCookie(STORAGE.banner);
    writeCookie(STORAGE.boot, "1");
    document.documentElement.dataset.auth = user ? "user" : "guest";
  }, [ready, user, cart, campaign, banner]);

  useEffect(() => {
    const syncFestive = () => {
      const currentCampaign = readCampaignFromAdminDb(campaign);
      const currentBanner = readBannerFromAdminDb(banner);
      setCampaign((prev) =>
        JSON.stringify(prev) === JSON.stringify(currentCampaign)
          ? prev
          : currentCampaign,
      );
      setBanner((prev) => (prev?.id === currentBanner?.id ? prev : currentBanner));
    };

    window.addEventListener("storage", syncFestive);
    window.addEventListener("focus", syncFestive);
    return () => {
      window.removeEventListener("storage", syncFestive);
      window.removeEventListener("focus", syncFestive);
    };
  }, [banner, campaign]);

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
