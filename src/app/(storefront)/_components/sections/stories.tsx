import Link from "next/link";
import { Newspaper } from "lucide-react";
import { HomeJournalMount } from "../home-journal-mount";
import { HomeJournalSlides } from "../home-journal-slides";
import { OrnStitch } from "../home-ornaments";
import { wash } from "@/components/shared/section-wash";
import { EmptyState } from "@/components/shared/empty-state";
import { loadPublishedArticles } from "@/lib/articles";
import { cn } from "@/lib/utils";

export async function Stories() {
  // 🧊 Same cached read HomeJournalSlides makes — this just decides which
  // shell (carousel vs. "no articles yet") wraps it, no extra DB round-trip.
  const hasArticles = (await loadPublishedArticles()).length > 0;

  return (
    <section
      id="articles"
      className={cn(wash.silk, "cv-auto py-12 sm:py-16 lg:py-20")}
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
        {hasArticles ? (
          <HomeJournalMount>
            <HomeJournalSlides />
          </HomeJournalMount>
        ) : (
          <EmptyState
            icon={<Newspaper className="size-6" />}
            title="اولین مقاله مجله به‌زودی منتشر می‌شود"
            description="راهنمای سایز، نگهداری پارچه و ایده‌های استایل کودک — به‌زودی همین‌جا."
          />
        )}
      </div>
    </section>
  );
}
