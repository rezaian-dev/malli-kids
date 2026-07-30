import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// ⭐ Real customer reviews (`visible: true` only are shown). Written by a
// signed-in buyer after a real purchase check (product page → `submitReviewAction`
// → `createReview`), held for admin moderation until approved from `/admin`.
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
    visible: { type: Boolean, default: true },
  },
  { timestamps: true },
);

export const ReviewModel: Model<ReviewDoc> =
  (models.Review as Model<ReviewDoc>) ||
  model<ReviewDoc>("Review", reviewSchema);
