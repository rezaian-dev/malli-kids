"use client";

import { toast } from "@/lib/toast";
import { useAuth } from "@/providers/auth-provider";
import { useFavoritesStore } from "@/providers/favorites-store-provider";
import { toggleFavoriteAction } from "@/lib/shop/favorites-actions";

// Account-backed only — guests hit the login dialog; optimistic, then server-reconciled
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
