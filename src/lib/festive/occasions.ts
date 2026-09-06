import type { FestiveBanner } from "@/types";
import { toEnDigits } from "@/lib/locale/fa";
import { toJalali } from "@/lib/locale/jalali";

function inRange(
  jm: number,
  jd: number,
  fm: number,
  fd: number,
  tm: number,
  td: number,
) {
  const n = jm * 100 + jd;
  return n >= fm * 100 + fd && n <= tm * 100 + td;
}

export type BannerStatus = "draft" | "scheduled" | "live" | "expired";

// 🚦 "expired" means past this year's recurring window, not gone forever — it comes back next cycle.
export function bannerStatus(banner: FestiveBanner, d = new Date()): BannerStatus {
  if (!banner.active) return "draft";

  const { jm, jd } = toJalali(d);
  const num = (s: string) => Number(toEnDigits(s));
  const [fm, fd] = banner.from.split("/").map(num);
  const [tm, td] = banner.to.split("/").map(num);

  if (inRange(jm, jd, fm, fd, tm, td)) return "live";
  return jm * 100 + jd < fm * 100 + fd ? "scheduled" : "expired";
}

export function pickBanner(
  list: FestiveBanner[],
  d = new Date(),
): FestiveBanner | null {
  const pinned = list.find((b) => b.active && b.pinned);
  if (pinned) return pinned;
  const { jm, jd } = toJalali(d);
  const hit = list.find((b) => {
    if (!b.active) return false;

    const num = (s: string) => Number(toEnDigits(s));
    const [fm, fd] = b.from.split("/").map(num);
    const [tm, td] = b.to.split("/").map(num);
    return inRange(jm, jd, fm, fd, tm, td);
  });
  return hit || null;
}
