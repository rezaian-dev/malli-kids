"use client";

import { useEffect, useState } from "react";

// A small client-side collection backed by localStorage. Every module below
// (favorites, notices, orders, tickets, collab requests) needs the exact
// same three operations — read the list, write it back while telling
// everyone it changed, and a hook that stays in sync across tabs and other
// components on this page. One factory instead of five near-identical
// load/persist/useX trios.
export function createLocalList<T>(key: string, event: string) {
  function load(): T[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = window.localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T[]) : [];
    } catch {
      return [];
    }
  }

  function persist(list: T[]) {
    window.localStorage.setItem(key, JSON.stringify(list));
    window.dispatchEvent(new Event(event));
  }

  function useList(): T[] {
    const [all, setAll] = useState<T[]>([]);

    useEffect(() => {
      const sync = () => setAll(load());
      sync();
      window.addEventListener(event, sync);
      window.addEventListener("storage", sync);
      return () => {
        window.removeEventListener(event, sync);
        window.removeEventListener("storage", sync);
      };
    }, []);

    return all;
  }

  return { load, persist, useList };
}
