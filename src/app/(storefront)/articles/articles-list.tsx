"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { loadPublishedArticles, type JournalArticle } from "@/lib/articles";

/**
 * فهرست مقاله‌ها.
 *
 * چرا client؟ «دیتابیس» مقاله‌ها localStorage است و ادمین می‌تواند مقاله اضافه/حذف کند.
 * ولی برخلافِ قبل، با دانهٔ سرور (`initial`) شروع می‌شود؛ یعنی HTML اولیه پُر است
 * (بدون صفحهٔ خالی و بدون پرشِ چیدمان) و بعد از mount فقط اگر ادمین چیزی ذخیره
 * کرده باشد جایگزین می‌شود.
 */
export function ArticlesList({ initial }: { initial: JournalArticle[] }) {
  const [articles, setArticles] = useState<JournalArticle[]>(initial);

  useEffect(() => {
    const live = loadPublishedArticles();
    setArticles((prev) => (JSON.stringify(prev) === JSON.stringify(live) ? prev : live));
  }, []);

  if (articles.length === 0) {
    return (
      <p className="rounded-3xl border border-dashed border-navy/15 bg-sand px-5 py-4 text-sm text-navy/55 dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat">
        هنوز مقاله‌ای منتشر نشده است.
      </p>
    );
  }

  return (
    <>
      {articles.map((a) => (
        <Link key={a.slug} href={`/articles/${a.slug}`} className="flex gap-4 rounded-3xl bg-white dark:bg-dusk border border-navy/10 dark:border-gold/30 p-4 transition hover:border-gold/50 sm:p-6">
          {a.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={a.cover} alt="" className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-40" />
          ) : (
            <span className="grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sand to-gold/25 text-gold-deep dark:from-navy-mid dark:to-gold/15 sm:h-32 sm:w-40">
              <Newspaper className="size-7" />
            </span>
          )}
          <div className="min-w-0">
            <Badge variant="secondary">{a.tag}</Badge>
            <h2 className="font-black text-lg mt-3 text-navy dark:text-ivory">{a.title}</h2>
            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{a.excerpt}</p>
            {a.date ? <p className="mt-2 text-[11px] font-bold text-navy/40 dark:text-wheat">{a.date}</p> : null}
          </div>
        </Link>
      ))}
    </>
  );
}
