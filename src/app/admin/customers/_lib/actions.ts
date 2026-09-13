"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { adminAuth } from "@/lib/auth/admin-auth";
import { requireAdmin, getAdminSession } from "@/lib/auth/admin";
import { logAudit } from "@/lib/admin/audit";
import type { ActionResult } from "@/lib/action-result";
import type { AdminCustomer } from "@/types";
import { getAllCustomers } from "./data";

// Polled by the customers + team landings
export async function getAllCustomersAction(): Promise<AdminCustomer[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAllCustomers();
}

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const PROTECTED_ERROR = "حساب مدیر محافظت‌شده است.";
const LAST_ADMIN_ERROR = "امکان تنزل آخرین ادمین وجود ندارد؛ حداقل یک ادمین باید بماند.";
const SELF_DEMOTE_ERROR = "نمی‌توانید سطح دسترسی خودتان را تغییر دهید.";

async function guardTarget(userId: string) {
  const target = await adminAuth.api
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
      await adminAuth.api.banUser({ headers: requestHeaders, body: { userId } });
    } else {
      await adminAuth.api.unbanUser({ headers: requestHeaders, body: { userId } });
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

// Demotion has a separate minimum-admin-count guard.
export async function promoteCustomerAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const target = await adminAuth.api
      .listUsers({
        headers: await headers(),
        query: { filterField: "id", filterValue: userId, filterOperator: "eq" },
      })
      .then((result) => result.users[0]);
    if (!target) return { ok: false, error: FALLBACK_ERROR };
    if (target.role === "admin")
      return { ok: false, error: "این کاربر همین حالا ادمین است." };

    await adminAuth.api.setRole({
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

    await adminAuth.api.removeUser({ headers: await headers(), body: { userId } });
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

// Counts durable admins server-side — never from client-loaded state
async function countAdmins(): Promise<number> {
  const result = await adminAuth.api.listUsers({
    headers: await headers(),
    query: { filterField: "role", filterValue: "admin", filterOperator: "eq" },
  });
  return result.users.length;
}

// Demotes an admin; refuses when it would leave zero admins
export async function demoteAdminAction(userId: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  // Use the admin session to prevent removing the last administrator.
  const session = await getAdminSession();
  if (session?.user.id === userId) {
    return { ok: false, error: SELF_DEMOTE_ERROR };
  }

  try {
    const target = await adminAuth.api
      .listUsers({
        headers: await headers(),
        query: { filterField: "id", filterValue: userId, filterOperator: "eq" },
      })
      .then((result) => result.users[0]);
    if (!target) return { ok: false, error: FALLBACK_ERROR };
    if (target.role !== "admin")
      return { ok: false, error: "این کاربر ادمین نیست." };

    if ((await countAdmins()) <= 1) return { ok: false, error: LAST_ADMIN_ERROR };

    await adminAuth.api.setRole({
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
