"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { FestiveBannerModel } from "@/lib/db/models/festive-banner";
import { FESTIVE_BANNER_TAG } from "@/lib/shop/banners";
import { logAudit } from "@/lib/admin/audit";
import type { ActionResult } from "@/lib/action-result";
import { bannerPatchSchema, type BannerPatch } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateBanners() {
  revalidatePath("/admin/banners");
  // 🎉 The storefront's active banner is served from `getActiveBanner()`'s
  // own `unstable_cache` (tag `FESTIVE_BANNER_TAG`), not from the route's
  // page/layout cache — this app renders every route dynamically, so
  // there's no route-level cache entry here for `revalidatePath` to bust.
  revalidateTag(FESTIVE_BANNER_TAG, "max");
}

export async function updateBannerAction(
  id: string,
  patch: BannerPatch,
): Promise<ActionResult> {
  const parsed = bannerPatchSchema.safeParse(patch);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();

    // 📌 Only one banner can be pinned at a time — pinning this one unpins
    // every other, atomically, on the real collection instead of a full
    // client-side rewrite of the whole list.
    if (parsed.data.pinned) {
      await FestiveBannerModel.updateMany(
        { _id: { $ne: id } },
        { $set: { pinned: false } },
      );
    }

    const updated = await FestiveBannerModel.findByIdAndUpdate(id, {
      $set: parsed.data,
    });
    if (!updated) return { ok: false, error: "بنر پیدا نشد." };

    revalidateBanners();

    if ("active" in parsed.data || "pinned" in parsed.data) {
      await logAudit({
        actor: admin,
        action: "banner.publish",
        targetType: "banner",
        targetId: id,
        summary: `بنر «${updated.occasion}» ${
          parsed.data.active === false ? "غیرفعال شد" : "منتشر/به‌روزرسانی شد"
        }`,
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
