import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import { COLLAB_KINDS } from "@/lib/constants";

// 🤝 Partnership/business leads submitted from the storefront collab form.
// Replaces `lib/collab.ts`'s localStorage list.
export type CollabStatus = "در انتظار بررسی" | "تماس گرفته شد";

export type CollabRequestDoc = {
  name: string;
  phone: string;
  kind: string;
  text: string;
  status: CollabStatus;
  createdAt: Date;
};

const collabRequestSchema = new Schema<CollabRequestDoc>(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    kind: { type: String, required: true, enum: COLLAB_KINDS },
    text: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["در انتظار بررسی", "تماس گرفته شد"],
      default: "در انتظار بررسی",
    },
  },
  { timestamps: true },
);

export const CollabRequestModel: Model<CollabRequestDoc> =
  (models.CollabRequest as Model<CollabRequestDoc>) ||
  model<CollabRequestDoc>("CollabRequest", collabRequestSchema);
