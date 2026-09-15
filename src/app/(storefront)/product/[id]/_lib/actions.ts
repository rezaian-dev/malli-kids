"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { createReview, hasPurchased } from "@/lib/shop/reviews";
import { getProductById } from "@/lib/shop/products";
import type { ActionResult } from "@/lib/action-result";
import { reviewSchema } from "./product-review-schema";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";

/** Only verified buyers may submit reviews; moderation is still required. */
export async function submitReviewAction(
  productId: number,
  values: { rating: string; title?: string; body: string },
): Promise<ActionResult> {
  const parsed = reviewSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const session = await getSession();
  if (!session?.user) return { ok: false, error: AUTH_ERROR };
  const user = { id: session.user.id, name: session.user.name };

  try {
    // Resolve the attribution server-side — the purchase gate and the stored
    // product must come from the same verified object, never client input.
    const product = await getProductById(productId);
    if (!product) return { ok: false, error: "محصول پیدا نشد." };
    if (!(await hasPurchased(user.id, product.id))) {
      return { ok: false, error: "ثبت نظر فقط پس از خرید این محصول ممکن است." };
    }

    await createReview({
      productName: product.name,
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
