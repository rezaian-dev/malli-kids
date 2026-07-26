import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 💬 Canned replies — the support team's shared snippets, inserted into
// ticket + chat composers. Managed from `/admin/messages` (the \"پاسخ‌های
// آماده\" manager); when the collection is empty the UI falls back to a
// small built-in set so composers are never bare.
export type CannedResponseDoc = {
  title: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
};

const cannedResponseSchema = new Schema<CannedResponseDoc>(
  {
    title: { type: String, required: true },
    body: { type: String, required: true },
  },
  { timestamps: true },
);

export const CannedResponseModel: Model<CannedResponseDoc> =
  (models.CannedResponse as Model<CannedResponseDoc>) ||
  model<CannedResponseDoc>("CannedResponse", cannedResponseSchema);
