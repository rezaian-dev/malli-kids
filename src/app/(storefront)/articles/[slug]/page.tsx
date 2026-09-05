import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedArticle } from "@/lib/articles";
import { JsonLd } from "@/components/shared/json-ld";
import { articleSchema, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { ArticleActions } from "./_components/article-actions";
import { ArticleView } from "./_components/article-view";

function decode(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await findPublishedArticle(decode(slug));

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
    keywords: article.tag ? [article.tag] : undefined,
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decode(slug);
  const article = await findPublishedArticle(decoded);

  // 🚫 A missing/unpublished slug is a real 404, not a 200 with a "not
  // found" message — `product/[id]/page.tsx` already does this the right
  // way; this page used to render inline instead, which told crawlers the
  // page was fine.
  if (!article) notFound();

  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "خانه", path: "/" },
          { name: "مجله", path: "/articles" },
          { name: article.title, path: `/articles/${article.slug}` },
        ])}
      />
      <JsonLd data={articleSchema(article)} />
      <ArticleView article={article} actions={<ArticleActions />} />
    </>
  );
}
