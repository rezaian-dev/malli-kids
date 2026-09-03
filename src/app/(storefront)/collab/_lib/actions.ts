"use server";

import { submitCollabRequest } from "@/lib/shop/collab";
import type { ActionResult } from "@/lib/action-result";
import { collabSchema, type CollabValues } from "./collab-schema";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

export async function submitCollabAction(
  values: CollabValues,
): Promise<ActionResult> {
  const parsed = collabSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    await submitCollabRequest({
      name: parsed.data.name.trim(),
      phone: parsed.data.phone.trim(),
      kind: parsed.data.kind,
      text: parsed.data.text.trim(),
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
