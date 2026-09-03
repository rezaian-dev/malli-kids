"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { setCollabStatus, type CollabStatus } from "@/lib/shop/collab";
import type { ActionResult } from "@/lib/action-result";

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

export async function setCollabStatusAction(
  id: string,
  status: CollabStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const found = await setCollabStatus(id, status);
    if (!found) return { ok: false, error: "درخواست پیدا نشد." };

    revalidatePath("/admin/collab");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
