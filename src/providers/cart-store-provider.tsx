"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useStore as useZustandStore } from "zustand";
import { createCartStore, type CartItem, type CartStore } from "@/stores/cart-store";
import { useAuth } from "@/providers/auth-provider";
import { STORAGE } from "@/lib/constants";
import {
  cartScopeOf,
  cartStorageKey,
  sanitizeCart,
  writeJsonCookie,
} from "@/lib/storefront-state";

// 📦 Every localStorage read below is "parse this key's JSON, sanitize it,
// fall back to what we already have if anything goes wrong" — private
// browsing, a corrupted value, whatever. One generic reader instead of a
// near-identical try/catch per key.
function readLocalCart(scope: string, current: CartItem[]): CartItem[] {
  try {
    const raw = window.localStorage.getItem(cartStorageKey(scope));
    return raw === null ? current : sanitizeCart(JSON.parse(raw));
  } catch {
    return current;
  }
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

const CartStoreCtx = createContext<CartStore | null>(null);

// 🪶 Owns the one thing `cart-store.ts` deliberately doesn't: persistence.
// Starts from the server's cookie-bootstrapped snapshot (no empty-cart
// flash), then on mount lets a real localStorage value (if any) win, and
// from then on mirrors every change back into both localStorage and a
// cookie (so the *next* SSR render can bootstrap from it too).
export function CartStoreProvider({
  children,
  initialCart,
}: {
  children: ReactNode;
  initialCart: CartItem[];
}) {
  const { user } = useAuth();
  const storeRef = useRef<CartStore | null>(null);
  storeRef.current ??= createCartStore(initialCart);
  const store = storeRef.current;

  // 🔐 Which identity's cart is currently loaded — starts at whatever the
  // server already resolved `initialCart` for, kept in a ref (not state)
  // purely to compare against on the next scope change below.
  const scopeRef = useRef(cartScopeOf(user));
  const readyRef = useRef(false);

  useEffect(() => {
    clearLegacyCartStorage();
    store.setState({ cart: readLocalCart(scopeRef.current, store.getState().cart) });
    readyRef.current = true;
  }, [store]);

  // 🔐 Login and logout both change *whose* cart this browser should show.
  // Swap straight to that identity's own saved cart (empty if it has none)
  // the moment `user` changes — never keep rendering, or persisting under
  // the new identity's key, whatever the previous identity's cart held.
  useEffect(() => {
    const nextScope = cartScopeOf(user);
    if (nextScope === scopeRef.current) return;
    scopeRef.current = nextScope;
    store.setState({ cart: readLocalCart(nextScope, []) });
  }, [user, store]);

  useEffect(
    () =>
      store.subscribe((state) => {
        if (!readyRef.current) return;

        const key = cartStorageKey(scopeRef.current);
        try {
          window.localStorage.setItem(key, JSON.stringify(state.cart));
        } catch {}
        writeJsonCookie(key, state.cart);
      }),
    [store],
  );

  return <CartStoreCtx.Provider value={store}>{children}</CartStoreCtx.Provider>;
}

export function useCartStore<T>(selector: (state: ReturnType<CartStore["getState"]>) => T): T {
  const store = useContext(CartStoreCtx);
  if (!store) throw new Error("CartStoreProvider missing");
  return useZustandStore(store, selector);
}
