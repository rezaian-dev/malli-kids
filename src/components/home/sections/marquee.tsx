const ITEMS = [
  "ارسال رایگان از ۱٬۵۰۰٬۰۰۰ تومان",
  "پارچه OEKO-TEX",
  "پرو مجازی",
  "بازگشت ۷ روزه",
  "دوخت ایرانی",
  "کالکشن پاییز ۱۴۰۴",
];

export function Marquee() {
  const row = ITEMS.concat(ITEMS).map((t, i) => (
    <span key={i} className="whitespace-nowrap px-6 text-xs font-bold tracking-wide text-ivory/85 sm:text-sm">
      <span className="ms-1 me-2 text-gold">✦</span>
      {t}
    </span>
  ));
  return (
    <div className="relative overflow-hidden bg-navy py-2.5 sm:py-4" dir="ltr">
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center">{row}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}
