import { STORAGE } from "@/lib/constants";
import { ARTICLES } from "@/lib/data/pages";

export type JournalArticle = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  /** متنِ ساده (دانه) یا HTML خروجیِ ویرایشگرِ ادمین */
  body: string;
  /** تصویرِ شاخصِ آپلودشده توسط ادمین (dataURL) — دانه تصویر ندارد */
  cover?: string;
  date?: string;
};

type StoredArticle = {
  slug?: string;
  tag?: string;
  title?: string;
  excerpt?: string;
  body?: string;
  cover?: string;
  published?: boolean;
  date?: string;
};

/** مقاله‌های دانه برای وقتی هنوز ادمین چیزی ذخیره نکرده است */
const SEED: JournalArticle[] = ARTICLES.map((a) => ({
  slug: a.slug,
  tag: a.tag,
  title: a.title,
  excerpt: a.excerpt,
  body: a.body,
}));

function sanitizeHtml(html: string): string {
  // خروجیِ ویرایشگرِ خودِ ادمین است؛ با این حال script/iframe/handler حذف می‌شود
  return html
    .replace(/<\s*(script|iframe|object|embed)[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/<\s*(script|iframe|object|embed)[^>]*\/?\s*>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/href\s*=\s*(["'])\s*javascript:[^"']*\1/gi, 'href="#"');
}

/**
 * فهرستِ مقاله‌های منتشرشده: اگر ادمین در پنل مقاله‌ای ذخیره کرده باشد
 * همان‌ها (فقط منتشرشده‌ها) و در غیرِ این صورت دانهٔ اولیه.
 * فقط در مرورگر قابلِ خواندن است (localStorage).
 */
export function loadPublishedArticles(): JournalArticle[] {
  if (typeof window === "undefined") return SEED;
  try {
    const raw = window.localStorage.getItem(STORAGE.adminDb);
    if (!raw) return SEED;
    const parsed = JSON.parse(raw) as { articles?: StoredArticle[] };
    if (!Array.isArray(parsed.articles) || parsed.articles.length === 0) return SEED;
    return parsed.articles
      .filter((a) => a && a.published && typeof a.slug === "string")
      .map((a) => ({
        slug: String(a.slug),
        tag: a.tag || "مجله",
        title: a.title || "",
        excerpt: a.excerpt || "",
        body: a.body ? sanitizeHtml(a.body) : "",
        cover: a.cover || undefined,
        date: a.date,
      }));
  } catch {
    return SEED;
  }
}

export function findPublishedArticle(slug: string): JournalArticle | undefined {
  return loadPublishedArticles().find((a) => a.slug === slug);
}
