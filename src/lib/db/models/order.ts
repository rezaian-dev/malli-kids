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
      enum: ["جدید", "در حال آماده‌سازی", "ارسال‌شده", "تحویل‌شده", "مرجوعی"],
      default: "جدید",
    },
    pay: {
      type: String,
      required: true,
      enum: ["پرداخت‌شده", "در انتظار", "ناموفق"],
      default: "پرداخت‌شده",
    },
    note: String,
  },
  { timestamps: true },
);

export const OrderModel: Model<OrderDoc> =
  (models.Order as Model<OrderDoc>) || model<OrderDoc>("Order", orderSchema);
