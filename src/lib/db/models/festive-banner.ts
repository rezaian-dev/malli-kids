import "server-only";
import { Schema, model, models, type Model } from "mongoose";
import type { FestiveTheme } from "@/types";

// 🎉 Occasion banners — `from`/`to` are recurring Jalali "M/D" (no year, see
// `pickBanner()`/`toJalali()` in `@/lib/festive/occasions`), so they stay
// plain strings; a real `Date` can't express "every year around this day".
export type FestiveBannerDoc = {
  occasion: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  coupon?: string;
  theme: FestiveTheme;
  from: string;
  to: string;
  active: boolean;
  pinned: boolean;
};

const festiveBannerSchema = new Schema<FestiveBannerDoc>(
  {
    occasion: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    cta: { type: String, required: true },
    href: { type: String, required: true },
    coupon: String,
    theme: {
      type: String,
      required: true,
      enum: ["navy", "gold", "night"],
      default: "gold",
    },
    from: { type: String, required: true },
    to: { type: String, required: true },
    active: { type: Boolean, default: true },
    pinned: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const FestiveBannerModel: Model<FestiveBannerDoc> =
  (models.FestiveBanner as Model<FestiveBannerDoc>) ||
  model<FestiveBannerDoc>("FestiveBanner", festiveBannerSchema);
