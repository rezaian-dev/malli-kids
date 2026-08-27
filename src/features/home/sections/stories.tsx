import { Journal } from "@/features/home/components/journal";
import { OrnStitch } from "@/features/home/components/ornaments";

export function Stories() {
  return (
    <section id="articles" className="bg-transparent py-12 sm:py-16 lg:py-20">
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-gold">JOURNAL</p>
            <h2 className="mt-2 text-[clamp(1.5rem,4vw,2.3rem)] font-black text-navy dark:text-ivory">
              مجله{" "}
              <span className="relative inline-block text-gold">
                ملی‌کیدز
                <OrnStitch className="absolute -bottom-2 right-0 w-14" />
              </span>
            </h2>
            <p className="mt-2 text-sm text-navy/50 dark:text-wheat">خواندنی‌های کوتاه برای خرید و استایل کوچولو</p>
          </div>
          <a href="/articles" className="text-sm font-black text-gold hover:underline">
            همه مقالات
          </a>
        </div>
        <Journal />
      </div>
    </section>
  );
}
