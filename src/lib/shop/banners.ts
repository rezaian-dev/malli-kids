import { unstable_cache } from "next/cache";
import { errorMessage } from "@/lib/action-result";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import {
  FestiveBannerModel,
  type FestiveBannerDoc,
} from "@/lib/db/models/festive-banner";
import { pickBanner } from "@/lib/festive/occasions";
import type { FestiveBanner } from "@/types";

export const FESTIVE_BANNER_TAG = "festive-banner";

export function toFestiveBanner(
  doc: FestiveBannerDoc & { _id: { toString(): string } },
): FestiveBanner {
  return {
    id: doc._id.toString(),
    occasion: doc.occasion,
    title: doc.title,
    subtitle: doc.subtitle,
    cta: doc.cta,
    href: doc.href,
    coupon: doc.coupon,
    theme: doc.theme,
    from: doc.from,
    to: doc.to,
    active: doc.active,
    pinned: doc.pinned,
  };
}

// Cache by tag and time so edits and date changes refresh the banner.
export const getActiveBanner = unstable_cache(
  async (): Promise<FestiveBanner | null> => {
    try {
      await connectMongoose();
      const docs = await FestiveBannerModel.find({ active: true }).lean();
      return pickBanner(docs.map(toFestiveBanner));
    } catch (err) {
      console.warn("[banners] getActiveBanner failed — returning null:", errorMessage(err));
      return null;
    }
  },
  ["active-festive-banner"],
  { tags: [FESTIVE_BANNER_TAG], revalidate: REVALIDATE.merch },
);
