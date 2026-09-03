import { Intro } from "@/components/shared/intro";
import { JsonLd } from "@/components/shared/json-ld";
import { loadPublishedArticles } from "@/lib/articles";
import { buildMetadata, itemListSchema } from "@/lib/seo";
import { ArticlesList } from "@/features/articles/components/list/articles-list";

export const metadata = buildMetadata({
  title: "مجله",
  description: "راهنمای سایز، نگهداری پارچه و استایل کودک.",
  path: "/articles",
});

export default function ArticlesPage() {
  const seed = loadPublishedArticles();

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
        <ArticlesList initial={seed} />
      </div>
    </>
  );
}
