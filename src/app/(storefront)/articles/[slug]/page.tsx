import type { Metadata } from "next";
import { findPublishedArticle, loadPublishedArticles } from "@/lib/articles";
import { JsonLd } from "@/components/shared/json-ld";
import { articleSchema, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { ArticleActions } from "./_components/article-actions";
import { ArticleMissing } from "./_components/article-missing";
import { ArticleView } from "./_components/article-view";

function decode(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function generateStaticParams() {
  return loadPublishedArticles().map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = findPublishedArticle(decode(slug));

  if (!article) {
    return buildMetadata({
      title: "مقاله پیدا نشد",
      description: "این مقاله در حال حاضر در دسترس نیست.",
      path: `/articles/${slug}`,
      noIndex: true,
      type: "article",
    });
  }

  return buildMetadata({
    title: article.title,
    description: article.excerpt,
    path: `/articles/${article.slug}`,
    image: article.cover,
    imageAlt: article.title,
    type: "article",
    keywords: [article.tag, article.title],
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decode(slug);
  const article = findPublishedArticle(decoded) ?? null;

  return (
    <>
      {article ? (
        <JsonLd
          data={breadcrumbSchema([
            { name: "خانه", path: "/" },
            { name: "مجله", path: "/articles" },
            { name: article.title, path: `/articles/${article.slug}` },
          ])}
        />
      ) : null}
      {article ? <JsonLd data={articleSchema(article)} /> : null}
      <ArticleView
        slug={decoded}
        initial={article}
        missing={<ArticleMissing />}
        actions={<ArticleActions />}
      />
    </>
  );
}
