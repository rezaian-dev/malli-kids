"use server";

import { getSession } from "@/lib/auth/session";
import { requestBackInStock } from "@/lib/shop/back-in-stock";
import type { ActionResult } from "@/lib/action-result";

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

export async function requestBackInStockAction(
  productId: number,
  size?: string,
): Promise<ActionResult> {
  const session = await getSession();
  if (!session) return { ok: false, error: AUTH_ERROR };

  try {
    await requestBackInStock(session.user.id, productId, size);
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
