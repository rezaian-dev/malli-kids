"use server";

import { getSession } from "@/lib/auth/session";
import { requestBackInStock } from "@/lib/shop/back-in-stock";
import { rateLimit, rateLimitError } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const TOO_FAST_ERROR = "درخواست‌ها کمی سریع ارسال شدند؛ چند لحظه صبر کنید.";

export async function requestBackInStockAction(
  productId: number,
  size?: string,
): Promise<ActionResult> {
  if (!Number.isInteger(productId)) return { ok: false, error: FALLBACK_ERROR };
  // Parity with productSchema — stored sizes never exceed 20 chars.
  if (size !== undefined && (typeof size !== "string" || size.length > 20)) {
    return { ok: false, error: FALLBACK_ERROR };
  }

  const session = await getSession();
  if (!session) return { ok: false, error: AUTH_ERROR };

  const limited = await rateLimit(`back-in-stock:${session.user.id}`, {
    windowMs: 60_000,
    max: 12,
  });
  if (!limited.ok) return rateLimitError(limited, TOO_FAST_ERROR);

  try {
    await requestBackInStock(session.user.id, productId, size);
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
