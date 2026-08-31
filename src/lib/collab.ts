"use client";

import { useEffect, useState } from "react";
import { faNow } from "./format";

export type CollabStatus = "در انتظار بررسی" | "تماس گرفته شد";

export type CollabRequest = {
  id: string;
  name: string;
  phone: string;
  kind: string;
  text: string;
  at: string;
  status: CollabStatus;
};

const KEY = "malli_collab";
const EVENT = "collab:change";

export const COLLAB_KINDS = [
  "خرید عمده و نمایندگی",
  "همکاری در دوخت و تولید",
  "تولید محتوا و بلاگر",
  "عکاسی و مدلینگ",
] as const;

export function loadCollabs(): CollabRequest[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CollabRequest[]) : [];
  } catch {
    return [];
  }
}

function persist(list: CollabRequest[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function submitCollab(input: {
  name: string;
  phone: string;
  kind: string;
  text: string;
}): CollabRequest {
  const r: CollabRequest = {
    id: `c-${Date.now().toString(36)}`,
    ...input,
    at: faNow(),
    status: "در انتظار بررسی",
  };
  persist([r, ...loadCollabs()]);
  return r;
}

export function setCollabStatus(id: string, status: CollabStatus) {
  persist(loadCollabs().map((r) => (r.id === id ? { ...r, status } : r)));
}

export function useCollabs(): CollabRequest[] {
  const [all, setAll] = useState<CollabRequest[]>([]);

  useEffect(() => {
    const sync = () => setAll(loadCollabs());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return all;
}
