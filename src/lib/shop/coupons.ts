import { connectMongoose } from "@/lib/db/mongoose";
import { CouponModel } from "@/lib/db/models/coupon";
import { isJalaliPast } from "@/lib/locale/jalali";

export type AppliedCoupon = { code: string; rate: number };

// This is a pre-check; reserveCouponUsage re-enforces the terms atomically.
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

// Reserve atomically before creating the order; release on failure.
// Re-enforces the pre-check (active/rate/min/cap) inside the atomic write, so an
// admin edit landing between the check and the reserve cannot grant a code whose
// terms no longer apply. (Expiry stays pre-check-only: `until` is a free-form
// Jalali string, not safely comparable inside a query filter.)
export async function reserveCouponUsage(
  code: string,
  subtotal: number,
): Promise<string | null> {
  await connectMongoose();
  const updated = await CouponModel.findOneAndUpdate(
    {
      code,
      active: true,
      rate: { $gt: 0 },
      min: { $lte: subtotal },
      $expr: { $lt: ["$used", "$cap"] },
    },
    { $inc: { used: 1 } },
  ).lean();
  return updated?._id.toString() ?? null;
}

// Gives back a reservation whose order never got written.
export async function releaseCouponUsage(reservationId: string): Promise<void> {
  await connectMongoose();
  await CouponModel.updateOne(
    { _id: reservationId, used: { $gt: 0 } },
    { $inc: { used: -1 } },
  );
}

export async function releaseCancelledCoupon(
  reservationId: string,
  orderKey: string,
): Promise<void> {
  await connectMongoose();
  await CouponModel.updateOne(
    { _id: reservationId, releasedOrders: { $ne: orderKey } },
    [
      {
        $set: {
          used: { $max: [0, { $subtract: [{ $ifNull: ["$used", 0] }, 1] }] },
          releasedOrders: {
            $setUnion: [{ $ifNull: ["$releasedOrders", []] }, [orderKey]],
          },
        },
      },
    ],
    { updatePipeline: true },
  );
}
