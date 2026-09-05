import type { ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { JournalArticle } from "@/lib/articles";
import { cn } from "@/lib/utils";

const CRUMB_LINK = "hover:text-gold inline-block py-1.5";

const BODY_HTML = cn(
  "mt-6 text-[0.95rem] leading-[2.1]",
  "[&_a]:font-extrabold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-[3px]",
  "[&_blockquote]:my-4 [&_blockquote]:border-s-[3px] [&_blockquote]:border-gold [&_blockquote]:ps-[0.9rem] [&_blockquote]:font-semibold [&_blockquote]:opacity-80",
  "[&_h2]:my-[1.4rem_0.6rem] [&_h2]:text-[1.25rem] [&_h2]:font-black",
  "[&_h3]:my-[1.2rem_0.5rem] [&_h3]:text-[1.05rem] [&_h3]:font-black",
  "[&_img]:my-4 [&_img]:h-auto [&_img]:max-w-full [&_img]:rounded-[1.25rem]",
  "[&_li]:my-[0.3rem]",
  "[&_ol]:my-[0.7rem] [&_ol]:list-decimal [&_ol]:ps-[1.4rem]",
  "[&_p]:my-[0.7rem]",
  "[&_strong]:font-black",
  "[&_ul]:my-[0.7rem] [&_ul]:list-disc [&_ul]:ps-[1.4rem]",
);

export function ArticleView({
  article,
  actions,
}: {
  article: JournalArticle;
  actions: ReactNode;
}) {
  const isHtml = article.body.trimStart().startsWith("<");

  return (
    <article className="xs:px-4 container mx-auto w-full max-w-3xl px-3 sm:px-5 lg:px-7">
      <header>
        <nav aria-label="مسیر مقاله" className="text-muted-foreground text-xs">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className={CRUMB_LINK}>
                خانه
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li>
              <Link href="/articles" className={CRUMB_LINK}>
                مجله
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li className="text-navy/70 dark:text-ivory/80">{article.title}</li>
          </ol>
        </nav>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{article.tag}</Badge>
          {article.date ? (
            <span className="text-navy/70 dark:text-wheat text-[11px] font-bold">
              {article.date}
            </span>
          ) : null}
        </div>
        <h1 className="text-navy dark:text-ivory mt-3 text-3xl font-black">
          {article.title}
        </h1>
      </header>
      {article.cover ? (
        /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin article covers can be raw data URLs. */
        <img
          src={article.cover}
          alt={article.title}
          className="mt-6 w-full rounded-3xl object-cover"
        />
      ) : null}
      {isHtml ? (
        <div
          className={BODY_HTML}
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: article.body }}
        />
      ) : (
        <p className="text-navy/75 dark:text-cream/75 mt-6 leading-9">
          {article.body}
        </p>
      )}
      {actions}
    </article>
  );
}
