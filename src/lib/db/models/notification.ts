import "server-only";
import { Schema, model, models, type Model } from "mongoose";

export type NotificationKind = "ticket" | "order" | "system" | "restock";

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
    kind: { type: String, required: true, enum: ["ticket", "order", "system", "restock"] },
    text: { type: String, required: true },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const NotificationModel: Model<NotificationDoc> =
  (models.Notification as Model<NotificationDoc>) ||
  model<NotificationDoc>("Notification", notificationSchema);
