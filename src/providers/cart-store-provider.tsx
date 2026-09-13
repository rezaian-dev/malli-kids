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

// Generic reader — every key safely falls back on corruption
function readLocalCart(scope: string, current: CartItem[]): CartItem[] {
  try {
    const raw = window.localStorage.getItem(cartStorageKey(scope));
    return raw === null ? current : sanitizeCart(JSON.parse(raw));
  } catch {
    return current;
  }
}

// Sweep the pre-namespacing shared `malli_cart` key once
function clearLegacyCartStorage() {
  try {
    window.localStorage.removeItem(STORAGE.cart);
  } catch {}
  if (typeof document !== "undefined") {
    document.cookie = `${STORAGE.cart}=; path=/; max-age=0; samesite=lax`;
  }
}

const CartStoreCtx = createContext<CartStore | null>(null);

// Start from SSR cookies, then restore and persist this account’s local cart.
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

  // Loaded identity — compared on the next scope change
  const scopeRef = useRef(cartScopeOf(user));
  const readyRef = useRef(false);

  useEffect(() => {
    clearLegacyCartStorage();
    store.setState({ cart: readLocalCart(scopeRef.current, store.getState().cart) });
    readyRef.current = true;
  }, [store]);

  // Login/logout swaps to the new identity's cart immediately
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
