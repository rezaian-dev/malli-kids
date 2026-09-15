import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// Only visible: true reviews are shown; held for admin moderation until approved.
export type ReviewDoc = {
  product: string;
  author: string;
  rate: number;
  text: string;
  visible: boolean;
  createdAt: Date;
};

const reviewSchema = new Schema<ReviewDoc>(
  {
    product: { type: String, required: true },
    author: { type: String, required: true },
    rate: { type: Number, required: true, min: 1, max: 5 },
    text: { type: String, required: true },
    // Fail closed: every review waits for admin moderation unless explicitly shown.
    visible: { type: Boolean, default: false },
  },
  { timestamps: true },
);

// Serves getVisibleReviewsForProduct ({product, visible} + newest-first).
reviewSchema.index({ product: 1, visible: 1, createdAt: -1 });

export const ReviewModel: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ||
  model<ReviewDoc>("Review", reviewSchema);
