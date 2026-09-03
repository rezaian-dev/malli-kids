"use client";

import { useCallback, useEffect, useState } from "react";
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

  const toggle = useCallback(
    (id: number) => {
      if (!user) {
        toast.warning("برای افزودن به علاقه‌مندی‌ها ابتدا وارد شوید");
        setAuthOpen(true);
        return;
      }

      setIds((current) =>
        current.includes(id) ? current.filter((x) => x !== id) : [id, ...current],
      );
      toggleFavoriteAction(id).then((result) => {
        if (result.ok) setIds(result.data);
      });
    },
    [user, setAuthOpen],
  );

  return { ids, toggle };
}
