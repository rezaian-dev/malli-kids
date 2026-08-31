export const NAV_MAIN = [
  { href: "/shop", label: "دسته‌بندی", icon: "layout-grid" },
  { href: "/tryon", label: "پرو مجازی", icon: "scan-face" },
  { href: "/faq", label: "سوالات متداول", icon: "help-circle" },
  { href: "/about", label: "درباره ما", icon: "info" },
  { href: "/contact", label: "تماس با ما", icon: "phone" },
] as const;

export const CAT_LINKS = [
  {
    href: "/shop?cat=دخترانه",
    label: "دخترانه",
    hint: "+۱۴۰ مدل فعال",
    icon: "crown",
    swatch:
      "bg-pink-100 text-pink-600 dark:bg-pink-400/12 dark:text-pink-300 dark:ring-1 dark:ring-pink-400/40 dark:shadow-[0_0_18px_-6px_rgba(244,114,182,.55)]",
  },
  {
    href: "/shop?cat=پسرانه",
    label: "پسرانه",
    hint: "+۱۲۰ مدل فعال",
    icon: "shirt",
    swatch:
      "bg-sky-100 text-sky-600 dark:bg-sky-400/12 dark:text-sky-300 dark:ring-1 dark:ring-sky-400/40 dark:shadow-[0_0_18px_-6px_rgba(56,189,248,.5)]",
  },
  {
    href: "/shop?cat=سیسمونی",
    label: "سیسمونی",
    hint: "۰ تا ۲۴ ماه",
    icon: "baby",
    swatch:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-400/12 dark:text-emerald-300 dark:ring-1 dark:ring-emerald-400/40 dark:shadow-[0_0_18px_-6px_rgba(52,211,153,.5)]",
  },
  {
    href: "/shop?cat=لباس مشاغل",
    label: "لباس مشاغل",
    hint: "رویاهای بزرگ",
    icon: "briefcase",
    swatch:
      "bg-orange-100 text-orange-600 dark:bg-orange-400/12 dark:text-orange-300 dark:ring-1 dark:ring-orange-400/40 dark:shadow-[0_0_18px_-6px_rgba(251,146,60,.5)]",
  },
  {
    href: "/shop?cat=اکسسوری",
    label: "اکسسوری",
    hint: "تکمیلِ استایل",
    icon: "gem",
    swatch:
      "bg-violet-100 text-violet-600 dark:bg-violet-400/12 dark:text-violet-300 dark:ring-1 dark:ring-violet-400/40 dark:shadow-[0_0_18px_-6px_rgba(167,139,250,.5)]",
  },
  {
    href: "/shop?cat=دستدوز",
    label: "دستدوز خاص",
    hint: "تک‌نسخه‌ای",
    icon: "hand-heart",
    swatch:
      "bg-amber-100 text-amber-800 dark:bg-gold/15 dark:text-gold-light dark:ring-1 dark:ring-gold/45 dark:shadow-[0_0_18px_-6px_rgba(193,147,87,.55)]",
  },
] as const;
