"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { requireAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { logAudit } from "@/lib/admin/audit";
import type { ActionResult } from "@/lib/action-result";

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const PROTECTED_ERROR = "حساب مدیر محافظت‌شده است.";
const LAST_ADMIN_ERROR = "امکان تنزل آخرین ادمین وجود ندارد؛ حداقل یک ادمین باید بماند.";
const SELF_DEMOTE_ERROR = "نمی‌توانید سطح دسترسی خودتان را تغییر دهید.";

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
    await logAudit({
      actor: admin,
      action: blocked ? "customer.ban" : "customer.unban",
      targetType: "user",
      targetId: userId,
      summary: blocked ? "کاربر مسدود شد" : "مسدودیت کاربر برداشته شد",
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 👑 Promotes a real customer to admin (`role: "admin"`, via Better Auth's
 *  `admin()` plugin) — the missing half of `guardTarget`'s protection below:
 *  that function only ever *shields* an existing admin from being banned/
 *  removed, nothing in this file could ever create one before this action.
 *  The reverse (demote) lives in `demoteAdminAction` below, guarded by the
 *  minimum-admin-count check instead of this function's own blanket
 *  protection — promote/demote are the one pair of admin-role changes the
 *  ops spec explicitly asks for. */
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
    revalidatePath("/admin/team");
    await logAudit({
      actor: admin,
      action: "role.promote",
      targetType: "user",
      targetId: userId,
      summary: `${target.name ?? target.email} به ادمین ارتقا یافت`,
    });
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
    await logAudit({
      actor: admin,
      action: "customer.remove",
      targetType: "user",
      targetId: userId,
      summary: "حساب کاربر حذف شد",
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 🔢 The real `minimum_admin_count >= 1` check behind `demoteAdminAction` —
 *  counts durable admins server-side (never derived from whatever the admin
 *  roster page happens to have loaded on the client). */
async function countAdmins(): Promise<number> {
  const result = await auth.api.listUsers({
    headers: await headers(),
    query: { filterField: "role", filterValue: "admin", filterOperator: "eq" },
  });
  return result.users.length;
}

/** 👇 The other half of `promoteCustomerAction` — demotes an existing admin
 *  back to a regular customer, refusing when it would leave the store with
 *  zero admins. That count check is the actual safeguard; nothing about it
 *  is inferred from what the UI happens to be showing. */
export async function demoteAdminAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  // 🔐 Every admin here is equally privileged (this app's model is flat —
  // `user`/`admin`, no `super_admin` tier), which is what lets *any* admin
  // demote *any other* admin as long as one stays behind. Without this
  // check, that same rule would let an admin demote themselves — not a
  // vertical-privilege-escalation path (they'd only ever lose access,
  // never gain it), but a real self-lockout footgun, and exactly the kind
  // of "can an admin change their own authorization" case a fail-secure
  // review has to close explicitly rather than leave implicit. `requireAdmin()`
  // returns the mapped `User` shape (no id), so the real Better Auth id
  // comes from the session directly — already request-memoized, free here.
  const session = await getSession();
  if (session?.user.id === userId) {
    return { ok: false, error: SELF_DEMOTE_ERROR };
  }

  try {
    const target = await auth.api
      .listUsers({
        headers: await headers(),
        query: { filterField: "id", filterValue: userId, filterOperator: "eq" },
      })
      .then((result) => result.users[0]);
    if (!target) return { ok: false, error: FALLBACK_ERROR };
    if (target.role !== "admin")
      return { ok: false, error: "این کاربر ادمین نیست." };

    if ((await countAdmins()) <= 1) return { ok: false, error: LAST_ADMIN_ERROR };

    await auth.api.setRole({
      headers: await headers(),
      body: { userId, role: "user" },
    });

    revalidatePath("/admin/customers");
    revalidatePath("/admin/team");
    await logAudit({
      actor: admin,
      action: "role.demote",
      targetType: "user",
      targetId: userId,
      summary: `${target.name ?? target.email} از ادمین به کاربر عادی تنزل یافت`,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
