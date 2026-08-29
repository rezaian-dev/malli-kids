"use server";

import { getSession } from "@/lib/auth/session";
import {
  getNotificationsForUser,
  markAllNotificationsRead,
  markNotificationRead,
  type Notice,
} from "./notifications";

async function requireUserId() {
  const session = await getSession();
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
