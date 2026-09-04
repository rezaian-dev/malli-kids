"use server";

import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth/session";
import { findApplicableCoupon, type AppliedCoupon } from "@/lib/shop/coupons";
import { createOrder } from "@/lib/shop/orders";
import { getProductById } from "@/lib/shop/products";
import { createReview, hasPurchased } from "@/lib/shop/reviews";
import { getCampaign } from "@/lib/shop/settings";
import { campaignPrice } from "@/lib/shop/pricing";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits } from "@/lib/locale/fa";
import type { ActionResult } from "@/lib/action-result";
import type { AdminOrder } from "@/types";
import { reviewSchema } from "./product-review-schema";
import { checkoutSchema, type CheckoutValues } from "./checkout-schema";

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

export async function checkCouponAction(
  code: string,
  subtotal: number,
): Promise<AppliedCoupon | null> {
  return findApplicableCoupon(code, subtotal);
}

/** 🧾 The one real place a "buy now" checkout becomes an order. Product
 *  name/image/price and the coupon rate are all re-read server-side — the
 *  client only ever supplies a reference (product id, coupon code) plus its
 *  own delivery details, never the numbers that decide the total. */
export async function createOrderAction(
  values: CheckoutValues,
): Promise<ActionResult<AdminOrder>> {
  const parsed = checkoutSchema.safeParse({
    ...values,
    phone: phoneDigits(values.phone),
    postalCode: toEnDigits(values.postalCode).replace(/\D/g, ""),
  });
  if (!parsed.success) return { ok: false, error: "اطلاعات سفارش را کامل کنید." };

  const user = await requireSessionUser();
  if (!user) return { ok: false, error: AUTH_ERROR };

  try {
    const product = await getProductById(parsed.data.productId);
    if (!product) return { ok: false, error: "این محصول دیگر موجود نیست." };

    const unit = campaignPrice(product.price, await getCampaign());
    const subtotal = unit * parsed.data.qty;
    const coupon = parsed.data.couponCode
      ? await findApplicableCoupon(parsed.data.couponCode, subtotal)
      : null;

    const order = await createOrder({
      userId: user.id,
      customer: user.name,
      phone: parsed.data.phone,
      city: parsed.data.city,
      address: parsed.data.address,
      postalCode: parsed.data.postalCode,
      items: [
        {
          id: product.id,
          name: product.name,
          img: product.img,
          size: parsed.data.size,
          qty: parsed.data.qty,
          price: unit,
        },
      ],
      couponCode: coupon?.code,
      discountRate: coupon?.rate,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/profile");
    return { ok: true, data: order };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
