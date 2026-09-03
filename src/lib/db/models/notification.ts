import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🔔 Real, per-user notifications — created server-side by the actions that
// actually change a customer's ticket/order (see `src/lib/shop/notifications.ts`),
// never fabricated client-side. Replaces the old `localStorage`-only list,
// which could never reflect an event that happened in the admin's browser.
export type NotificationKind = "ticket" | "order" | "system";

export type NotificationDoc = {
  userId: string;
  kind: NotificationKind;
  text: string;
  read: boolean;
  createdAt: Date;
};

const notificationSchema = new Schema<NotificationDoc>(
  {
    userId: { type: String, required: true, index: true },
    kind: { type: String, required: true, enum: ["ticket", "order", "system"] },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ||
  model<NotificationDoc>("Notification", notificationSchema);
