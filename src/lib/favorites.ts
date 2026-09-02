"use client";

import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import { useFavoritesStore } from "@/providers/favorites-store-provider";
import { toggleFavoriteAction } from "@/lib/shop/favorites-actions";

// 💛 Real, account-backed wishlist only — a guest (no session) has nothing
// to persist to, so this sends them to the login dialog instead of silently
// keeping a local list. Optimistic locally, then reconciled with whatever
// the server actually ended up storing (kept as its own hook, rather than
// inlining this at every call site, so `FavButton`/`ProfileWishlistPanel`
// read as "the favorites hook").
export function useFavorites() {
  const { user, setAuthOpen } = useAuth();
  const ids = useFavoritesStore((state) => state.ids);
  const setIds = useFavoritesStore((state) => state.setIds);

  function toggle(id: number) {
    if (!user) {
      setAuthOpen(true);
      toast.warning("برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید");
      return;
    }

    const adding = !ids.includes(id);
    setIds(adding ? [id, ...ids] : ids.filter((x) => x !== id));
    toast.success(
      adding ? "به علاقه‌مندی‌ها اضافه شد ❤️" : "از علاقه‌مندی‌ها حذف شد",
    );
    toggleFavoriteAction(id).then((result) => {
      if (result.ok) setIds(result.data);
    });
  }

  return { ids, toggle };
}
