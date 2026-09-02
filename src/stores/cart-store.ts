import { createStore } from "zustand/vanilla";
import type { StoredCartItem } from "@/lib/storefront-state";

export type CartItem = StoredCartItem;

type CartState = {
  cart: CartItem[];
  addToCart: (id: number, size: string, qty?: number) => void;
  setCartQty: (id: number, size: string, qty: number) => void;
  removeCartItem: (id: number, size: string) => void;
  clearCart: () => void;
};

export type CartStore = ReturnType<typeof createCartStore>;

// 🛒 A cart line is identified by product + size together, never id alone.
function sameLine(item: CartItem, id: number, size: string) {
  return item.id === id && item.size === size;
}

// 🪶 Pure cart math only — no auth gating (see `useAddToCart`) and no
// localStorage/cookie IO (see `CartStoreProvider`, which owns persistence
// and is the only place this factory is called).
export function createCartStore(initialCart: CartItem[]) {
  return createStore<CartState>()((set) => ({
    cart: initialCart,

    addToCart: (id, size, qty = 1) =>
      set((state) => {
        const hit = state.cart.find((item) => sameLine(item, id, size));
        return {
          cart: hit
            ? state.cart.map((item) =>
                item === hit
                  ? { ...item, qty: Math.min(9, item.qty + qty) }
                  : item,
              )
            : [...state.cart, { id, size, qty: Math.min(9, qty) }],
        };
      }),

    setCartQty: (id, size, qty) =>
      set((state) => ({
        cart:
          qty <= 0
            ? state.cart.filter((item) => !sameLine(item, id, size))
            : state.cart.map((item) =>
                sameLine(item, id, size)
                  ? { ...item, qty: Math.min(9, qty) }
                  : item,
              ),
      })),

    removeCartItem: (id, size) =>
      set((state) => ({
        cart: state.cart.filter((item) => !sameLine(item, id, size)),
      })),

    clearCart: () => set({ cart: [] }),
  }));
}
