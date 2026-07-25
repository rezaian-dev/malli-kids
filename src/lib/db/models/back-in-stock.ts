import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🔔 One row per "خبرم کن وقتی موجود شد" click — real, persisted intent to
// buy, unlike the old fake toast that promised a notification and never
// stored anything. `size` is the specific variant size the shopper wants
// ("" is the legacy/unsized-product sentinel — the whole product, not one
// size). Fulfilled and deleted in one step by `notifyBackInStock`
// (`@/lib/shop/back-in-stock`), called from every admin/order path that can
// increase stock — so a doc existing here always means "still waiting".
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

// 🔒 One pending request per (user, product, size) — resubmitting the same
// subscription is a harmless no-op, not a duplicate row.
backInStockSchema.index({ userId: 1, productId: 1, size: 1 }, { unique: true });

export const BackInStockModel: Model<BackInStockDoc> =
  (models.BackInStock as Model<BackInStockDoc>) ||
  model<BackInStockDoc>("BackInStock", backInStockSchema);
