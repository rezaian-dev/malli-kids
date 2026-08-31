import { pickBanner } from "@/lib/festive/occasions";
import { getBanners } from "@/lib/data";
import { FestiveBannerMount } from "./festive-banner-mount";

export function FestiveBanner() {
  return <FestiveBannerMount item={pickBanner(getBanners()) ?? null} />;
}
