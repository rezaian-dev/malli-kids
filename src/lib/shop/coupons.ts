import { connectMongoose } from "@/lib/db/mongoose";
import { CouponModel } from "@/lib/db/models/coupon";

export type AppliedCoupon = { code: string; rate: number };

/** 🎟️ Looks up a real, usable coupon for a given cart subtotal — replaces
 *  the checkout dialog's old `loadCoupons()` localStorage read. Returns
 *  `null` for anything invalid, inactive, capped-out, or below its minimum
 *  so the caller doesn't need to know why. */
export async function findApplicableCoupon(
  rawCode: string,
  subtotal: number,
): Promise<AppliedCoupon | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  await connectMongoose();
  const coupon = await CouponModel.findOne({ code }).lean();
  if (!coupon || !coupon.active || coupon.rate <= 0) return null;
  if (coupon.used >= coupon.cap) return null;
  if (coupon.min && subtotal < coupon.min) return null;

  return { code: coupon.code, rate: coupon.rate };
}

/** 📈 Called once an order that used a coupon is actually placed. */
export async function incrementCouponUsage(code: string): Promise<void> {
  await connectMongoose();
  await CouponModel.updateOne({ code }, { $inc: { used: 1 } });
}
