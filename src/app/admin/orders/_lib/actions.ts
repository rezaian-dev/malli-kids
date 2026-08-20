"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { getAllOrders, setOrderStatus } from "@/lib/shop/orders";
import { createNotification } from "@/lib/shop/notifications";
import { logAudit } from "@/lib/admin/audit";
import type { ActionResult } from "@/lib/action-result";
import type { AdminOrder, OrderStatus } from "@/types";

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const INVALID_TRANSITION_ERROR = "تغییر به این وضعیت از وضعیت فعلی سفارش مجاز نیست.";

/** 🔄 Polled from `AdminOrdersLanding` — a new customer order should show
 *  up in an already-open admin tab without a manual reload. */
export async function getAllOrdersAction(): Promise<AdminOrder[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAllOrders();
}

export async function setOrderStatusAction(
  id: string,
  status: OrderStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const result = await setOrderStatus(id, status);
    if (!result.ok) {
      return {
        ok: false,
        error: result.error === "not-found" ? "سفارش پیدا نشد." : INVALID_TRANSITION_ERROR,
      };
    }
    const order = result.order;

    await createNotification({
      userId: order.userId,
      kind: "order",
      text: `وضعیت سفارش ${order.id} به «${status}» تغییر کرد`,
    });
    await logAudit({
      actor: admin,
      action: "order.status",
      targetType: "order",
      targetId: order.id,
      summary: `وضعیت سفارش ${order.id} به «${status}» تغییر کرد`,
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    revalidatePath("/profile");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
