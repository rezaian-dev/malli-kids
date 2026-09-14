import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { OrderStatus, PayStatus } from "@/types";

// id is a short human-facing code ("MK-XXXXX"); userId is the real Better Auth user id.
export type OrderItemDoc = {
  id: number;
  name: string;
  img: string;
  size: string;
  qty: number;
  price: number;
};

export type StockReservation = { id: number; size: string; qty: number };
export type OrderPayment = {
  id: string;
  method: "manual" | "gateway";
  amount: number;
  reference: string;
  confirmedAt: Date;
  confirmedBy: string;
};
export type OrderCancellation = {
  createdAt: Date;
  requestedBy: string;
  reason?: string;
  inventoryState: "pending" | "done" | "review";
};
export type OrderRefund = { amount: number; reference: string; createdAt: Date };

export type OrderDoc = {
  id: string;
  userId: string;
  // The unique sparse index prevents duplicate checkout submissions.
  idempotencyKey?: string;
  customer: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
  items: OrderItemDoc[];
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  couponCode?: string;
  status: OrderStatus;
  pay: PayStatus;
  payment?: OrderPayment;
  cancellation?: OrderCancellation;
  walletRefund?: OrderRefund;
  stockReservations?: StockReservation[];
  couponReservationId?: string;
  note?: string;
  createdAt: Date;
};

const orderItemSchema = new Schema<OrderItemDoc>(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    img: { type: String, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true },
    price: { type: Number, required: true },
  },
  { _id: false },
);

const amount = { type: Number, required: true, min: 0, validate: Number.isSafeInteger };
const paymentSchema = new Schema<OrderPayment>(
  {
    id: { type: String, required: true },
    method: { type: String, enum: ["manual", "gateway"], required: true },
    amount,
    reference: { type: String, required: true },
    confirmedAt: { type: Date, required: true },
    confirmedBy: { type: String, required: true },
  },
  { _id: false },
);
const cancellationSchema = new Schema<OrderCancellation>(
  {
    createdAt: { type: Date, required: true },
    requestedBy: { type: String, required: true },
    reason: String,
    inventoryState: { type: String, enum: ["pending", "done", "review"], required: true },
  },
  { _id: false },
);
const refundSchema = new Schema<OrderRefund>(
  {
    amount,
    reference: { type: String, required: true },
    createdAt: { type: Date, required: true },
  },
  { _id: false },
);
const reservationSchema = new Schema<StockReservation>(
  {
    id: { type: Number, required: true },
    size: { type: String, required: true },
    qty: { type: Number, required: true, min: 1, validate: Number.isSafeInteger },
  },
  { _id: false },
);

const orderSchema = new Schema<OrderDoc>(
  {
    id: { type: String, required: true, unique: true },
    userId: { type: String, required: true },
    idempotencyKey: { type: String, unique: true, sparse: true },
    customer: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    postalCode: { type: String, required: true },
    items: { type: [orderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    shipping: { type: Number, required: true },
    total: { type: Number, required: true },
    couponCode: String,
    status: {
      type: String,
      required: true,
      enum: ["جدید", "در حال آماده‌سازی", "ارسال‌شده", "تحویل‌شده", "مرجوعی", "لغوشده"],
      default: "جدید",
    },
    pay: {
      type: String,
      required: true,
      enum: ["پرداخت‌شده", "در انتظار", "ناموفق", "بازگشت به کیف پول"],
      default: "در انتظار",
    },
    payment: { type: paymentSchema, default: undefined },
    cancellation: { type: cancellationSchema, default: undefined },
    walletRefund: { type: refundSchema, default: undefined },
    stockReservations: { type: [reservationSchema], default: undefined },
    couponReservationId: String,
    note: String,
  },
  { timestamps: true },
);

// Refund snapshots are immutable through application actions and indexed per owner.
orderSchema.index({ userId: 1, "walletRefund.createdAt": -1 });
orderSchema.index(
  { "payment.method": 1, "payment.reference": 1 },
  {
    name: "order_payment_reference_unique",
    unique: true,
    partialFilterExpression: { "payment.reference": { $type: "string" } },
  },
);

export const OrderModel: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) || model<OrderDoc>("Order", orderSchema);
