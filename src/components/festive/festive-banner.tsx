import { pickBanner } from "@/lib/festive/occasions";
import { getBanners } from "@/lib/data";
import { FestiveBannerBody } from "./festive-banner-body";

export function FestiveBanner() {
  return <FestiveBannerBody item={pickBanner(getBanners()) ?? null} />;
}
