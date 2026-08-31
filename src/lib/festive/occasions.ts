import type { FestiveBanner } from "@/types";

export function toJalali(d = new Date()) {
  const gy = d.getFullYear();
  const gm = d.getMonth() + 1;
  const gd = d.getDate();
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  const gy2 = gm > 2 ? gy + 1 : gy;
  let days =
    355666 +
    365 * gy +
    Math.floor((gy2 + 3) / 4) -
    Math.floor((gy2 + 99) / 100) +
    Math.floor((gy2 + 399) / 400) +
    gd +
    g_d_m[gm - 1];
  let jy = -1595 + 33 * Math.floor(days / 12053);
  days %= 12053;
  jy += 4 * Math.floor(days / 1461);
  days %= 1461;
  if (days > 365) {
    jy += Math.floor((days - 1) / 365);
    days = (days - 1) % 365;
  }
  const jm =
    days < 186 ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30);
  const jd = 1 + (days < 186 ? days % 31 : (days - 186) % 30);
  return {
    jy,
    jm,
    jd,
    key: `${jy}/${String(jm).padStart(2, "0")}/${String(jd).padStart(2, "0")}`,
  };
}

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

export function seedBanners(): FestiveBanner[] {
  return [
    {
      id: "nowruz",
      occasion: "نوروز",
      title: "سال نو مبارک؛ کالکشن بهار ملی‌کیدز",
      subtitle: "۲۰٪ روی پیراهن جشن و سیسمونی تا ۱۳ فروردین",
      cta: "کالکشن نوروز",
      href: "/shop?cat=دخترانه",
      coupon: "NOWRUZ20",
      theme: "gold",
      from: "۱/۱",
      to: "۱/۱۳",
      active: true,
      pinned: false,
    },
    {
      id: "sizdah",
      occasion: "سیزده‌به‌در",
      title: "لباس بازی در طبیعت",
      subtitle: "ست آزاد و نخی برای پیک‌نیک سیزده",
      cta: "ست‌های نخی",
      href: "/shop",
      theme: "navy",
      from: "۱/۱۲",
      to: "۱/۱۳",
      active: true,
      pinned: false,
    },
    {
      id: "spring",
      occasion: "جشنواره بهارانه",
      title: "حراج لطیف بهار",
      subtitle: "ارسال رایگان روی خرید بالای ۱٫۵ میلیون",
      cta: "خرید بهاره",
      href: "/shop",
      theme: "gold",
      from: "۱/۱۴",
      to: "۲/۲۰",
      active: true,
      pinned: false,
    },
    {
      id: "summer",
      occasion: "جشنواره تابستانه",
      title: "خنک، سبک، مخصوص گرما",
      subtitle: "لینن و پنبه ارگانیک با ۱۵٪ تخفیف",
      cta: "تابستانه",
      href: "/shop",
      coupon: "SUMMER15",
      theme: "navy",
      from: "۳/۱",
      to: "۴/۳۱",
      active: true,
      pinned: false,
    },
    {
      id: "ghadir",
      occasion: "عید غدیر",
      title: "هدیهٔ شیک برای کوچولو",
      subtitle: "بسته‌بندی کادویی رایگان در غدیر",
      cta: "هدیه‌ها",
      href: "/shop?cat=سیسمونی",
      theme: "gold",
      from: "۴/۲۵",
      to: "۴/۳۱",
      active: true,
      pinned: false,
    },
    {
      id: "childweek",
      occasion: "هفته کودک",
      title: "هفته کودک؛ لباس بازی و رؤیا",
      subtitle: "۱۰٪ ویژه با کد MALLI10",
      cta: "کالکشن کودک",
      href: "/shop",
      coupon: "MALLI10",
      theme: "gold",
      from: "۵/۱۴",
      to: "۵/۲۲",
      active: true,
      pinned: false,
    },
    {
      id: "shahrivar",
      occasion: "آماده‌باش مهر",
      title: "مهر نزدیک است؛ ست مدرسه و مشاغل",
      subtitle: "لباس مشاغل و پیراهن کلاسیک با ارسال سریع",
      cta: "ست مهر",
      href: "/shop?cat=لباس مشاغل",
      coupon: "MEHR10",
      theme: "navy",
      from: "۶/۱",
      to: "۶/۳۱",
      active: true,
      pinned: false,
    },
    {
      id: "mehr",
      occasion: "بازگشایی مدارس",
      title: "اول مهر، استایل مرتب",
      subtitle: "پیراهن، پیش‌بند و کیف هماهنگ",
      cta: "خرید مهر",
      href: "/shop?cat=پسرانه",
      theme: "gold",
      from: "۷/۱",
      to: "۷/۱۵",
      active: true,
      pinned: false,
    },
    {
      id: "fall",
      occasion: "جشنواره پاییزه",
      title: "پالتو و بافت؛ گرمای شیک",
      subtitle: "تا ۲۰٪ روی پالتو و ژاکت مرینوس",
      cta: "پاییزه",
      href: "/shop",
      coupon: "FALL15",
      theme: "night",
      from: "۷/۱۶",
      to: "۸/۳۰",
      active: true,
      pinned: false,
    },
    {
      id: "yalda",
      occasion: "شب یلدا",
      title: "یلدا؛ قرمز و طلایی برای جشن خانواده",
      subtitle: "پیراهن مجلسی و ست شب‌چله",
      cta: "کالکشن یلدا",
      href: "/shop?cat=دخترانه",
      coupon: "YALDA20",
      theme: "night",
      from: "۱۰/۲۰",
      to: "۱۰/۳۰",
      active: true,
      pinned: false,
    },
    {
      id: "fajr",
      occasion: "دهه فجر",
      title: "دهه فجر؛ حراج ملی‌کیدز",
      subtitle: "تخفیف منتخب روی دستدوز ایرانی",
      cta: "دستدوزها",
      href: "/shop?cat=دستدوز",
      theme: "navy",
      from: "۱۱/۱۲",
      to: "۱۱/۲۲",
      active: true,
      pinned: false,
    },
    {
      id: "esfand",
      occasion: "حراج پایان سال",
      title: "آخرین فرصت سال؛ انبارگردانی",
      subtitle: "قیمت ویژه تا قبل از نوروز",
      cta: "حراج اسفند",
      href: "/shop",
      coupon: "ESFAND25",
      theme: "gold",
      from: "۱۲/۱",
      to: "۱۲/۱۹",
      active: true,
      pinned: false,
    },
    {
      id: "pre-nowruz",
      occasion: "پیشواز نوروز",
      title: "جامهٔ عید را از همین حالا بدوزید",
      subtitle: "سفارش عید با ارسال به‌موقع",
      cta: "لباس عید",
      href: "/shop",
      theme: "gold",
      from: "۱۲/۲۰",
      to: "۱۲/۲۹",
      active: true,
      pinned: false,
    },
    {
      id: "mother",
      occasion: "روز مادر",
      title: "هدیهٔ مادر و فرزند",
      subtitle: "ست ستاره‌ای برای عکس دسته‌جمعی",
      cta: "هدیه مادر",
      href: "/shop",
      theme: "gold",
      from: "۲/۱",
      to: "۲/۶",
      active: true,
      pinned: false,
    },
  ];
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

    const num = (s: string) =>
      Number(s.replace(/[۰-۹]/g, (d) => String("۰۱۲۳۴۵۶۷۸۹".indexOf(d))));
    const [fm, fd] = b.from.split("/").map(num);
    const [tm, td] = b.to.split("/").map(num);
    return inRange(jm, jd, fm, fd, tm, td);
  });
  return hit || null;
}
