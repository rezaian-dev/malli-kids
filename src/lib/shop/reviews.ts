import { connectMongoose } from "@/lib/db/mongoose";
import { ReviewModel, type ReviewDoc } from "@/lib/db/models/review";
import { OrderModel } from "@/lib/db/models/order";
import { faDate } from "@/lib/locale/fa";
import type { AdminReview } from "@/types";

function toAdminReview(doc: ReviewDoc & { _id: { toString(): string }; createdAt: Date }): AdminReview {
  return {
    id: doc._id.toString(),
    product: doc.product,
    author: doc.author,
    rate: doc.rate,
    text: doc.text,
    visible: doc.visible,
    date: faDate(doc.createdAt),
  };
}

// ✅ Backs both the PDP's "write a review" gate and the review-submit action.
export async function hasPurchased(userId: string, productId: number): Promise<boolean> {
  await connectMongoose();
  const purchased = await OrderModel.exists({
    userId,
    "items.id": productId,
  });
  return Boolean(purchased);
}

// ⭐ Held for admin moderation (visible: false) until approved.
export async function createReview(input: {
  productName: string;
  author: string;
  rate: number;
  text: string;
}): Promise<void> {
  await connectMongoose();
  await ReviewModel.create({
    product: input.productName,
    author: input.author,
    rate: input.rate,
    text: input.text,
    visible: false,
  });
}

export async function getVisibleReviewsForProduct(productName: string): Promise<AdminReview[]> {
  await connectMongoose();
  const docs = await ReviewModel.find({ product: productName, visible: true })
    .sort({ createdAt: -1 })
    .lean();
  return docs.map(toAdminReview);
}

// 🏅 Recent, well-rated reviews across every product, for the homepage testimonials.
export async function getFeaturedReviews(limit = 5): Promise<AdminReview[]> {
  await connectMongoose();
  const docs = await ReviewModel.find({ visible: true, rate: { $gte: 4 } })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();
  return docs.map(toAdminReview);
}

export type ReviewStats = { avg: number; count: number };

// 📊 Site-wide average rating and count, for the homepage's aggregate stat block.
export async function getReviewStats(): Promise<ReviewStats> {
  await connectMongoose();
  const [agg] = await ReviewModel.aggregate<{ avg: number; count: number }>([
    { $match: { visible: true } },
    { $group: { _id: null, avg: { $avg: "$rate" }, count: { $sum: 1 } } },
  ]);
  return { avg: agg ? Math.round(agg.avg * 10) / 10 : 0, count: agg?.count ?? 0 };
}
