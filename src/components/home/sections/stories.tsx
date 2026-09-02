import Link from "next/link";
import { HomeJournal } from "@/components/home/home-journal";
import { HomeJournalSlides } from "@/components/home/home-journal-slides";
import { OrnStitch } from "@/components/home/home-ornaments";
import { wash } from "@/components/home/section-wash";

export function Stories() {
  return (
    <section
      id="articles"
      className={`${wash.silk} cv-auto py-12 sm:py-16 lg:py-20`}
    >
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-gold text-xs font-bold tracking-[0.2em]">
              JOURNAL
            </p>
            <h2 className="text-navy dark:text-ivory mt-2 text-[clamp(1.5rem,4vw,2.3rem)] font-black">
              مجله{" "}
              <span className="text-gold relative inline-block">
                ملی‌کیدز
                <OrnStitch className="absolute right-0 -bottom-2 w-14" />
              </span>
            </h2>
            <p className="text-navy/70 dark:text-wheat mt-2 text-sm">
              خواندنی‌های کوتاه برای خرید و استایل کوچولو
            </p>
          </div>
          <Link
            href="/articles"
            className="text-gold text-sm font-black hover:underline"
          >
            همه مقالات
          </Link>
        </div>
        <HomeJournal>
          <HomeJournalSlides />
        </HomeJournal>
      </div>
    </section>
  );
}
