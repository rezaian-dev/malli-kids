import { connectMongoose } from "@/lib/db/mongoose";
import { ReviewModel } from "@/lib/db/models/review";
import { faDate } from "@/lib/locale/fa";
import type { AdminReview } from "@/types";

export async function getAllReviews(): Promise<AdminReview[]> {
  await connectMongoose();
  const docs = await ReviewModel.find().sort({ createdAt: -1 }).lean();

  return docs.map((doc) => ({
    id: doc._id.toString(),
    product: doc.product,
    author: doc.author,
    rate: doc.rate,
    text: doc.text,
    visible: doc.visible,
    date: faDate(doc.createdAt),
  }));
}
