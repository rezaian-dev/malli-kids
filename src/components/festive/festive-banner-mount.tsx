"use client";

import type { FestiveBanner as BannerItem } from "@/types";
import { FestiveBannerBody } from "./festive-banner-body";

// 🎉 Keep the banner stable instead of swapping through a fallback. ✨
export function FestiveBannerMount({ item }: { item: BannerItem | null }) {
  return <FestiveBannerBody item={item} />;
}
