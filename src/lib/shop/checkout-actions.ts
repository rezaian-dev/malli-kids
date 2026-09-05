"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { getSession, getSessionUser } from "@/lib/auth/session";
import { findApplicableCoupon, type AppliedCoupon } from "@/lib/shop/coupons";
import { createOrder } from "@/lib/shop/orders";
import { getProductById } from "@/lib/shop/products";
import { getCampaign } from "@/lib/shop/settings";
import { campaignPrice } from "@/lib/shop/pricing";
import { getMissingShippingFields } from "@/lib/shop/shipping";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits } from "@/lib/locale/fa";
import type { ActionResult } from "@/lib/action-result";
import type { AdminOrder } from "@/types";

// 🧾 Shared by the product page's single-item "buy now" dialog *and* the
// cart sheet's per-line checkout — both check out one product/size/qty line
// at a time, so this schema/action pair moved out of `product/[id]/_lib`
// (its old, route-local home) once a second route needed it too.
export const checkoutSchema = z.object({
  productId: z.number().int(),
  size: z.string().trim().min(1).max(10),
  qty: z.number().int().min(1).max(9),
  city: z.string().trim().min(2).max(60),
  address: z.string().trim().min(10).max(300),
  phone: z.string().regex(/^\d{11}$/),
  postalCode: z.string().regex(/^\d{10}$/),
  couponCode: z.string().trim().max(20).optional(),
  // 🔁 One key per checkout *attempt* (regenerated whenever the dialog
  // reopens, not per click) — lets the server collapse a double-submit or a
  // retried request into the order that already exists instead of creating
  // a second one. See `createOrder` below.
  idempotencyKey: z.string().uuid().optional(),
});

export type CheckoutValues = z.infer<typeof checkoutSchema>;

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const PROFILE_INCOMPLETE_ERROR = "لطفاً پروفایل خود را تکمیل کنید.";

async function requireSessionUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
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

  // 🔐 Hard gate, mirrored server-side: an order can't ship without a
  // complete profile (phone/address/postalCode), so re-check it here even
  // though the buy panel already nudges/blocks on the client — this is the
  // one path a checkout can't get past without it.
  const profile = await getSessionUser();
  if (!profile || getMissingShippingFields(profile).length) {
    return { ok: false, error: PROFILE_INCOMPLETE_ERROR };
  }

  try {
    const product = await getProductById(parsed.data.productId);
    if (!product) return { ok: false, error: "این محصول دیگر موجود نیست." };

    const unit = campaignPrice(product.price, await getCampaign());
    const subtotal = unit * parsed.data.qty;
    const coupon = parsed.data.couponCode
      ? await findApplicableCoupon(parsed.data.couponCode, subtotal)
      : null;

    const result = await createOrder({
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
      idempotencyKey: parsed.data.idempotencyKey,
    });

    if (!result.ok) {
      return {
        ok: false,
        error: `متأسفانه سایز انتخابی «${parsed.data.size}» از «${result.outOfStock}» دیگر موجود نیست.`,
      };
    }

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/profile");
    return { ok: true, data: result.order };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
