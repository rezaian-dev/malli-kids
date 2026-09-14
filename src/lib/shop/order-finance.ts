import "server-only";
import { randomUUID } from "node:crypto";
import type { Types } from "mongoose";
import { connectMongoose } from "@/lib/db/mongoose";
import { OrderModel, type OrderDoc, type OrderRefund } from "@/lib/db/models/order";
import { canCancelBeforeShipping, hasVerifiedPayment } from "./order-status";
import { restoreCancelledStock, toAdminOrder } from "./orders";
import { releaseCancelledCoupon } from "./coupons";
import type { AdminOrder } from "@/types";

type StoredOrder = OrderDoc & { _id: Types.ObjectId };
type FinanceError =
  | "not-found"
  | "too-late"
  | "payment-review"
  | "invalid-total"
  | "conflict"
  | "reference-used";
export type FinanceResult =
  { ok: true; order: AdminOrder; changed: boolean } | { ok: false; error: FinanceError };

export const FINANCE_ERRORS: Record<FinanceError, string> = {
  "not-found": "سفارش پیدا نشد یا متعلق به شما نیست.",
  "too-late": "سفارش ارسال شده و لغو آنلاین ممکن نیست؛ با پشتیبانی تماس بگیرید.",
  "payment-review":
    "پرداخت این سفارش نیاز به تأیید یا بررسی مدیر دارد؛ با پشتیبانی تماس بگیرید.",
  "invalid-total": "مبلغ سفارش قابل تأیید نیست؛ پشتیبانی باید آن را بررسی کند.",
  conflict: "وضعیت سفارش تغییر کرده است؛ آن را تازه‌سازی کنید و دوباره تلاش کنید.",
  "reference-used": "این شماره پیگیری برای سفارش دیگری ثبت شده است؛ رسید را بررسی کنید.",
};

function refundFor(order: StoredOrder, at: Date): OrderRefund {
  return {
    amount: order.total,
    reference: `RF-${order._id.toString().toUpperCase()}`,
    createdAt: at,
  };
}

// This durable work can be retried without crediting money or restoring stock twice.
async function finishCancellation(order: StoredOrder): Promise<StoredOrder> {
  if (!order.cancellation || order.cancellation.inventoryState !== "pending")
    return order;
  try {
    const restored =
      order.stockReservations !== undefined &&
      (await restoreCancelledStock(order.stockReservations, order._id.toString()));
    if (order.couponReservationId)
      await releaseCancelledCoupon(order.couponReservationId, order._id.toString());
    const updated = await OrderModel.findOneAndUpdate(
      { _id: order._id, status: "لغوشده", "cancellation.inventoryState": "pending" },
      { $set: { "cancellation.inventoryState": restored ? "done" : "review" } },
      { returnDocument: "after" },
    ).lean();
    return updated ?? (await OrderModel.findById(order._id).lean()) ?? order;
  } catch {
    console.error("[orders] Cancellation inventory remains pending.");
    return order;
  }
}

export async function cancelOrder(
  id: string,
  actor: { userId: string; isAdmin?: boolean },
  reason = "",
): Promise<FinanceResult> {
  await connectMongoose();
  const owner = actor.isAdmin ? {} : { userId: actor.userId };
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await OrderModel.findOne({ id, ...owner }).lean();
    if (!current) return { ok: false, error: "not-found" };
    if (current.status === "لغوشده") {
      return {
        ok: true,
        order: toAdminOrder(await finishCancellation(current)),
        changed: false,
      };
    }
    if (!canCancelBeforeShipping(current.status)) return { ok: false, error: "too-late" };
    if (current.walletRefund) return { ok: false, error: "payment-review" };
    const verified = hasVerifiedPayment(current.payment, current.total);
    if (
      (current.pay === "پرداخت‌شده" && !verified) ||
      (current.payment && (!verified || current.pay !== "پرداخت‌شده")) ||
      current.pay === "بازگشت به کیف پول"
    ) {
      return { ok: false, error: "payment-review" };
    }
    const at = new Date();
    const refund = verified && current.total > 0 ? refundFor(current, at) : undefined;
    // The cancellation and immutable wallet credit share one atomic order update.
    const updated = await OrderModel.findOneAndUpdate(
      {
        _id: current._id,
        ...owner,
        status: current.status,
        pay: current.pay,
        "payment.id": current.payment?.id ?? { $exists: false },
        walletRefund: { $exists: false },
      },
      {
        $set: {
          status: "لغوشده",
          pay: refund ? "بازگشت به کیف پول" : current.pay,
          cancellation: {
            createdAt: at,
            requestedBy: actor.userId,
            reason: reason.trim().slice(0, 160),
            inventoryState: "pending",
          },
          ...(refund ? { walletRefund: refund } : {}),
        },
      },
      { returnDocument: "after", runValidators: true },
    ).lean();
    if (updated)
      return {
        ok: true,
        order: toAdminOrder(await finishCancellation(updated)),
        changed: true,
      };
  }
  return { ok: false, error: "conflict" };
}

// Only a trusted server action may attest that the full order amount was received.
export async function confirmManualPayment(
  id: string,
  actorId: string,
  reference: string,
): Promise<FinanceResult> {
  await connectMongoose();
  await OrderModel.init();
  for (let attempt = 0; attempt < 4; attempt++) {
    const current = await OrderModel.findOne({ id }).lean();
    if (!current) return { ok: false, error: "not-found" };
    if (hasVerifiedPayment(current.payment, current.total)) {
      return { ok: true, order: toAdminOrder(current), changed: false };
    }
    if (
      current.payment ||
      current.walletRefund ||
      current.pay === "بازگشت به کیف پول" ||
      current.status === "مرجوعی"
    ) {
      return { ok: false, error: "payment-review" };
    }
    if (!Number.isSafeInteger(current.total) || current.total <= 0) {
      return { ok: false, error: "invalid-total" };
    }
    if (current.status === "لغوشده" && !current.cancellation) {
      return { ok: false, error: "payment-review" };
    }
    const at = new Date();
    const refund = current.status === "لغوشده" ? refundFor(current, at) : undefined;
    let updated;
    try {
      updated = await OrderModel.findOneAndUpdate(
        {
          _id: current._id,
          status: current.status,
          pay: current.pay,
          "payment.id": { $exists: false },
          walletRefund: { $exists: false },
        },
        {
          $set: {
            payment: {
              id: randomUUID(),
              method: "manual",
              amount: current.total,
              reference,
              confirmedAt: at,
              confirmedBy: actorId,
            },
            pay: refund ? "بازگشت به کیف پول" : "پرداخت‌شده",
            ...(refund ? { walletRefund: refund } : {}),
          },
        },
        { returnDocument: "after", runValidators: true },
      ).lean();
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "code" in error &&
        error.code === 11000
      ) {
        return { ok: false, error: "reference-used" };
      }
      throw error;
    }
    if (updated) return { ok: true, order: toAdminOrder(updated), changed: true };
  }
  return { ok: false, error: "conflict" };
}

export async function retryCancellationInventory(id: string): Promise<FinanceResult> {
  await connectMongoose();
  const current = await OrderModel.findOne({
    id,
    status: "لغوشده",
    cancellation: { $exists: true },
  }).lean();
  if (!current) return { ok: false, error: "not-found" };
  if (current.cancellation?.inventoryState === "review" && current.stockReservations) {
    const updated = await OrderModel.findOneAndUpdate(
      { _id: current._id, "cancellation.inventoryState": "review" },
      { $set: { "cancellation.inventoryState": "pending" } },
      { returnDocument: "after" },
    ).lean();
    if (updated)
      return {
        ok: true,
        order: toAdminOrder(await finishCancellation(updated)),
        changed: false,
      };
  }
  return {
    ok: true,
    order: toAdminOrder(await finishCancellation(current)),
    changed: false,
  };
}
