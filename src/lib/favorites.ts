"use client";

import { useEffect, useState } from "react";
import { useStore } from "@/providers/store-provider";
import { toast } from "@/lib/toast";
import { getMyFavoritesAction, toggleFavoriteAction } from "@/lib/shop/favorites-actions";

// 💛 Real, account-backed wishlist only — a guest (no session) has nothing
// to persist to, so `toggle` sends them to the login dialog instead of
// silently keeping a local list.
export function useFavorites() {
  const { user, setAuthOpen } = useStore();
  const [ids, setIds] = useState<number[]>([]);

  useEffect(() => {
    if (!user) {
      setIds([]);
      return;
    }
    let active = true;
    getMyFavoritesAction().then((next) => {
      if (active) setIds(next);
    });
    return () => {
      active = false;
    };
  }, [user]);

  // 🍞 The toast belongs *here*, not at each call site — it's the only
  // place that actually knows whether the toggle went through (guest → auth
  // dialog, no list change) or really added/removed an id. A caller like
  // `FavButton` that fires its own "added ❤️" toast unconditionally would
  // show it right alongside the login dialog for a signed-out click.
  function toggle(id: number) {
    if (!user) {
      toast.warning("برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید");
      setAuthOpen(true);
      return;
    }

    const adding = !ids.includes(id);
    setIds((current) =>
      adding ? [id, ...current] : current.filter((x) => x !== id),
    );
    toast.success(adding ? "به علاقه‌مندی‌ها اضافه شد ❤️" : "از علاقه‌مندی‌ها حذف شد");
    toggleFavoriteAction(id).then((result) => {
      if (result.ok) setIds(result.data);
    });
  }

  return { ids, toggle };
}
