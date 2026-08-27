"use client";

import { useAdmin } from "@/features/admin";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";

const PER_PAGE = 8;

export default function AdminArticles() {
  const { db, saveArticles } = useAdmin();
  const pg = usePagination(db.articles, PER_PAGE);
  return (
    <div>
      <PageHead kicker="JOURNAL" title="مجله ملی‌کیدز" />
      <div className="grid gap-3 md:grid-cols-2">
        {pg.pageItems.map((a) => (
          <article key={a.slug} className="lux-card p-5">
            <div className="flex items-start justify-between gap-3">
              <span className="rounded-full bg-gold/15 px-2.5 py-0.5 text-[10px] font-black text-gold">{a.tag}</span>
              <Switch checked={a.published} onCheckedChange={(v) => saveArticles(db.articles.map((x) => (x.slug === a.slug ? { ...x, published: v } : x)))} />
            </div>
            <h2 className="mt-3 font-black text-navy dark:text-ivory">{a.title}</h2>
            <p className="mt-2 text-sm leading-7 text-navy/55 dark:text-wheat">{a.excerpt}</p>
            <p className="mt-3 text-[11px] font-bold text-navy/40 dark:text-wheat">{a.date}</p>
          </article>
        ))}
      </div>
      <Pagination pg={pg} unit="مقاله" />
    </div>
  );
}
