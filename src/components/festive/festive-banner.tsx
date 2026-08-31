import { pickBanner } from "@/lib/festive/occasions";
import { getBanners } from "@/lib/data";
import { FestiveBannerBody } from "./festive-banner-body";

/**
 * نوار مناسبتی — Server Component.
 *
 * انتخاب بنر فقط به تاریخِ رندر بستگی دارد، پس روی سرور انجام می‌شود؛
 * بدنه کلاینت است تا «جشنوارهٔ» فعالِ ادمین همین نوار را طلایی کند.
 */
export function FestiveBanner() {
  return <FestiveBannerBody item={pickBanner(getBanners()) ?? null} />;
}
