"use client";

import { faNow } from "./format";
import { createLocalList } from "./local-store";

export type NoticeKind = "ticket" | "order" | "system";

export type Notice = {
  id: string;
  owner: string;
  kind: NoticeKind;
  text: string;
  at: string;
  read: boolean;
};

const notices = createLocalList<Notice>("malli_notices", "notices:change");

export const loadNotices = notices.load;

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
  notices.persist([n, ...notices.load()].slice(0, 60));
}

export function markRead(id: string) {
  notices.persist(
    notices.load().map((n) => (n.id === id ? { ...n, read: true } : n)),
  );
}

export function markAllRead(owner: string) {
  notices.persist(
    notices.load().map((n) => (n.owner === owner ? { ...n, read: true } : n)),
  );
}

export function useNotices(owner?: string): Notice[] {
  const all = notices.useList();
  if (!owner) return [];
  return all.filter((n) => n.owner === owner);
}
