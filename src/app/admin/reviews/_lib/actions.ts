"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ReviewModel } from "@/lib/db/models/review";
import { logAudit } from "@/lib/admin/audit";
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
    const removed = await ReviewModel.findOneAndDelete({ _id: id }).lean();
    revalidateReviews();
    if (removed) {
      await logAudit({
        actor: admin,
        action: "review.remove",
        targetType: "review",
        targetId: id,
        summary: `نظر «${removed.author}» روی «${removed.product}» حذف شد`,
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function bulkSetReviewsVisibleAction(
  ids: string[],
  visible: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!ids.length) return { ok: true };

  try {
    await connectMongoose();
    await ReviewModel.updateMany({ _id: { $in: ids } }, { $set: { visible } });
    revalidateReviews();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function bulkRemoveReviewsAction(ids: string[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!ids.length) return { ok: true };

  try {
    await connectMongoose();
    await ReviewModel.deleteMany({ _id: { $in: ids } });
    revalidateReviews();
    await logAudit({
      actor: admin,
      action: "review.remove",
      targetType: "review",
      targetId: ids.join(","),
      summary: `${ids.length} نظر به‌صورت گروهی حذف شد`,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
