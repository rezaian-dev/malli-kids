import { BadgeCheck, Star } from "lucide-react";
import { HomeQuotes } from "../home-quotes";
import { OrnLeaf } from "../home-ornaments";
import { wash } from "@/components/shared/section-wash";
import { cn } from "@/lib/utils";

export function Reviews() {
  return (
    <section
      id="testimonials"
      className={`${wash.navy} cv-auto py-12 sm:py-16 lg:py-20`}
    >
      <div
        className={cn(
          "pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full blur-3xl dark:hidden",
          "bg-gold/15",
        )}
      />
      <div
        className={cn(
          "pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full blur-3xl dark:hidden",
          "bg-navy/10",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute bottom-8 left-8 hidden -rotate-6 select-none xl:block",
          "font-display text-[110px] leading-none text-transparent [-webkit-text-stroke:1.5px_rgba(193,147,87,.55)]",
        )}
      >
        loved
      </span>
      <div className="relative container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-10 flex flex-col justify-between gap-6 transition-all duration-700 ease-out sm:mb-12 lg:flex-row lg:items-end">
          <div>
            <span className="text-gold flex items-center gap-2 text-sm font-bold tracking-wide">
              <BadgeCheck className="h-4 w-4" />
              خریدهای تأییدشده
            </span>
            <h2
              className={cn(
                "mt-2",
                "text-navy text-[clamp(1.5rem,5.5vw,2.625rem)] leading-snug font-black",
                "dark:text-ivory",
              )}
            >
              نظر{" "}
              <span className="text-gold relative inline-block">
                خریداران
                <OrnLeaf className="absolute -bottom-3 left-0 h-5 w-9" />
              </span>
            </h2>
            <p className="text-navy/70 dark:text-wheat mt-3 max-w-lg text-sm leading-7 sm:text-[15px]">
              فقط کسانی که سفارش‌شان تحویل شده می‌توانند در صفحهٔ همان محصول نظر
              بگذارند. این‌ها گزیده‌ای از همان نظرهاست.
            </p>
          </div>
          <div
            className={cn(
              "flex shrink-0 items-center gap-4 rounded-3xl border px-5 py-4",
              "border-navy/5 bg-white/92 shadow-[0_16px_36px_-22px_rgba(14,42,71,.3)]",
              "dark:border-gold/30 dark:bg-slate/55",
            )}
          >
            <div>
              <p className="text-navy dark:text-ivory text-4xl leading-none font-black">
                ۴٫۹
              </p>
              <div className="mt-2 flex gap-0.5" aria-hidden>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="fill-gold text-gold h-3.5 w-3.5" />
                ))}
              </div>
            </div>
            <div className="border-navy/10 border-s ps-4">
              <p className="text-navy dark:text-ivory text-sm font-black">
                +۱۲٬۰۰۰ نظر
              </p>
              <p className="text-navy/70 dark:text-wheat mt-1 text-[11px]">
                میانگین امتیاز واقعی خرید
              </p>
            </div>
          </div>
        </div>
        <HomeQuotes />
      </div>
    </section>
  );
}
