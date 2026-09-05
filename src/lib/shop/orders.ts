import { connectMongoose } from "@/lib/db/mongoose";
import { OrderModel, type OrderDoc } from "@/lib/db/models/order";
import { ProductModel } from "@/lib/db/models/product";
import { incrementCouponUsage } from "@/lib/shop/coupons";
import { canTransitionOrder } from "@/lib/shop/order-status";
import { deriveStock } from "@/lib/shop/inventory";
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

/** 🔐 The one place an order is looked up *for a specific requester* — the
 *  real authorization boundary behind the invoice route (and anywhere else
 *  that needs "this exact order, if this caller is allowed to see it").
 *  Returns `null` for "doesn't exist" and "exists but isn't yours" alike
 *  (never distinguishes the two to an unauthorized caller) unless
 *  `isAdmin` — an admin can pull up any customer's order, same as every
 *  other admin order view. Returns the raw doc (with its real `createdAt`),
 *  not the display-formatted `AdminOrder` — callers that need the
 *  historical snapshot (the invoice) want the untouched values. */
export async function getOrderForRequester(
  orderId: string,
  requester: { userId: string; isAdmin: boolean },
): Promise<(OrderDoc & { createdAt: Date }) | null> {
  await connectMongoose();
  const doc = await OrderModel.findOne({ id: orderId }).lean();
  if (!doc) return null;
  if (!requester.isAdmin && doc.userId !== requester.userId) return null;
  return doc;
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

// 🔁 Mongo's duplicate-key error — the shape of the race the unique+sparse
// `idempotencyKey` index turns into "return the order that already exists"
// instead of a thrown 500.
function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: number }).code === 11000
  );
}

/** 📦 Atomically checks-and-decrements one variant's stock — the actual
 *  overselling fix: this only ever succeeds if the size still has enough
 *  stock at the moment of the write, not at whatever moment the page was
 *  rendered. Returns `false` (nothing decremented) when it doesn't. */
async function decrementVariantStock(
  productId: number,
  size: string,
  qty: number,
): Promise<boolean> {
  const updated = await ProductModel.findOneAndUpdate(
    { id: productId, variants: { $elemMatch: { size, stock: { $gte: qty } } } },
    { $inc: { "variants.$.stock": -qty } },
    { new: true },
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
    { new: true },
  );
  if (updated) {
    await ProductModel.updateOne(
      { id: productId },
      { $set: { stock: deriveStock(updated.variants, updated.stock) } },
    );
  }
}

/** ↩️ Puts each item's variant stock back — called when an order lands on
 *  "مرجوعی" (cancel/return). Legacy/unsized products never had stock
 *  decremented for them in the first place, so they're skipped here too. */
async function restockOrderItems(items: OrderDoc["items"]) {
  for (const item of items) {
    const product = await ProductModel.findOne({ id: item.id }).lean();
    if (product?.variants?.length) await restockVariant(item.id, item.size, item.qty);
  }
}

export type CreateOrderResult =
  | { ok: true; order: AdminOrder }
  | { ok: false; outOfStock: string };

/** 🧾 The one real place an order is created — the checkout dialog's server
 *  action calls this after verifying the session.
 *
 *  🔁 Idempotent when `idempotencyKey` is supplied: a resubmit of the exact
 *  same checkout attempt (double-click, a retried request after a dropped
 *  response) returns the order already created for that key instead of
 *  creating — and double-charging inventory/coupon usage for — a second
 *  one. The upfront lookup is just the fast path; the model's unique+sparse
 *  index is what actually closes the race if two requests for the same key
 *  land at once.
 *
 *  📦 For any item whose product has real variant tracking (`variants`
 *  non-empty), the matching size's stock is checked-and-decremented
 *  atomically before the order is written; a legacy/unsized product keeps
 *  today's behavior (no decrement). Any decrement already applied for an
 *  earlier item in the same order is rolled back if a later item is out of
 *  stock, or if the order document itself fails to write. */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  await connectMongoose();

  if (input.idempotencyKey) {
    const existing = await OrderModel.findOne({
      idempotencyKey: input.idempotencyKey,
    }).lean();
    if (existing) return { ok: true, order: toAdminOrder(existing) };
  }

  const applied: { id: number; size: string; qty: number }[] = [];
  for (const item of input.items) {
    const product = await ProductModel.findOne({ id: item.id }).lean();
    if (!product?.variants?.length) continue;

    const decremented = await decrementVariantStock(item.id, item.size, item.qty);
    if (!decremented) {
      for (const done of applied) await restockVariant(done.id, done.size, done.qty);
      return { ok: false, outOfStock: item.name };
    }
    applied.push({ id: item.id, size: item.size, qty: item.qty });
  }

  const subtotal = input.items.reduce((s, i) => s + i.price * i.qty, 0);
  const discount = Math.round(subtotal * (input.discountRate ?? 0));
  const afterDiscount = subtotal - discount;
  const shipping = afterDiscount >= BRAND.freeShipFrom ? 0 : SHIPPING_FEE;
  const total = afterDiscount + shipping;

  try {
    const doc = await OrderModel.create({
      id: `MK-${Date.now().toString(36).slice(-5).toUpperCase()}`,
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

    if (input.couponCode) await incrementCouponUsage(input.couponCode);

    return { ok: true, order: toAdminOrder(doc.toObject()) };
  } catch (error) {
    for (const done of applied) await restockVariant(done.id, done.size, done.qty);

    if (input.idempotencyKey && isDuplicateKeyError(error)) {
      const existing = await OrderModel.findOne({
        idempotencyKey: input.idempotencyKey,
      }).lean();
      if (existing) return { ok: true, order: toAdminOrder(existing) };
    }
    throw error;
  }
}

export type SetOrderStatusResult =
  | { ok: true; order: AdminOrder }
  | { ok: false; error: "not-found" | "invalid-transition" };

/** 🔒 Enforces `ORDER_TRANSITIONS` (`@/lib/shop/order-status`) — the real
 *  boundary; the admin UI only ever *offers* a legal next status, this is
 *  what actually refuses an illegal one. Restocks variant stock when the
 *  order lands on "مرجوعی" from a non-terminal state. */
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
    { new: true },
  ).lean();
  if (!doc) return { ok: false, error: "not-found" };

  if (status === "مرجوعی" && current.status !== "مرجوعی") {
    await restockOrderItems(current.items);
  }

  return { ok: true, order: toAdminOrder(doc) };
}
