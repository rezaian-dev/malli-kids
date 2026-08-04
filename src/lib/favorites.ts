"use client";

import { useStore } from "@/providers/store-provider";

// 💛 Thin proxy over the store's `favorites`/`toggleFavorite` — kept as its
// own hook (rather than inlining `useStore()` at every call site) so
// `FavButton` and `ProfileWishlistPanel` read as "the favorites hook", and
// so the store itself stays the single owner of this list (seeded
// server-side in `app/layout.tsx`, no post-mount fetch/flash — see
// `store-provider.tsx`).
export function useFavorites() {
  const { favorites, toggleFavorite } = useStore();
  return { ids: favorites, toggle: toggleFavorite };
}
