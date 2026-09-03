"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ReviewModel } from "@/lib/db/models/review";
import type { ActionResult } from "@/lib/action-result";
import type { AdminReview } from "@/types";
import { getAllReviews } from "./data";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

/** 🔄 Polled from `AdminReviewsLanding` — a freshly-submitted customer
 *  review should show up in an already-open admin tab without a reload. */
export async function getAllReviewsAction(): Promise<AdminReview[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAllReviews();
}

function revalidateReviews() {
  revalidatePath("/admin/reviews");
  revalidatePath("/admin");
}

export async function setReviewVisibleAction(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await ReviewModel.updateOne({ _id: id }, { $set: { visible } });
    revalidateReviews();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeReviewAction(id: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await ReviewModel.deleteOne({ _id: id });
    revalidateReviews();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
