"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createReview, hasPurchased } from "@/lib/shop/reviews";
import type { ActionResult } from "@/lib/action-result";
import { reviewSchema } from "./product-review-schema";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";

async function requireSessionUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
}

/** ⭐ Submitted by a signed-in buyer from the product page, after the real
 *  purchase check below — held for admin moderation (`visible: false`). */
export async function submitReviewAction(
  productId: number,
  productName: string,
  values: { rating: string; title?: string; body: string },
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const user = await requireSessionUser();
  if (!user) return { ok: false, error: AUTH_ERROR };

  try {
    if (!(await hasPurchased(user.id, productId))) {
      return { ok: false, error: "ثبت نظر فقط پس از خرید این محصول ممکن است." };
    }

    await createReview({
      productName,
      author: user.name,
      rate: Number(parsed.data.rating),
      text: parsed.data.body.trim(),
    });

    revalidatePath("/admin/reviews");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

// 🧾 Checkout (`checkCouponAction`/`createOrderAction`) moved to
// `@/lib/shop/checkout-actions` once the cart sheet started reusing the same
// single-item checkout dialog this page opens — see `CheckoutMount`.
