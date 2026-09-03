import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🎟️ Discount codes — `code` is the natural unique key (uppercase), used
// directly for lookups/updates/removal instead of a separate id.
export type CouponDoc = {
  code: string;
  title: string;
  rate: number;
  used: number;
  cap: number;
  active: boolean;
  min: number;
  until: string;
};

const couponSchema = new Schema<CouponDoc>(
  {
    code: { type: String, required: true, unique: true, uppercase: true },
    title: { type: String, required: true },
    rate: { type: Number, required: true },
    used: { type: Number, default: 0 },
    cap: { type: Number, required: true },
    active: { type: Boolean, default: true },
    min: { type: Number, default: 0 },
    // 🗓️ Jalali "YYYY/MM/DD", validated with `jalaliParts`/`isJalaliFuture`
    // (see `@/lib/locale/jalali`) — a hand-typed business date, not an event
    // timestamp, so it stays a plain string like the rest of the app's dates.
    until: { type: String, required: true },
  },
  { timestamps: true },
);

export const CouponModel: Model<CouponDoc> =
  (models.Coupon as Model<CouponDoc>) ||
  model<CouponDoc>("Coupon", couponSchema);
