import { BadgeCheck, Star } from "lucide-react";
import { HomeQuotes } from "@/components/home/home-quotes";
import { OrnLeaf } from "@/components/home/home-ornaments";

export function Reviews() {
  return (
    <section id="testimonials" className="relative overflow-hidden bg-sand py-12 dark:bg-transparent sm:py-16 lg:py-20">
      <div className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-gold/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-navy/10 blur-3xl" />
      <span className="font-display pointer-events-none absolute bottom-8 left-8 hidden select-none text-[110px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(193,147,87,.55)] -rotate-6 xl:block">
        loved
      </span>
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 relative">
        <div className="mb-10 flex flex-col justify-between gap-6 transition-all duration-700 ease-out sm:mb-12 lg:flex-row lg:items-end">
          <div>
            <span className="flex items-center gap-2 text-sm font-bold tracking-wide text-gold">
              <BadgeCheck className="h-4 w-4" />
              خریدهای تأییدشده
            </span>
            <h2 className="mt-2 text-[clamp(1.5rem,5.5vw,2.625rem)] font-black leading-snug text-navy dark:text-ivory">
              نظر{" "}
              <span className="relative inline-block text-gold">
                خریداران
                <OrnLeaf className="absolute -bottom-3 left-0 h-5 w-9" />
              </span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-7 text-navy/55 dark:text-wheat sm:text-[15px]">
              فقط کسانی که سفارش‌شان تحویل شده می‌توانند در صفحهٔ همان محصول نظر بگذارند. این‌ها گزیده‌ای از همان نظرهاست.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-4 rounded-3xl border border-navy/5 bg-white/92 px-5 py-4 shadow-[0_16px_36px_-22px_rgba(14,42,71,.3)] dark:border-gold/30 dark:bg-slate/55">
            <div>
              <p className="text-4xl font-black leading-none text-navy dark:text-ivory">۴٫۹</p>
              <div className="mt-2 flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-gold text-gold" />
                ))}
              </div>
            </div>
            <div className="border-s border-navy/10 ps-4">
              <p className="text-sm font-black text-navy dark:text-ivory">+۱۲٬۰۰۰ نظر</p>
              <p className="mt-1 text-[11px] text-navy/45 dark:text-wheat">میانگین امتیاز واقعی خرید</p>
            </div>
          </div>
        </div>
        <HomeQuotes />
      </div>
    </section>
  );
}
