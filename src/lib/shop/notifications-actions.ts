"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  type Notice,
} from "./notifications";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function getMyNotificationsAction(): Promise<Notice[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  return getNotificationsForUser(userId);
}

export async function markNotificationReadAction(id: string): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;
  await markNotificationRead(id, userId);
}

export async function markAllNotificationsReadAction(): Promise<void> {
  const userId = await requireUserId();
  if (!userId) return;
  await markAllNotificationsRead(userId);
}
