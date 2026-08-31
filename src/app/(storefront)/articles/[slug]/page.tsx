import type { Metadata } from "next";
import { findPublishedArticle, loadPublishedArticles } from "@/lib/articles";
import { ArticleView } from "./_components/article-view";
import { ArticleMissing } from "./_components/article-missing";
import { ArticleActions } from "./_components/article-actions";

function decode(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

export function generateStaticParams() {
  return loadPublishedArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = findPublishedArticle(decode(slug));
  return a ? { title: a.title, description: a.excerpt } : { title: "مجله" };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const decoded = decode(slug);

  return (
    <ArticleView
      slug={decoded}
      initial={findPublishedArticle(decoded) ?? null}
      missing={<ArticleMissing />}
      actions={<ArticleActions />}
    />
  );
}
