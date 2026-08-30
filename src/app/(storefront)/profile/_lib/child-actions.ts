"use server";

import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import { updateChildSchema, type UpdateChildValues } from "./schemas";
import { AUTH_ERROR, FALLBACK_ERROR, requireUserId, upsertProfile } from "./shared";

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
