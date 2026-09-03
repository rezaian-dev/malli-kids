"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { FestiveBannerModel } from "@/lib/db/models/festive-banner";
import type { ActionResult } from "@/lib/action-result";
import { bannerPatchSchema, type BannerPatch } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateBanners() {
  revalidatePath("/admin/banners");
  // 🎉 The active banner is read once in the root layout for the whole
  // storefront (see `getActiveBanner()`) — that's the segment to bust.
  revalidatePath("/", "layout");
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
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
