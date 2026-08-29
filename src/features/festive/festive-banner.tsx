import { pickBanner } from "@/features/festive/lib/occasions";
import { getBanners } from "@/lib/data";
import { FestiveBody } from "./campaign-banner-body";

/**
 * نوار مناسبتی — Server Component.
 *
 * انتخاب بنر فقط به تاریخِ رندر بستگی دارد، پس روی سرور انجام می‌شود؛
 * بدنه کلاینت است تا «جشنوارهٔ» فعالِ ادمین همین نوار را طلایی کند.
 */
export function FestiveBanner() {
  return <FestiveBody item={pickBanner(getBanners()) ?? null} />;
}
