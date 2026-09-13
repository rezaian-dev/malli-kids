import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { OrderModel, type OrderDoc } from "@/lib/db/models/order";
import { ProductModel } from "@/lib/db/models/product";
import { releaseCouponUsage, reserveCouponUsage } from "@/lib/shop/coupons";
import { canTransitionOrder } from "@/lib/shop/order-status";
import { deriveStock } from "@/lib/shop/inventory";
import { notifyBackInStock } from "@/lib/shop/back-in-stock";
import { BRAND, SHIPPING_FEE } from "@/lib/constants";
import { faDate } from "@/lib/locale/fa";
import type { AdminOrder, OrderStatus } from "@/types";

function toAdminOrder(doc: OrderDoc & { createdAt: Date }): AdminOrder {
  return {
    id: doc.id,
    userId: doc.userId,
    date: faDate(doc.createdAt),
    customer: doc.customer,
    phone: doc.phone,
    city: doc.city,
    address: doc.address,
    postalCode: doc.postalCode,
    items: doc.items,
    subtotal: doc.subtotal,
    discount: doc.discount,
    shipping: doc.shipping,
    total: doc.total,
    coupon: doc.couponCode,
    status: doc.status,
    pay: doc.pay,
    note: doc.note,
  };
}

export async function getAllOrders(): Promise<AdminOrder[]> {
  await connectMongoose();
  const docs = await OrderModel.find().sort({ createdAt: -1 }).lean();
  return docs.map(toAdminOrder);
}

export async function getOrdersForUser(userId: string): Promise<AdminOrder[]> {
  await connectMongoose();
  const docs = await OrderModel.find({ userId }).sort({ createdAt: -1 }).lean();
  return docs.map(toAdminOrder);
}

// Return null for missing or unowned orders unless the requester is an admin.
export async function getOrderForRequester(
  orderId: string,
  requester: { userId: string; isAdmin: boolean },
): Promise<(OrderDoc & { createdAt: Date }) | null> {
  await connectMongoose();
  return OrderModel.findOne({
    id: orderId,
    ...(!requester.isAdmin ? { userId: requester.userId } : {}),
  }).lean();
}

export type CreateOrderInput = {
  userId: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  items: OrderDoc["items"];
  couponCode?: string;
  discountRate?: number;
  idempotencyKey?: string;
};

// A duplicate idempotency key identifies an existing checkout.
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

// Retry IDs that collide within the same millisecond.
function newOrderId(): string {
  return `MK-${Date.now().toString(36).slice(-5).toUpperCase()}`;
}

// Retry order-ID collisions; reuse the winner for idempotency-key collisions.
function isOrderIdCollision(error: unknown): boolean {
  if (!isDuplicateKeyError(error)) return false;
  const keyValue = (error as { keyValue?: Record<string, unknown> }).keyValue;
  return !!keyValue && "id" in keyValue && !("idempotencyKey" in keyValue);
}

// Check available stock in the same atomic write that decrements it.
async function decrementVariantStock(
  productId: number,
  size: string,
  qty: number,
): Promise<boolean> {
  const updated = await ProductModel.findOneAndUpdate(
    { id: productId, variants: { $elemMatch: { size, stock: { $gte: qty } } } },
    { $inc: { "variants.$.stock": -qty } },
    { returnDocument: "after" },
  );
  if (!updated) return false;
  await ProductModel.updateOne(
    { id: productId },
    { $set: { stock: deriveStock(updated.variants, updated.stock) } },
  );
  return true;
}

async function restockVariant(productId: number, size: string, qty: number) {
  const updated = await ProductModel.findOneAndUpdate(
    { id: productId, "variants.size": size },
    { $inc: { "variants.$.stock": qty } },
    { returnDocument: "after" },
  );
  if (updated) {
    await ProductModel.updateOne(
      { id: productId },
      { $set: { stock: deriveStock(updated.variants, updated.stock) } },
    );
    // A return/rollback is a genuine stock increase — notify like any admin restock.
    await notifyBackInStock(productId, size);
  }
}

// Restocks variant stock on cancel/return; legacy unsized products are skipped
async function restockOrderItems(items: OrderDoc["items"]) {
  for (const item of items) {
    const product = await ProductModel.findOne({ id: item.id }).lean();
    if (product?.variants?.length) await restockVariant(item.id, item.size, item.qty);
  }
}

export type CreateOrderResult =
  | { ok: true; order: AdminOrder }
  | { ok: false; outOfStock: string; couponExhausted?: boolean };

// Reserve stock and coupons atomically; roll back failed order creation.
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  await connectMongoose();

  if (input.idempotencyKey) {
    const existing = await OrderModel.findOne({
      idempotencyKey: input.idempotencyKey,
    }).lean();
    if (existing) return { ok: true, order: toAdminOrder(existing) };
  }

  const reservedStock: { id: number; size: string; qty: number }[] = [];
  let couponReserved = false;

  async function rollback() {
    if (couponReserved && input.couponCode) {
      couponReserved = false;
      await releaseCouponUsage(input.couponCode);
    }
    for (const { id, size, qty } of reservedStock) await restockVariant(id, size, qty);
  }

  for (const item of input.items) {
    const product = await ProductModel.findOne({ id: item.id }).lean();
    if (!product?.variants?.length) continue;

    const decremented = await decrementVariantStock(item.id, item.size, item.qty);
    if (!decremented) {
      await rollback();
      return { ok: false, outOfStock: item.name };
    }
    reservedStock.push({ id: item.id, size: item.size, qty: item.qty });
  }

  // Reserve coupon usage before writing the order.
  if (input.couponCode) {
    couponReserved = await reserveCouponUsage(input.couponCode);
    if (!couponReserved) {
      await rollback();
      return { ok: false, outOfStock: "", couponExhausted: true };
    }
  }

  const subtotal = input.items.reduce((total, item) => total + item.price * item.qty, 0);
  const discount = Math.round(subtotal * (input.discountRate ?? 0));
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const doc = await OrderModel.create({
        id: newOrderId(),
        userId: input.userId,
        idempotencyKey: input.idempotencyKey,
        customer: input.customer,
        phone: input.phone,
        city: input.city,
        address: input.address,
        postalCode: input.postalCode,
        items: input.items,
        subtotal,
        discount,
        shipping,
        total,
        couponCode: input.couponCode,
        status: "جدید",
        pay: "پرداخت‌شده",
      });

      return { ok: true, order: toAdminOrder(doc.toObject()) };
    } catch (error) {
      // Same-millisecond collision — nothing written; regenerate and retry
      if (isOrderIdCollision(error)) continue;

      await rollback();

      if (input.idempotencyKey && isDuplicateKeyError(error)) {
        const existing = await OrderModel.findOne({
          idempotencyKey: input.idempotencyKey,
        }).lean();
        // The winner holds the one real reservation; this loser's was rolled back
        if (existing) return { ok: true, order: toAdminOrder(existing) };
      }
      throw error;
    }
  }

  // Release all reservations after exhausting ID retries.
  await rollback();
  throw new Error("createOrder: order id collision");
}

export type SetOrderStatusResult =
  | { ok: true; order: AdminOrder }
  | { ok: false; error: "not-found" | "invalid-transition" };

// The real enforcement boundary for ORDER_TRANSITIONS; restocks variant stock on a return.
export async function setOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<SetOrderStatusResult> {
  await connectMongoose();
  const current = await OrderModel.findOne({ id }).lean();
  if (!current) return { ok: false, error: "not-found" };
  if (!canTransitionOrder(current.status, status)) {
    return { ok: false, error: "invalid-transition" };
  }

  const doc = await OrderModel.findOneAndUpdate(
    { id },
    { $set: { status } },
    { returnDocument: "after" },
  ).lean();
  if (!doc) return { ok: false, error: "not-found" };

  if (status === "مرجوعی" && current.status !== "مرجوعی") {
    await restockOrderItems(current.items);
  }

  return { ok: true, order: toAdminOrder(doc) };
}

// Cache the count of distinct customers with non-returned orders.
export const getHappyCustomerCount = unstable_cache(
  async (): Promise<number> => {
    try {
      await connectMongoose();
      const ids = await OrderModel.distinct("userId", {
        status: { $ne: "مرجوعی" },
      });
      return ids.length;
    } catch (err) {
      console.warn(
        "[orders] getHappyCustomerCount failed — returning 0:",
        (err as Error).message,
      );
      return 0;
    }
  },
  ["happy-customer-count"],
  { revalidate: REVALIDATE.merch },
);
