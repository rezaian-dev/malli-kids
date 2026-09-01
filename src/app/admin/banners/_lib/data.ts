import { connectMongoose } from "@/lib/db/mongoose";
import { FestiveBannerModel } from "@/lib/db/models/festive-banner";
import { toFestiveBanner } from "@/lib/shop/banners";
import type { FestiveBanner } from "@/types";

export async function getAllBanners(): Promise<FestiveBanner[]> {
  await connectMongoose();
  const docs = await FestiveBannerModel.find().sort({ occasion: 1 }).lean();
  return docs.map(toFestiveBanner);
}
