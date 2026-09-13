import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// An empty size means the whole product; remove subscriptions after notifying.
export type BackInStockDoc = {
  userId: string;
  productId: number;
  size: string;
  createdAt: Date;
};

const backInStockSchema = new Schema<BackInStockDoc>(
  {
    userId: { type: String, required: true },
    productId: { type: Number, required: true },
    size: { type: String, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

// One pending request per (user, product, size) — resubmitting is a no-op.
backInStockSchema.index({ userId: 1, productId: 1, size: 1 }, { unique: true });

export const BackInStockModel: Model<BackInStockDoc> =
  (models.BackInStock as Model<BackInStockDoc>) ||
  model<BackInStockDoc>("BackInStock", backInStockSchema);
