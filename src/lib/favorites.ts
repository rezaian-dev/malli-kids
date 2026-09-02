"use client";

import { createLocalList } from "./local-store";

const favs = createLocalList<number>("malli_favs", "favs:change");

export const loadFavs = favs.load;
export const useFavorites = favs.useList;

export function toggleFav(id: number) {
  const list = favs.load();
  favs.persist(
    list.includes(id) ? list.filter((x) => x !== id) : [id, ...list],
  );
}
