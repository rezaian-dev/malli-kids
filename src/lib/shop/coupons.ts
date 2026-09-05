import { connectMongoose } from "@/lib/db/mongoose";
import { CouponModel } from "@/lib/db/models/coupon";
import { isJalaliPast } from "@/lib/locale/jalali";

export type AppliedCoupon = { code: string; rate: number };

// 🎟️ Returns null for anything invalid/inactive/expired/capped/below minimum.
// This used>=cap check is the display fast path — reserveCouponUsage enforces the real cap atomically.
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

// 🎟️ Atomic check-and-increment; call before writing the order, releaseCouponUsage if the write then fails.
export async function reserveCouponUsage(code: string): Promise<boolean> {
  await connectMongoose();
  const updated = await CouponModel.findOneAndUpdate(
    { code, active: true, $expr: { $lt: ["$used", "$cap"] } },
    { $inc: { used: 1 } },
  ).lean();
  return updated !== null;
}

// ↩️ Gives back a reservation whose order never got written.
export async function releaseCouponUsage(code: string): Promise<void> {
  await connectMongoose();
  await CouponModel.updateOne({ code }, { $inc: { used: -1 } });
}
