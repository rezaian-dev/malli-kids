"use server";

import { revalidatePath } from "next/cache";
import { getSession, getSessionUser } from "@/lib/auth/session";
import { findApplicableCoupon, type AppliedCoupon } from "@/lib/shop/coupons";
import { createOrder, type CreateOrderInput } from "@/lib/shop/orders";
import { getProductById } from "@/lib/shop/products";
import { getCampaign } from "@/lib/shop/settings";
import { resolvePrice } from "@/lib/shop/pricing";
import { getMissingShippingFields } from "@/lib/shop/shipping";
import { phoneDigits } from "@/lib/digits";
import { toEnDigits } from "@/lib/locale/fa";
import {
  cartCheckoutSchema,
  checkoutSchema,
  type CartCheckoutValues,
  type CheckoutValues,
} from "@/lib/shop/checkout-schema";
import type { ActionResult } from "@/lib/action-result";
import type { AdminOrder } from "@/types";
import type { OrderItemDoc } from "@/lib/db/models/order";

export type { CheckoutValues, CartCheckoutValues };

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const PROFILE_INCOMPLETE_ERROR = "لطفاً پروفایل خود را تکمیل کنید.";
const COUPON_EXHAUSTED_ERROR =
  "ظرفیت این کد تخفیف همین حالا تکمیل شد؛ بدون کد ادامه بدهید یا کد دیگری وارد کنید.";

async function requireSessionUser() {
  const session = await getSession();
  if (!session?.user) return null;
  return { id: session.user.id, name: session.user.name };
}

async function submitOrder(
  input: Omit<CreateOrderInput, "discountRate">,
  subtotal: number,
  selectedSize?: string,
): Promise<ActionResult<AdminOrder>> {
  const coupon = input.couponCode
    ? await findApplicableCoupon(input.couponCode, subtotal)
    : null;
  const result = await createOrder({
    ...input,
    couponCode: coupon?.code,
    discountRate: coupon?.rate,
  });
  if (!result.ok) {
    if (result.couponExhausted) return { ok: false, error: COUPON_EXHAUSTED_ERROR };
    const size = selectedSize === undefined ? "" : ` «${selectedSize}»`;
    return {
      ok: false,
      error: `متأسفانه سایز انتخابی${size} از «${result.outOfStock}» دیگر موجود نیست.`,
    };
  }
  for (const path of ["/admin/orders", "/admin", "/profile"]) revalidatePath(path);
  return { ok: true, data: result.order };
}

export async function checkCouponAction(
  code: string,
  subtotal: number,
): Promise<AppliedCoupon | null> {
  return findApplicableCoupon(code, subtotal);
}

// Read product prices and coupon rates on the server.
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

  // Server-side gate mirrors the client's — an order can't ship without a complete profile.
  const profile = await getSessionUser();
  if (!profile || getMissingShippingFields(profile).length) {
    return { ok: false, error: PROFILE_INCOMPLETE_ERROR };
  }

  try {
    const product = await getProductById(parsed.data.productId);
    // An admin-hidden product 404s on its PDP — it must not stay purchasable here either.
    if (!product || !product.visible)
      return { ok: false, error: "این محصول دیگر موجود نیست." };

    const unit = resolvePrice(product, await getCampaign()).price;
    const subtotal = unit * parsed.data.qty;
    return await submitOrder(
      {
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
        couponCode: parsed.data.couponCode,
        idempotencyKey: parsed.data.idempotencyKey,
      },
      subtotal,
      parsed.data.size,
    );
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function createCartOrderAction(
  values: CartCheckoutValues,
): Promise<ActionResult<AdminOrder>> {
  const parsed = cartCheckoutSchema.safeParse({
    ...values,
    phone: phoneDigits(values.phone),
    postalCode: toEnDigits(values.postalCode).replace(/\D/g, ""),
  });
  if (!parsed.success) return { ok: false, error: "اطلاعات سفارش را کامل کنید." };

  const user = await requireSessionUser();
  if (!user) return { ok: false, error: AUTH_ERROR };

  const profile = await getSessionUser();
  if (!profile || getMissingShippingFields(profile).length) {
    return { ok: false, error: PROFILE_INCOMPLETE_ERROR };
  }

  try {
    const campaign = await getCampaign();
    const items: OrderItemDoc[] = [];
    let subtotal = 0;

    for (const line of parsed.data.items) {
      const product = await getProductById(line.productId);
      // Same as the buy-now path — admin-hidden must not stay purchasable through a stale cart.
      if (!product || !product.visible) {
        return {
          ok: false,
          error: "یکی از کالاهای سبد دیگر موجود نیست؛ سبد را به‌روزرسانی کنید.",
        };
      }
      const unit = resolvePrice(product, campaign).price;
      items.push({
        id: product.id,
        name: product.name,
        img: product.img,
        size: line.size,
        qty: line.qty,
        price: unit,
      });
      subtotal += unit * line.qty;
    }

    return await submitOrder(
      {
        userId: user.id,
        customer: user.name,
        phone: parsed.data.phone,
        city: parsed.data.city,
        address: parsed.data.address,
        postalCode: parsed.data.postalCode,
        items,
        couponCode: parsed.data.couponCode,
        idempotencyKey: parsed.data.idempotencyKey,
      },
      subtotal,
    );
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
