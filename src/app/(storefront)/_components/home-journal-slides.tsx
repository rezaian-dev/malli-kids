import Link from "next/link";
import { Newspaper } from "lucide-react";
import { cn } from "@/lib/utils";
import { loadPublishedArticles } from "@/lib/articles";

// 📰 Real, published articles — the latest few, same source
// `articles/page.tsx` reads. No more static duplicate cards.
export async function HomeJournalSlides() {
  const articles = (await loadPublishedArticles()).slice(0, 5);
  if (articles.length === 0) return null;

  return (
    <>
      {articles.map((a) => (
        <div
          className="box-border min-w-0 shrink-0 basis-[86%] pe-5 sm:basis-1/2 lg:basis-1/3"
          key={a.slug}
        >
          <Link
            href={`/articles/${a.slug}`}
            prefetch={false}
            className={cn(
              "group block h-full overflow-hidden rounded-3xl border no-underline transition-all duration-500 hover:-translate-y-1",
              "border-navy/10 hover:border-gold/45 bg-white/92 shadow-[0_14px_32px_-22px_rgba(14,42,71,.25)] hover:shadow-[0_20px_40px_-20px_rgba(193,147,87,.28)]",
              "dark:border-gold/30 dark:bg-slate/55",
            )}
          >
            <div className="bg-sand aspect-16/10 overflow-hidden">
              {a.cover ? (
                /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin article covers can be raw data URLs. */
                <img
                  src={a.cover}
                  alt=""
                  className="size-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <span
                  className={cn(
                    "grid size-full place-items-center bg-linear-to-br",
                    "from-sand to-gold/25 text-gold-deep",
                    "dark:from-navy-mid dark:to-gold/15",
                  )}
                >
                  <Newspaper className="size-8" />
                </span>
              )}
            </div>
            <div className="p-5">
              <span className="text-gold text-[10px] font-black tracking-widest">
                {a.tag}
              </span>
              <h3 className="text-navy dark:text-linen mt-1.5 mb-0 text-[0.98rem] leading-snug font-black">
                {a.title}
              </h3>
              <p className="text-navy/70 dark:text-khaki mt-1.5 mb-0 text-xs leading-7">
                {a.excerpt}
              </p>
            </div>
          </Link>
        </div>
      ))}
    </>
  );
}
