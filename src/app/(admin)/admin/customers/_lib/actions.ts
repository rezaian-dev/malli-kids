"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requireAdmin } from "@/lib/auth/admin";
import type { ActionResult } from "@/lib/action-result";

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const PROTECTED_ERROR = "حساب مدیر محافظت‌شده است.";

async function guardTarget(userId: string) {
  const target = await auth.api
    .listUsers({
      headers: await headers(),
      query: { filterField: "id", filterValue: userId, filterOperator: "eq" },
    })
    .then((result) => result.users[0]);

  return target?.role === "admin" ? null : target;
}

export async function setCustomerStatusAction(
  userId: string,
  blocked: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    if (!(await guardTarget(userId))) return { ok: false, error: PROTECTED_ERROR };

    const requestHeaders = await headers();
    if (blocked) {
      await auth.api.banUser({ headers: requestHeaders, body: { userId } });
    } else {
      await auth.api.unbanUser({ headers: requestHeaders, body: { userId } });
    }

    revalidatePath("/admin/customers");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 👑 Promotes a real customer to admin (`role: "admin"`, via Better Auth's
 *  `admin()` plugin) — the missing half of `guardTarget`'s protection below:
 *  that function only ever *shields* an existing admin from being banned/
 *  removed, nothing in this file could ever create one before this action.
 *  One-way on purpose (no demote here) — an admin who needs their own
 *  access revoked is a decision for whoever controls `ADMIN_EMAILS`/the
 *  database directly, not a button anyone with console access can click on
 *  another admin (including themselves). */
export async function promoteCustomerAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const target = await auth.api
      .listUsers({
        headers: await headers(),
        query: { filterField: "id", filterValue: userId, filterOperator: "eq" },
      })
      .then((result) => result.users[0]);
    if (!target) return { ok: false, error: FALLBACK_ERROR };
    if (target.role === "admin")
      return { ok: false, error: "این کاربر همین حالا ادمین است." };

    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role: "admin" },
    });

    revalidatePath("/admin/customers");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeCustomerAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    if (!(await guardTarget(userId))) return { ok: false, error: PROTECTED_ERROR };

    await auth.api.removeUser({ headers: await headers(), body: { userId } });
    revalidatePath("/admin/customers");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
