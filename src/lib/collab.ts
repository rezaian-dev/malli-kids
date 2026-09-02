"use client";

import { faNow } from "./format";
import { createLocalList } from "./local-store";

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

export const COLLAB_KINDS = [
  "خرید عمده و نمایندگی",
  "همکاری در دوخت و تولید",
  "تولید محتوا و بلاگر",
  "عکاسی و مدلینگ",
] as const;

const collabs = createLocalList<CollabRequest>("malli_collab", "collab:change");

export const loadCollabs = collabs.load;
export const useCollabs = collabs.useList;

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
  collabs.persist([r, ...collabs.load()]);
  return r;
}

export function setCollabStatus(id: string, status: CollabStatus) {
  collabs.persist(
    collabs.load().map((r) => (r.id === id ? { ...r, status } : r)),
  );
}
