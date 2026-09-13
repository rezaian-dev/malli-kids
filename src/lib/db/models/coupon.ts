import "server-only";
import { Schema, model, models, type Model } from "mongoose";

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
    // Jalali "YYYY/MM/DD" — a business date, not an event timestamp, so it stays a plain string.
    until: { type: String, required: true },
  },
  { timestamps: true },
);

export const CouponModel: Model<CouponDoc> =
  (models.Coupon as Model<CouponDoc>) ||
  model<CouponDoc>("Coupon", couponSchema);
