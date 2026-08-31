import { Handshake, Megaphone, Scissors, Store } from "lucide-react";

const WAYS = [
  { Icon: Store, t: "عمده و نمایندگی" },
  { Icon: Scissors, t: "دوخت و تولید" },
  { Icon: Megaphone, t: "تولید محتوا" },
];

export function Collab() {
  return (
    <section className="bg-transparent py-12 sm:py-16">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="relative overflow-hidden rounded-3xl bg-linear-to-l from-navy-deep via-navy to-navy-mid p-6 shadow-xl shadow-navy/20 sm:rounded-[28px] sm:p-10">
          <div className="pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full bg-gold/15 blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-start">
            <div className="flex items-start gap-4 text-start sm:gap-5">
              <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-gold/30 bg-gold/15 sm:h-16 sm:w-16">
                <Handshake className="h-7 w-7 text-gold-light sm:h-8 sm:w-8" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-white sm:text-2xl">با ملی‌کیدز بزرگ شوید</h2>
                <p className="mt-2 max-w-xl text-xs leading-6 text-cream/60 sm:text-sm sm:leading-7">
                  فروشندهٔ عمده، خیاط، بلاگر یا عکاسِ کودک هستید؟ تیمِ همکاری‌های ما حداکثر تا ۲ روز کاری با شما تماس می‌گیرد.
                </p>
                <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {WAYS.map(({ Icon, t }) => (
                    <li key={t} className="inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-bold text-cream/80 sm:text-xs">
                      <Icon className="h-3.5 w-3.5 text-gold-light" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <a
              href="/collab"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-gold px-7 py-3.5 text-sm font-black text-navy-deep shadow-lg shadow-gold/25 transition-all duration-500 hover:-translate-y-1 hover:bg-gold-light sm:px-8"
            >
              <Handshake className="h-4 w-4" />
              ثبتِ درخواستِ همکاری
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
