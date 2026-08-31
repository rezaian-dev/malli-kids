import type { Metadata } from "next";
import { findPublishedArticle, loadPublishedArticles } from "@/lib/articles";
import { ArticleView } from "./article-view";
import { ArticleMissing } from "./article-missing";
import { ArticleActions } from "./article-actions";

/** اسلاگ‌های فارسی از مسیر به‌صورت percent-encoded می‌رسند */
function decode(slug: string) {
  try {
    return decodeURIComponent(slug);
  } catch {
    return slug;
  }
}

/** مقاله‌های دانه از پیش ساخته می‌شوند؛ مقاله‌های ادمین در زمان اجرا حل می‌شوند */
export function generateStaticParams() {
  return loadPublishedArticles().map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = findPublishedArticle(decode(slug));
  return a ? { title: a.title, description: a.excerpt } : { title: "مجله" };
}

/**
 * صفحهٔ مقاله — Server Component.
 * مقالهٔ دانه روی سرور پیدا و رندر می‌شود؛ جزیرهٔ client فقط برای مقاله‌هایی است
 * که ادمین در مرورگر ذخیره کرده و اسلات‌های ایستا را از همین‌جا می‌گیرد.
 */
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
