import Link from "next/link";
import { X } from "lucide-react";
import { Intro } from "@/components/shared/intro";
import { JsonLd } from "@/components/shared/json-ld";
import { loadPublishedArticles } from "@/lib/articles";
import { buildMetadata, itemListSchema } from "@/lib/seo";
import { Badge } from "@/components/ui/badge";
import { ArticlesList } from "./_components/articles-list";

// 🔎 `?tag=<slug>` filters the same list in place — no separate `/articles/
// tag/[slug]` route. `buildMetadata`'s `path` below stays the fixed
// `"/articles"` regardless of the query string, so every filtered view
// canonicalizes back to the one indexable list page instead of search
// engines treating each tag combination as its own page to crawl/index.
export const metadata = buildMetadata({
  title: "مجله",
  description: "راهنمای سایز، نگهداری پارچه و استایل کودک.",
  path: "/articles",
});

export default async function ArticlesPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string }>;
}) {
  const { tag } = await searchParams;
  const all = await loadPublishedArticles();
  const activeTag = tag
    ? (all.flatMap((a) => a.tags).find((t) => t.slug === tag) ?? null)
    : null;
  const seed = activeTag
    ? all.filter((a) => a.tags.some((t) => t.slug === activeTag.slug))
    : all;

  return (
    <>
      <Intro
        crumb="مجله"
        kicker="JOURNAL"
        title="مجله ملی‌کیدز"
        lead="راهنماهای کوتاه و کاربردی برای انتخاب سایز، نگهداری پارچه و ساختن استایل‌های کودکانه."
        path="/articles"
        schemaType="CollectionPage"
      />
      {seed.length ? (
        <JsonLd
          data={itemListSchema(
            seed.map((article) => ({
              name: article.title,
              path: `/articles/${article.slug}`,
              image: article.cover,
            })),
            "مجله ملی‌کیدز",
          )}
        />
      ) : null}
      <div className="container mx-auto w-full max-w-4xl space-y-4 px-3 xs:px-4 sm:px-5 lg:px-7">
        {activeTag ? (
          <div className="flex items-center gap-2">
            <span className="text-navy/70 dark:text-wheat text-xs font-bold">
              فیلتر بر اساس موضوع:
            </span>
            <Link href="/articles">
              <Badge className="gap-1.5">
                {activeTag.name}
                <X className="size-3" />
              </Badge>
            </Link>
          </div>
        ) : null}
        <ArticlesList initial={seed} />
      </div>
    </>
  );
}
