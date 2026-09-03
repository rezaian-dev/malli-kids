"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { CouponModel } from "@/lib/db/models/coupon";
import type { ActionResult } from "@/lib/action-result";
import { couponSchema, type CouponValues } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateCoupons() {
  revalidatePath("/admin/coupons");
}

export async function createCouponAction(
  values: CouponValues,
): Promise<ActionResult> {
  const parsed = couponSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    if (await CouponModel.exists({ code: parsed.data.code })) {
      return { ok: false, error: "این کد از قبل در فهرست است." };
    }

    await CouponModel.create({ ...parsed.data, used: 0, active: true });
    revalidateCoupons();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function setCouponActiveAction(
  code: string,
  active: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await CouponModel.updateOne({ code }, { $set: { active } });
    revalidateCoupons();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
