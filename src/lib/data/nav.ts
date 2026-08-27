export const NAV_MAIN = [
  { href: "/shop", label: "دسته‌بندی", icon: "layout-grid" },
  { href: "/tryon", label: "پرو مجازی", icon: "scan-face" },
  { href: "/faq", label: "سوالات متداول", icon: "help-circle" },
  { href: "/about", label: "درباره ما", icon: "info" },
  { href: "/contact", label: "تماس با ما", icon: "phone" },
] as const;

export const CAT_LINKS = [
  { href: "/shop?cat=دخترانه", label: "دخترانه", hint: "+۱۴۰ مدل فعال", icon: "crown" },
  { href: "/shop?cat=پسرانه", label: "پسرانه", hint: "+۱۲۰ مدل فعال", icon: "shirt" },
  { href: "/shop?cat=سیسمونی", label: "سیسمونی", hint: "۰ تا ۲۴ ماه", icon: "baby" },
  { href: "/shop?cat=لباس مشاغل", label: "لباس مشاغل", hint: "رویاهای بزرگ", icon: "briefcase" },
  { href: "/shop?cat=اکسسوری", label: "اکسسوری", hint: "تکمیلِ استایل", icon: "gem" },
  { href: "/shop?cat=دستدوز", label: "دستدوز خاص", hint: "تک‌نسخه‌ای", icon: "hand-heart" },
] as const;
