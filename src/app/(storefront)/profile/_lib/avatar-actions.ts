"use server";

import { connectMongoose } from "@/lib/db/mongoose";
import { Profile } from "@/lib/db/models/profile";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import { AVATAR_MAX_BYTES } from "./schemas";
import { AUTH_ERROR, FALLBACK_ERROR, requireUserId, upsertProfile } from "./shared";

export async function updateAvatarAction(
  dataUrl: string,
): Promise<ActionResult<Partial<User>>> {
  if (!dataUrl.startsWith("data:image/"))
    return { ok: false, error: "فقط فایلِ تصویری مجاز است." };

  const bytes = Math.ceil((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
  if (bytes > AVATAR_MAX_BYTES)
    return { ok: false, error: "حجمِ عکس نباید بیشتر از ۱ مگابایت باشد." };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    await upsertProfile(userId, { avatar: dataUrl });
    return { ok: true, data: { avatar: dataUrl } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeAvatarAction(): Promise<
  ActionResult<Partial<User>>
> {
  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    // 🗑️ `$unset` (not `$set: {avatar: undefined}`, which the driver just
    // drops and does nothing) — actually removes the field.
    await Profile.updateOne({ userId }, { $unset: { avatar: "" } });
    return { ok: true, data: { avatar: undefined } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
