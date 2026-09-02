import { createStore } from "zustand/vanilla";

type FavoritesState = {
  ids: number[];
  setIds: (ids: number[]) => void;
};

export type FavoritesStore = ReturnType<typeof createFavoritesStore>;

// 🪶 Just the ids, optimistically held — the server (`@/lib/shop/favorites`,
// via `favorites-actions.ts`) stays the real, authoritative wishlist. See
// `useFavorites` (`@/hooks/use-favorites.ts`) for the actual toggle/reconcile flow.
export function createFavoritesStore(initialIds: number[]) {
  return createStore<FavoritesState>()((set) => ({
    ids: initialIds,
    setIds: (ids) => set({ ids }),
  }));
}
