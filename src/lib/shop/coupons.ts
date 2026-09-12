import { connectMongoose } from "@/lib/db/mongoose";
import { CouponModel } from "@/lib/db/models/coupon";
import { isJalaliPast } from "@/lib/locale/jalali";

export type AppliedCoupon = { code: string; rate: number };

/** 🎟️ Looks up a real, usable coupon for a given cart subtotal — replaces
 *  the checkout dialog's old `loadCoupons()` localStorage read. Returns
 *  `null` for anything invalid, inactive, expired, capped-out, or below its
 *  minimum so the caller doesn't need to know why.
 *
 *  The `used >= cap` check here is the fast path for pricing/display only —
 *  the real cap enforcement under concurrency is `reserveCouponUsage`'s
 *  atomic check-and-increment inside `createOrder`. */
export async function findApplicableCoupon(
  rawCode: string,
  subtotal: number,
): Promise<AppliedCoupon | null> {
  const code = rawCode.trim().toUpperCase();
  if (!code) return null;

  await connectMongoose();
  const coupon = await CouponModel.findOne({ code }).lean();
  if (!coupon || !coupon.active || coupon.rate <= 0) return null;
  if (isJalaliPast(coupon.until)) return null;
  if (coupon.used >= coupon.cap) return null;
  if (coupon.min && subtotal < coupon.min) return null;

  return { code: coupon.code, rate: coupon.rate };
}

/** 🎟️ Atomically reserves one unit of coupon usage — succeeds only if the
 *  coupon is still active and under its cap *at the moment of the write*.
 *  Call before writing the order; call `releaseCouponUsage` if the order
 *  then fails to write. The old "check `used >= cap`, insert the order,
 *  `$inc` later" shape let two simultaneous checkouts both pass the check
 *  and overshoot the cap. */
export async function reserveCouponUsage(code: string): Promise<boolean> {
  await connectMongoose();
  const updated = await CouponModel.findOneAndUpdate(
    { code, active: true, $expr: { $lt: ["$used", "$cap"] } },
    { $inc: { used: 1 } },
  ).lean();
  return updated !== null;
}

/** ↩️ Gives back a reservation from `reserveCouponUsage` — the order it was
 *  held for never got written (write failed, or a lost idempotency race). */
export async function releaseCouponUsage(code: string): Promise<void> {
  await connectMongoose();
  await CouponModel.updateOne({ code }, { $inc: { used: -1 } });
}
