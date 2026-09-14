"use server";

import { headers } from "next/headers";
import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth/auth";
import { splitName } from "@/lib/auth/user";
import { getOrdersForUser } from "@/lib/shop/orders";
import { cancelOrder, FINANCE_ERRORS } from "@/lib/shop/order-finance";
import {
  cancelOrderSchema,
  type CancelOrderValues,
} from "@/lib/shop/order-finance-schema";
import { createNotification } from "@/lib/shop/notifications";
import { PRODUCTS_TAG } from "@/lib/shop/products";
import { logAudit } from "@/lib/admin/audit";
import { formatToman } from "@/lib/locale/fa";
import {
  isServiceUnavailable,
  serviceUnavailable,
  type ActionResult,
} from "@/lib/action-result";
import type { AdminOrder } from "@/types";

export async function getMyOrdersAction(): Promise<
  ActionResult<{ ownerId: string; ownerEmail: string; orders: AdminOrder[] }>
> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    if (!session)
      return { ok: false, error: "برای دیدن سفارش‌ها دوباره وارد حساب شوید." };
    return {
      ok: true,
      data: {
        ownerId: session.user.id,
        ownerEmail: session.user.email,
        orders: await getOrdersForUser(session.user.id),
      },
    };
  } catch (error) {
    return isServiceUnavailable(error)
      ? serviceUnavailable()
      : {
          ok: false,
          error: "دریافت سفارش‌ها انجام نشد؛ لطفاً دوباره تلاش کنید.",
        };
  }
}

export async function cancelMyOrderAction(
  values: CancelOrderValues,
): Promise<ActionResult<AdminOrder>> {
  const parsed = cancelOrderSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: "اطلاعات لغو سفارش معتبر نیست." };
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    if (!session) return { ok: false, error: "برای لغو سفارش دوباره وارد حساب شوید." };
    const result = await cancelOrder(
      parsed.data.orderId,
      { userId: session.user.id },
      parsed.data.reason,
    );
    if (!result.ok)
      return { ok: false, error: FINANCE_ERRORS[result.error], code: result.error };
    if (result.changed) {
      const refund = result.order.refundedAmount ?? 0;
      await createNotification({
        userId: session.user.id,
        kind: "order",
        text:
          refund > 0
            ? `سفارش ${result.order.id} لغو شد و ${formatToman(refund)} تومان به کیف پول برگشت.`
            : `سفارش ${result.order.id} بدون دریافت وجه لغو شد.`,
      }).catch(() => console.warn("[orders] Cancellation notification pending."));
      await logAudit({
        actor: {
          id: session.user.id,
          email: session.user.email,
          ...splitName(session.user.name),
        },
        action: "order.cancel",
        targetType: "order",
        targetId: result.order.id,
        summary: `لغو سفارش ${result.order.id}؛ بازگشت ${formatToman(refund)} تومان به کیف پول`,
      });
    }
    // A cache or notification failure must not reverse a completed financial result.
    try {
      updateTag(PRODUCTS_TAG);
      for (const path of ["/profile", "/admin/orders", "/admin"]) revalidatePath(path);
    } catch {
      console.warn("[orders] Cancellation view refresh pending.");
    }
    return { ok: true, data: result.order };
  } catch (error) {
    return isServiceUnavailable(error)
      ? serviceUnavailable()
      : {
          ok: false,
          error:
            "نتیجه لغو دریافت نشد؛ وضعیت سفارش را تازه‌سازی کنید و دوباره تلاش کنید.",
        };
  }
}
