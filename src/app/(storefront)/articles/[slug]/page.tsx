import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { findPublishedArticle, loadPublishedArticles } from "@/lib/articles";
import { JsonLd } from "@/components/shared/json-ld";
import { articleSchema, breadcrumbSchema, buildMetadata } from "@/lib/seo";
import { ArticleActions } from "./_components/article-actions";
import { ArticleView } from "./_components/article-view";

// ⚠️ Segment config must be a literal — Turbopack statically extracts this
// export and rejects a reference (see REVALIDATE.editorial in @/lib/cache).
export const revalidate = 3600;

// 🛡️ Build-safe: if DB/auth unavailable (Pars build without MONGODB_URI), return no params and let ISR hydrate at runtime.
export const dynamicParams = true;

export async function generateStaticParams() {
  try {
    const articles = await loadPublishedArticles();
    return articles.map((article) => ({ slug: article.slug }));
  } catch (err) {
    console.warn(
      "[articles/[slug]] generateStaticParams failed — skipping prerender:",
      (err as Error).message,
    );
    return [];
  }
}

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
  let article;
  try {
    article = await findPublishedArticle(decode(slug));
  } catch (err) {
    console.warn(
      `[articles/[slug]] generateMetadata("${slug}") failed:`,
      (err as Error).message,
    );
    article = undefined;
  }

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
    // 🏷️ Real assigned tags only — legitimate metadata, not stuffing
    keywords: [article.tag, ...article.tags.map((t) => t.name)].filter(Boolean),
  });
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const decoded = decode(slug);
  let article;
  try {
    article = await findPublishedArticle(decoded);
  } catch (err) {
    console.warn(
      `[articles/[slug]] ArticlePage find failed for "${decoded}":`,
      (err as Error).message,
    );
    article = undefined;
  }

  // 🚫 A missing/unpublished slug is a real 404, not a 200
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
