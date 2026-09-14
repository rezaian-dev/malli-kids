"use server";

import { revalidatePath, updateTag } from "next/cache";
import { headers } from "next/headers";
import { adminAuth } from "@/lib/auth/admin-auth";
import { isAdminUser } from "@/lib/auth/admin";
import { splitName } from "@/lib/auth/user";
import {
  confirmManualPayment,
  cancelOrder,
  retryCancellationInventory,
  FINANCE_ERRORS,
} from "@/lib/shop/order-finance";
import {
  manualPaymentSchema,
  cancelOrderSchema,
  orderIdSchema,
  type ManualPaymentValues,
  type CancelOrderValues,
} from "@/lib/shop/order-finance-schema";
import { PRODUCTS_TAG } from "@/lib/shop/products";
import { formatToman } from "@/lib/locale/fa";
import { requireAdmin } from "@/lib/auth/admin";
import { getAllOrders, setOrderStatus } from "@/lib/shop/orders";
import { createNotification } from "@/lib/shop/notifications";
import { logAudit } from "@/lib/admin/audit";
import {
  isServiceUnavailable,
  serviceUnavailable,
  type ActionResult,
} from "@/lib/action-result";
import type { AdminOrder, OrderStatus } from "@/types";

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const INVALID_TRANSITION_ERROR = "تغییر به این وضعیت از وضعیت فعلی سفارش مجاز نیست.";

export async function getAllOrdersAction(): Promise<AdminOrder[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAllOrders();
}

export async function setOrderStatusAction(
  id: string,
  status: OrderStatus,
): Promise<ActionResult<AdminOrder>> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const result = await setOrderStatus(id, status);
    if (!result.ok) {
      return {
        ok: false,
        error:
          result.error === "not-found" ? "سفارش پیدا نشد." : INVALID_TRANSITION_ERROR,
      };
    }
    const order = result.order;

    await createNotification({
      userId: order.userId,
      kind: "order",
      text: `وضعیت سفارش ${order.id} به «${status}» تغییر کرد`,
    }).catch(() => console.warn("[orders] Status notification pending."));
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
    return { ok: true, data: order };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

async function requireFinanceAdmin() {
  const session = await adminAuth.api.getSession({
    headers: await headers(),
    query: { disableCookieCache: true },
  });
  if (!session?.user || !isAdminUser(session.user)) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    ...splitName(session.user.name),
  };
}

function refreshFinanceViews() {
  try {
    updateTag(PRODUCTS_TAG);
    for (const path of ["/admin/orders", "/admin", "/profile"]) revalidatePath(path);
  } catch {
    console.warn("[orders] Financial view refresh pending.");
  }
}

export async function confirmOrderPaymentAction(
  values: ManualPaymentValues,
): Promise<ActionResult<AdminOrder>> {
  const parsed = manualPaymentSchema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return { ok: false, error: issue.message, field: String(issue.path[0]) };
  }
  try {
    const actor = await requireFinanceAdmin();
    if (!actor) return { ok: false, error: AUTH_ERROR };
    const result = await confirmManualPayment(
      parsed.data.orderId,
      actor.id,
      parsed.data.reference,
    );
    if (!result.ok)
      return {
        ok: false,
        error: FINANCE_ERRORS[result.error],
        field: result.error === "reference-used" ? "reference" : undefined,
      };
    if (result.changed) {
      await logAudit({
        actor,
        action: "order.payment",
        targetType: "order",
        targetId: result.order.id,
        summary: `تأیید دریافت ${formatToman(result.order.total)} تومان برای سفارش ${result.order.id}`,
      });
      await createNotification({
        userId: result.order.userId,
        kind: "order",
        text: result.order.refundedAmount
          ? `وجه سفارش لغوشده ${result.order.id} تأیید و به کیف پول شما افزوده شد.`
          : `دریافت وجه سفارش ${result.order.id} تأیید شد.`,
      }).catch(() => console.warn("[orders] Payment notification pending."));
    }
    refreshFinanceViews();
    return { ok: true, data: result.order };
  } catch (error) {
    return isServiceUnavailable(error)
      ? serviceUnavailable()
      : { ok: false, error: FALLBACK_ERROR };
  }
}

export async function adminCancelOrderAction(
  values: CancelOrderValues,
): Promise<ActionResult<AdminOrder>> {
  const parsed = cancelOrderSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "اطلاعات لغو سفارش معتبر نیست." };
  try {
    const actor = await requireFinanceAdmin();
    if (!actor) return { ok: false, error: AUTH_ERROR };
    const result = await cancelOrder(
      parsed.data.orderId,
      { userId: actor.id, isAdmin: true },
      parsed.data.reason,
    );
    if (!result.ok) return { ok: false, error: FINANCE_ERRORS[result.error] };
    if (result.changed) {
      await logAudit({
        actor,
        action: "order.cancel",
        targetType: "order",
        targetId: result.order.id,
        summary: `لغو سفارش ${result.order.id}؛ بازگشت ${formatToman(result.order.refundedAmount ?? 0)} تومان`,
      });
      await createNotification({
        userId: result.order.userId,
        kind: "order",
        text: result.order.refundedAmount
          ? `سفارش ${result.order.id} لغو شد و وجه تأییدشده به کیف پول برگشت.`
          : `سفارش ${result.order.id} بدون دریافت وجه لغو شد.`,
      }).catch(() => console.warn("[orders] Cancellation notification pending."));
    }
    refreshFinanceViews();
    return { ok: true, data: result.order };
  } catch (error) {
    return isServiceUnavailable(error)
      ? serviceUnavailable()
      : { ok: false, error: FALLBACK_ERROR };
  }
}

export async function retryOrderInventoryAction(
  id: string,
): Promise<ActionResult<AdminOrder>> {
  if (!orderIdSchema.safeParse(id).success)
    return { ok: false, error: "شناسه سفارش معتبر نیست." };
  try {
    if (!(await requireFinanceAdmin())) return { ok: false, error: AUTH_ERROR };
    const result = await retryCancellationInventory(id);
    if (!result.ok) return { ok: false, error: FINANCE_ERRORS[result.error] };
    refreshFinanceViews();
    return { ok: true, data: result.order };
  } catch (error) {
    return isServiceUnavailable(error)
      ? serviceUnavailable()
      : { ok: false, error: FALLBACK_ERROR };
  }
}
