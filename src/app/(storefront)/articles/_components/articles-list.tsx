import Link from "next/link";
import { Newspaper } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { JournalArticle } from "@/lib/articles";
import { cn } from "@/lib/utils";

export function ArticlesList({ initial: articles }: { initial: JournalArticle[] }) {
  if (articles.length === 0) {
    return (
      <p
        className={cn(
          "rounded-3xl border border-dashed px-5 py-4 text-sm",
          "border-navy/15 bg-sand text-navy/70",
          "dark:border-gold/30 dark:bg-dusk-alt dark:text-wheat",
        )}
      >
        هنوز مقاله‌ای منتشر نشده است.
      </p>
    );
  }

  return (
    <>
      {articles.map((a) => (
        <Link
          key={a.slug}
          href={`/articles/${a.slug}`}
          className={cn(
            "flex gap-4 rounded-3xl border p-4 transition sm:p-6",
            "border-navy/10 hover:border-gold/50 bg-white",
            "dark:border-gold/30 dark:bg-dusk",
          )}
        >
          {a.cover ? (
            /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin article covers can be raw data URLs. */
            <img
              src={a.cover}
              alt={a.title}
              width={160}
              height={128}
              className="h-24 w-24 shrink-0 rounded-2xl object-cover sm:h-32 sm:w-40"
            />
          ) : (
            <span
              className={cn(
                "grid h-24 w-24 shrink-0 place-items-center rounded-2xl bg-linear-to-br sm:h-32 sm:w-40",
                "from-sand to-gold/25 text-gold-deep",
                "dark:from-navy-mid dark:to-gold/15",
              )}
            >
              <Newspaper className="size-7" />
            </span>
          )}
          <div className="min-w-0">
            <Badge variant="secondary">{a.tag}</Badge>
            <h2 className="text-navy dark:text-ivory mt-3 text-lg font-black">
              {a.title}
            </h2>
            <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
              {a.excerpt}
            </p>
            {a.date ? (
              <p className="text-navy/70 dark:text-wheat mt-2 text-[11px] font-bold">
                {a.date}
              </p>
            ) : null}
          </div>
        </Link>
      ))}
    </>
  );
}
