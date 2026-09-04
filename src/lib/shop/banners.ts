import { unstable_cache } from "next/cache";
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

/** 🎉 Today's applicable occasion banner (pinned, or the one whose Jalali
 *  `from`/`to` range covers today) — real replacement for the client-only
 *  `readBannerFromAdminDb()` that used to poll the admin's own localStorage.
 *
 *  🧊 Cached: this runs on every single request (root layout reads it for
 *  the whole storefront). Two independent triggers keep it correct —
 *  `updateBannerAction` tags itself onto `FESTIVE_BANNER_TAG` and calls
 *  `revalidateTag` for admin edits, and the 1-hour `revalidate` window
 *  below covers `pickBanner`'s own date-range math (a banner's `from`/`to`
 *  window turning over at day boundaries, with nobody having edited
 *  anything). (Not `"use cache"`/Cache Components — this app doesn't opt
 *  into that model; `unstable_cache` is the tag-and-time-invalidated
 *  caching primitive that works under the classic/default rendering mode
 *  this app uses.) */
export const getActiveBanner = unstable_cache(
  async (): Promise<FestiveBanner | null> => {
    await connectMongoose();
    const docs = await FestiveBannerModel.find({ active: true }).lean();
    return pickBanner(docs.map(toFestiveBanner));
  },
  ["active-festive-banner"],
  { tags: [FESTIVE_BANNER_TAG], revalidate: 3600 },
);
