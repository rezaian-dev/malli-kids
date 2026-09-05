import { createStore } from "zustand/vanilla";

type FavoritesState = {
  ids: number[];
  setIds: (ids: number[]) => void;
};

export type FavoritesStore = ReturnType<typeof createFavoritesStore>;

// 🪶 Just the ids, optimistically held — the server stays authoritative
export function createFavoritesStore(initialIds: number[]) {
  return createStore<FavoritesState>()((set) => ({
    ids: initialIds,
    setIds: (ids) => set({ ids }),
  }));
}
