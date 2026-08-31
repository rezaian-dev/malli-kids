import { Handshake, Megaphone, Scissors, Store } from "lucide-react";
import { wash } from "@/components/home/section-wash";

const WAYS = [
  { Icon: Store, t: "عمده و نمایندگی" },
  { Icon: Scissors, t: "دوخت و تولید" },
  { Icon: Megaphone, t: "تولید محتوا" },
];

export function Collab() {
  return (
    <section className={`${wash.cream} py-12 sm:py-16`}>
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="from-navy-deep via-navy to-navy-mid shadow-navy/20 relative overflow-hidden rounded-3xl bg-linear-to-l p-6 shadow-xl sm:rounded-[28px] sm:p-10">
          <div className="bg-gold/15 pointer-events-none absolute -top-24 -left-24 h-64 w-64 rounded-full blur-3xl" />
          <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:justify-between sm:text-start">
            <div className="flex items-start gap-4 text-start sm:gap-5">
              <span className="border-gold/30 bg-gold/15 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border sm:h-16 sm:w-16">
                <Handshake className="text-gold-light h-7 w-7 sm:h-8 sm:w-8" />
              </span>
              <div className="min-w-0">
                <h2 className="text-lg font-black text-white sm:text-2xl">
                  با ملی‌کیدز بزرگ شوید
                </h2>
                <p className="text-cream/60 mt-2 max-w-xl text-xs leading-6 sm:text-sm sm:leading-7">
                  فروشندهٔ عمده، خیاط، بلاگر یا عکاسِ کودک هستید؟ تیمِ
                  همکاری‌های ما حداکثر تا ۲ روز کاری با شما تماس می‌گیرد.
                </p>
                <ul className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
                  {WAYS.map(({ Icon, t }) => (
                    <li
                      key={t}
                      className="text-cream/80 inline-flex items-center gap-1.5 rounded-full border border-white/12 bg-white/6 px-3 py-1.5 text-[11px] font-bold sm:text-xs"
                    >
                      <Icon className="text-gold-light h-3.5 w-3.5" />
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <a
              href="/collab"
              className="bg-gold text-navy-deep shadow-gold/25 hover:bg-gold-light inline-flex shrink-0 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-black shadow-lg transition-all duration-500 hover:-translate-y-1 sm:px-8"
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
