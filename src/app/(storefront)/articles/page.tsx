"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { Badge } from "@/components/ui/badge";
import { loadPublishedArticles, type JournalArticle } from "@/lib/articles";

export default function ArticlesPage() {
  // رندرِ اولیه با دانهٔ سرور یکسان است؛ مقاله‌های ذخیره‌شدهٔ ادمین بعد از mount جایگزین می‌شوند
  const [articles, setArticles] = useState<JournalArticle[]>([]);
  useEffect(() => setArticles(loadPublishedArticles()), []);

  return (
    <>
      <Intro crumb="مجله" kicker="JOURNAL" title="مجله ملی‌کیدز" />
      <div className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-4xl space-y-4">
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
      </div>
    </>
  );
}
