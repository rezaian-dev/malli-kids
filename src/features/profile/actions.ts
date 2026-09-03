"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { splitName } from "@/lib/auth/user";
import { connectMongoose } from "@/lib/db/mongoose";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import { Profile } from "./model";
import {
  AVATAR_MAX_BYTES,
  updateAccountSchema,
  updateChildSchema,
  type UpdateAccountValues,
  type UpdateChildValues,
} from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";

// 🔐 Every action re-checks the real session server-side — the client never
// gets to say whose profile it's editing.
async function requireUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user.id ?? null;
}

async function upsertProfile(userId: string, patch: Partial<User>) {
  await connectMongoose();
  await Profile.updateOne({ userId }, { $set: patch }, { upsert: true });
}

export async function updateAccountAction(
  values: UpdateAccountValues,
): Promise<ActionResult<Partial<User>>> {
  const parsed = updateAccountSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  const { name, ...rest } = parsed.data;
  try {
    await auth.api.updateUser({ body: { name }, headers: await headers() });
    await upsertProfile(userId, rest);
    return { ok: true, data: { ...splitName(name), ...rest } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function updateChildAction(
  values: UpdateChildValues,
): Promise<ActionResult<Partial<User>>> {
  const parsed = updateChildSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const userId = await requireUserId();
  if (!userId) return { ok: false, error: AUTH_ERROR };

  try {
    await upsertProfile(userId, parsed.data);
    return { ok: true, data: parsed.data };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

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

export async function removeAvatarAction(): Promise<ActionResult<Partial<User>>> {
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
