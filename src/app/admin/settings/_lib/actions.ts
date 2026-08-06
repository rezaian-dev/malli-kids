"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { SettingsModel } from "@/lib/db/models/settings";
import { SITE_SETTINGS_TAG } from "@/lib/shop/settings";
import type { ActionResult } from "@/lib/action-result";
import { settingsSchema, type SettingsValues } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

export async function updateSettingsAction(
  values: SettingsValues,
): Promise<ActionResult> {
  const parsed = settingsSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await SettingsModel.updateOne(
      { key: "site" },
      {
        $set: {
          campaign: {
            active: parsed.data.active,
            percent: parsed.data.percent,
            title: parsed.data.title,
          },
          support: {
            startHour: parsed.data.supportStart,
            endHour: parsed.data.supportEnd,
            label: parsed.data.supportLabel,
          },
        },
      },
      { upsert: true },
    );

    revalidatePath("/admin/settings");
    revalidateTag(SITE_SETTINGS_TAG, "max");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
