"use client";

import "@/lib/zod-config";
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
import { toast } from "@/lib/toast";
import { STORAGE } from "@/lib/constants";
import { campaignPrice } from "@/lib/shop/pricing";
import { signOutAction } from "@/lib/auth/actions";
import {
  getMyFavoritesAction,
  toggleFavoriteAction,
} from "@/lib/shop/favorites-actions";
import {
  NO_CAMPAIGN,
  cartScopeOf,
  cartStorageKey,
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
  favorites: number[];
  setAuthOpen: (v: boolean) => void;
  login: (u: User) => void;
  updateUser: (patch: Partial<User>) => void;
  logout: () => Promise<void>;
  addToCart: (id: number, size: string, qty?: number) => boolean;
  setCartQty: (id: number, size: string, qty: number) => void;
  removeCartItem: (id: number, size: string) => void;
  clearCart: () => void;
  toggleFavorite: (id: number) => void;
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

function readLocalCart(scope: string, current: CartItem[]) {
  return readLocalJson(cartStorageKey(scope), sanitizeCart, current);
}

// 🧹 Pre-namespacing builds wrote one shared `malli_cart` key regardless of
// who was signed in — the exact leak this scoping fixes. Sweep it once so a
// stale copy of someone's cart can't sit in a shared browser's storage
// forever even though nothing reads that key anymore.
function clearLegacyCartStorage() {
  try {
    window.localStorage.removeItem(STORAGE.cart);
  } catch {}
  if (typeof document !== "undefined") {
    document.cookie = `${STORAGE.cart}=; path=/; max-age=0; samesite=lax`;
  }
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
    favorites: [],
  };

  const [ready, setReady] = useState(boot.ready);
  const [user, setUser] = useState<User | null>(boot.user);
  const [authOpen, setAuthOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>(boot.cart);
  // 💛 Seeded server-side (see `app/layout.tsx`) so a returning signed-in
  // user's hearts are already filled on first paint — never fetched fresh
  // client-side on mount, which was the old flash (empty → filled a beat
  // later). Real state (not a plain variable like `campaign`/`banner`
  // below) because `toggle`/`login`/`logout` all still mutate it in place.
  const [favorites, setFavorites] = useState<number[]>(boot.favorites);
  // 🎉 Real, server-computed values (see `app/layout.tsx`) — fresh on every
  // navigation, never mutated client-side, so plain variables instead of
  // state that nothing ever sets again.
  const campaign: Campaign = boot.campaign;
  const banner: BannerItem | null = boot.banner;

  // 🔐 Which identity's cart is currently loaded — starts at whatever
  // `readStoreBootstrap` already resolved server-side for `boot.user`, kept
  // in a ref (not state) purely to compare against on the next scope change
  // below; it never itself drives a render.
  const scopeRef = useRef(cartScopeOf(boot.user));

  useEffect(() => {
    clearLegacyCartStorage();
    setCart((current) => readLocalCart(scopeRef.current, current));
    setReady(true);
  }, []);

  // 🔐 Login and logout both change *whose* cart this browser should show.
  // Swap straight to that identity's own saved cart (empty if it has none)
  // the moment `user` changes — never keep rendering, or persisting under
  // the new identity's key, whatever the previous identity's cart held.
  useEffect(() => {
    const nextScope = cartScopeOf(user);
    if (nextScope === scopeRef.current) return;
    scopeRef.current = nextScope;
    setCart(readLocalCart(nextScope, []));
  }, [user]);

  useEffect(() => {
    if (!ready) return;

    const key = cartStorageKey(scopeRef.current);
    try {
      window.localStorage.setItem(key, JSON.stringify(cart));
    } catch {}

    writeJsonCookie(key, cart);
    writeCookie(STORAGE.boot, "1");
  }, [ready, cart]);

  // 🔐 Called after a server action (sign in/up) already created the real,
  // httpOnly-cookie-backed session — this only mirrors it into UI state.
  // Favorites weren't known yet at the last page load (there was no session
  // then), so this is the one legitimate post-mount fetch for them — a
  // one-off right after a fresh login, not a flash on every render.
  const login = useCallback((nextUser: User) => {
    setUser(nextUser);
    setAuthOpen(false);
    getMyFavoritesAction().then(setFavorites);
  }, []);

  const updateUser = useCallback(
    (patch: Partial<User>) =>
      setUser((current) => (current ? { ...current, ...patch } : current)),
    [],
  );

  // 🔐 Revokes the real session server-side first, then clears UI state.
  // `setCart([])` here (on top of the scope-change effect above) means the
  // outgoing account's cart is out of memory in the very same batch as
  // `setUser(null)` — no render in between can show it against a "logged
  // out" header.
  const logout = useCallback(async () => {
    await signOutAction();
    setUser(null);
    setFavorites([]);
    setCart([]);
  }, []);

  // 🔐 A cart is a real order-in-waiting, not a scratch list — same rule as
  // favorites/reviews: no session, nothing gets added. Returns whether it
  // actually went in, so callers only fire their own "added to cart" toast
  // when it's true instead of alongside the login dialog.
  const addToCart = useCallback(
    (id: number, size: string, qty = 1) => {
      if (!user) {
        setAuthOpen(true);
        toast.warning("برای افزودن به سبد خرید ابتدا وارد شوید");
        return false;
      }
      setCart((current) => {
        const hit = current.find((item) => sameLine(item, id, size));
        if (!hit) return [...current, { id, size, qty: Math.min(9, qty) }];

        return current.map((item) =>
          item === hit ? { ...item, qty: Math.min(9, item.qty + qty) } : item,
        );
      });
      return true;
    },
    [user],
  );

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

  // 💛 Real, account-backed wishlist only — a guest (no session) has
  // nothing to persist to, so this sends them to the login dialog instead
  // of silently keeping a local list. Optimistic locally, then reconciled
  // with whatever the server actually ended up storing.
  const toggleFavorite = useCallback(
    (id: number) => {
      if (!user) {
        setAuthOpen(true);
        toast.warning("برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید");
        return;
      }

      const adding = !favorites.includes(id);
      setFavorites((current) =>
        adding ? [id, ...current] : current.filter((x) => x !== id),
      );
      toast.success(
        adding ? "به علاقه‌مندی‌ها اضافه شد ❤️" : "از علاقه‌مندی‌ها حذف شد",
      );
      toggleFavoriteAction(id).then((result) => {
        if (result.ok) setFavorites(result.data);
      });
    },
    [user, favorites],
  );

  // 🧮 A plain reduce over the cart — cheap enough (a handful of line
  // items) that memoizing it buys nothing; it still keeps `value`'s own
  // `useMemo` below correctly bailing out, since a primitive number
  // compares by value regardless of how it was computed.
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

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
      favorites,
      setAuthOpen,
      login,
      updateUser,
      logout,
      addToCart,
      setCartQty,
      removeCartItem,
      clearCart,
      toggleFavorite,
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
      favorites,
      login,
      updateUser,
      logout,
      addToCart,
      setCartQty,
      removeCartItem,
      clearCart,
      toggleFavorite,
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
