import { connectMongoose } from "@/lib/db/mongoose";
import { CouponModel } from "@/lib/db/models/coupon";
import type { AdminCoupon } from "@/types";

export async function getAllCoupons(): Promise<AdminCoupon[]> {
  await connectMongoose();
  const docs = await CouponModel.find().sort({ createdAt: -1 }).lean();

  return docs.map((doc) => ({
    code: doc.code,
    title: doc.title,
    rate: doc.rate,
    used: doc.used,
    cap: doc.cap,
    active: doc.active,
    min: doc.min,
    until: doc.until,
  }));
}
