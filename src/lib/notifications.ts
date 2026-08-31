"use client";

import { useEffect, useState } from "react";
import { faNow } from "./format";

export type NoticeKind = "ticket" | "order" | "system";

export type Notice = {
  id: string;
  owner: string;
  kind: NoticeKind;
  text: string;
  at: string;
  read: boolean;
};

const KEY = "malli_notices";
const EVENT = "notices:change";

export function loadNotices(): Notice[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Notice[]) : [];
  } catch {
    return [];
  }
}

function persist(list: Notice[]) {
  window.localStorage.setItem(KEY, JSON.stringify(list));
  window.dispatchEvent(new Event(EVENT));
}

export function notify(owner: string, kind: NoticeKind, text: string) {
  if (!owner) return;
  const n: Notice = {
    id: `n-${Date.now().toString(36)}-${Math.floor(Math.random() * 999)}`,
    owner,
    kind,
    text,
    at: faNow(),
    read: false,
  };
  persist([n, ...loadNotices()].slice(0, 60));
}

export function markRead(id: string) {
  persist(loadNotices().map((n) => (n.id === id ? { ...n, read: true } : n)));
}

export function markAllRead(owner: string) {
  persist(
    loadNotices().map((n) => (n.owner === owner ? { ...n, read: true } : n)),
  );
}

export function useNotices(owner?: string): Notice[] {
  const [all, setAll] = useState<Notice[]>([]);

  useEffect(() => {
    const sync = () => setAll(loadNotices());
    sync();
    window.addEventListener(EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  if (!owner) return [];
  return all.filter((n) => n.owner === owner);
}
