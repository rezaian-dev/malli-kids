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
    <span
      key={i}
      className="text-ivory/85 px-6 text-xs font-bold tracking-wide whitespace-nowrap sm:text-sm"
    >
      <span className="text-gold ms-1 me-2">✦</span>
      {t}
    </span>
  ));
  return (
    <div className="bg-navy relative overflow-hidden py-2.5 sm:py-4" dir="ltr">
      <div className="animate-marquee flex w-max hover:[animation-play-state:paused]">
        <div className="flex shrink-0 items-center">{row}</div>
        <div className="flex shrink-0 items-center" aria-hidden>
          {row}
        </div>
      </div>
    </div>
  );
}
