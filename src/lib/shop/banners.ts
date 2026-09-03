import { connectMongoose } from "@/lib/db/mongoose";
import {
  FestiveBannerModel,
  type FestiveBannerDoc,
} from "@/lib/db/models/festive-banner";
import { pickBanner } from "@/lib/festive/occasions";
import type { FestiveBanner } from "@/types";

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

/** 🎉 Today's applicable occasion banner (pinned, or the one whose Jalali
 *  `from`/`to` range covers today) — real replacement for the client-only
 *  `readBannerFromAdminDb()` that used to poll the admin's own localStorage. */
export async function getActiveBanner(): Promise<FestiveBanner | null> {
  await connectMongoose();
  const docs = await FestiveBannerModel.find({ active: true }).lean();
  return pickBanner(docs.map(toFestiveBanner));
}
