import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// Shared reply snippets for ticket/chat composers; falls back to a built-in set when empty.
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
