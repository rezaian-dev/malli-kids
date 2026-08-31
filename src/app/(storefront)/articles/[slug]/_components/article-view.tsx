"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { findPublishedArticle, type JournalArticle } from "@/lib/articles";

export function ArticleView({
  slug,
  initial,
  missing,
  actions,
}: {
  slug: string;
  initial: JournalArticle | null;
  missing: ReactNode;
  actions: ReactNode;
}) {
  const [a, setA] = useState<JournalArticle | null>(initial);
  const [ready, setReady] = useState(initial !== null);

  useEffect(() => {
    setA(findPublishedArticle(slug) ?? null);
    setReady(true);
  }, [slug]);

  
  if (!ready) return <div className="min-h-[40vh]" />;
  if (!a) return <>{missing}</>;

  const isHtml = a.body.trimStart().startsWith("<");

  return (
    <article className="container mx-auto w-full px-4 sm:px-5 lg:px-7 max-w-3xl">
      <p className="text-xs text-muted-foreground">
        <Link href="/" className="inline-block py-1.5">خانه</Link> / <Link href="/articles" className="inline-block py-1.5">مجله</Link> / {a.title}
      </p>
      <Badge variant="secondary" className="mt-4">
        {a.tag}
      </Badge>
      {a.date ? <span className="mt-4 ms-2 align-middle text-[11px] font-bold text-navy/40 dark:text-wheat">{a.date}</span> : null}
      <h1 className="text-3xl font-black mt-3 text-navy dark:text-ivory">{a.title}</h1>
      {a.cover ? (
        /* eslint-disable-next-line @next/next/no-img-element -- 🪶 Admin article covers can be raw data URLs. */
        <img src={a.cover} alt="" className="mt-6 w-full rounded-3xl object-cover" />
      ) : null}
      {isHtml ? (
        <div
          className="mt-6 leading-[2.1] text-[0.95rem] [&_h2]:my-[1.4rem_0.6rem] [&_h2]:text-[1.25rem] [&_h2]:font-black [&_h3]:my-[1.2rem_0.5rem] [&_h3]:text-[1.05rem] [&_h3]:font-black [&_p]:my-[0.7rem] [&_ul]:my-[0.7rem] [&_ul]:list-disc [&_ul]:ps-[1.4rem] [&_ol]:my-[0.7rem] [&_ol]:list-decimal [&_ol]:ps-[1.4rem] [&_li]:my-[0.3rem] [&_blockquote]:my-4 [&_blockquote]:border-s-[3px] [&_blockquote]:border-gold [&_blockquote]:ps-[0.9rem] [&_blockquote]:opacity-80 [&_blockquote]:font-semibold [&_a]:font-extrabold [&_a]:text-gold [&_a]:underline [&_a]:underline-offset-[3px] [&_img]:my-4 [&_img]:max-w-full [&_img]:rounded-[1.25rem] [&_img]:h-auto [&_strong]:font-black"
          dir="rtl"
          dangerouslySetInnerHTML={{ __html: a.body }}
        />
      ) : (
        <p className="mt-6 leading-9 text-navy/75 dark:text-cream/75">{a.body}</p>
      )}
      {actions}
    </article>
  );
}
