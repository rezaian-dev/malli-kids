"use client";

import { useEffect, useState } from "react";

/**
 * علاقه‌مندی‌ها — قلبِ روی کارتِ محصول و تبِ «علاقه‌مندی‌ها» در پنل.
 * فهرستِ idهای محصول روی localStorage؛ با رویداد زنده بین هدر، کارت‌ها و پنل همگام.
 */

const KEY = "malli_favs";
const EVENT = "favs:change";

export function loadFavs(): number[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function persist(list: number[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function toggleFav(id: number) {
  const list = loadFavs();
  persist(list.includes(id) ? list.filter((x) => x !== id) : [id, ...list]);
}

/** فهرستِ زندهٔ idهای علاقه‌مندی */
export function useFavorites(): number[] {
  const [favs, setFavs] = useState<number[]>([]);

  useEffect(() => {
    const sync = () => setFavs(loadFavs());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return favs;
}
