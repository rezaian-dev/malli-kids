"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { findPublishedArticle, type JournalArticle } from "@/lib/articles";
import { ArticleMissing } from "./page";

export function ArticleClient({ slug }: { slug: string }) {
  const [a, setA] = useState<JournalArticle | null | undefined>(undefined);
  // اسلاگ‌های فارسی از مسیر به‌صورت percent-encoded می‌رسند
  const decoded = useMemo(() => {
    try {
      return decodeURIComponent(slug);
    } catch {
      return slug;
    }
  }, [slug]);
  useEffect(() => setA(findPublishedArticle(decoded) ?? null), [decoded]);

  // تا زمانِ خواندنِ localStorage چیزی نشان نده تا با رندرِ سرور تضاد نشود
  if (a === undefined) return <div className="min-h-[40vh]" />;
  if (a === null) return <ArticleMissing />;

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
        /* eslint-disable-next-line @next/next/no-img-element */
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
      <div className="flex flex-wrap gap-2 mt-8">
        <Button asChild className="rounded-full">
          <Link href="/shop">فروشگاه</Link>
        </Button>
        <Button asChild variant="secondary" className="rounded-full">
          <Link href="/tryon">پرو مجازی</Link>
        </Button>
        <Button asChild variant="ghost" className="rounded-full">
          <Link href="/articles">بازگشت به مجله</Link>
        </Button>
      </div>
    </article>
  );
}
