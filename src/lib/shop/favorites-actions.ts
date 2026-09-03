"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { getFavoriteIds, toggleFavorite } from "./favorites";
import type { ActionResult } from "@/lib/action-result";

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

export async function getMyFavoritesAction(): Promise<number[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  return getFavoriteIds(userId);
}

export async function toggleFavoriteAction(id: number): Promise<ActionResult<number[]>> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    const favorites = await toggleFavorite(userId, id);
    return { ok: true, data: favorites };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
