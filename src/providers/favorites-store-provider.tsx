"use client";

import { createContext, useContext, useEffect, useRef, type ReactNode } from "react";
import { useStore as useZustandStore } from "zustand";
import {
  createFavoritesStore,
  type FavoritesStore,
} from "@/stores/favorites-store";
import { useAuth } from "@/providers/auth-provider";
import { getMyFavoritesAction } from "@/lib/shop/favorites-actions";

const FavoritesStoreCtx = createContext<FavoritesStore | null>(null);

// 💛 Seeded server-side (see `app/layout.tsx`) so a returning signed-in
// user's hearts are already filled on first paint. From then on this only
// reacts to an actual client-side sign-in/sign-out (never on mount, since
// the seed already matches whoever `initialFavorites` was fetched for):
// signing in fetches that account's real favorites, signing out clears them.
export function FavoritesStoreProvider({
  children,
  initialFavorites,
}: {
  children: ReactNode;
  initialFavorites: number[];
}) {
  const { user } = useAuth();
  const storeRef = useRef<FavoritesStore | null>(null);
  storeRef.current ??= createFavoritesStore(initialFavorites);
  const store = storeRef.current;

  const prevEmailRef = useRef(user?.email ?? null);

  useEffect(() => {
    const email = user?.email ?? null;
    if (email === prevEmailRef.current) return;
    prevEmailRef.current = email;

    if (!user) {
      store.setState({ ids: [] });
      return;
    }
    getMyFavoritesAction().then((ids) => store.setState({ ids }));
  }, [user, store]);

  return (
    <FavoritesStoreCtx.Provider value={store}>
      {children}
    </FavoritesStoreCtx.Provider>
  );
}

export function useFavoritesStore<T>(
  selector: (state: ReturnType<FavoritesStore["getState"]>) => T,
): T {
  const store = useContext(FavoritesStoreCtx);
  if (!store) throw new Error("FavoritesStoreProvider missing");
  return useZustandStore(store, selector);
}
