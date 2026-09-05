import { unstable_cache } from "next/cache";
import sanitizeHtmlLib from "sanitize-html";
import { connectMongoose } from "@/lib/db/mongoose";
import { ArticleModel, type ArticleDoc } from "@/lib/db/models/article";
import { faDate } from "@/lib/locale/fa";
import { getAllTags, type ContentTag } from "@/lib/tags";

// 🧊 Published articles are public and shared — cached the same way as the
// product catalog (`@/lib/shop/products`), not queried fresh per request.
// Admin writes (`admin/articles/_lib/actions.ts`) revalidate this tag.
export const ARTICLES_TAG = "articles";

export type JournalArticle = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  date?: string;
  // 🏷️ Resolved from `ArticleDoc.tags` (slugs) against the small cached
  // `getAllTags()` list — a slug an article still carries after its `Tag`
  // was deleted just silently drops out here instead of rendering a blank.
  tags: ContentTag[];
  // 🕒 ISO 8601, for `articleSchema`'s `datePublished`/`dateModified` — schema.org
  // wants a machine-readable date, not the Jalali display string above.
  publishedAt: string;
  updatedAt: string;
};

// 🔐 Real allowlist sanitizer (was a hand-rolled `script/iframe/on*=` regex
// strip — bypassable via `formaction`, entity-encoded `javascript:`, `<meta
// refresh>`, etc.). Only the tags/attributes the admin rich editor
// (`@/components/admin/rich-editor.tsx`'s TipTap `StarterKit` + `Image` +
// `TextAlign`) can actually produce are allowed — everything else, this
// body is rendered with `dangerouslySetInnerHTML` to every site visitor.
const ARTICLE_SANITIZE_OPTIONS: sanitizeHtmlLib.IOptions = {
  allowedTags: [
    "p",
    "br",
    "hr",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "s",
    "strike",
    "blockquote",
    "h1",
    "h2",
    "h3",
    "h4",
    "h5",
    "h6",
    "ul",
    "ol",
    "li",
    "a",
    "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "title"],
    "*": ["style"],
  },
  // ✍️ `TextAlign` only ever sets this one style property — nothing else
  // gets through, so no CSS-injection surface (background/expression/...).
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
  },
  allowedSchemesByTag: {
    a: ["http", "https"],
    // 🖼️ Cover/inline images are stored as compressed data URLs.
    img: ["http", "https", "data"],
  },
  transformTags: {
    // 🔗 Every link forced to `noopener noreferrer` regardless of what was
    // stored — closes reverse-tabnabbing even for old/pre-fix rows.
    a: sanitizeHtmlLib.simpleTransform(
      "a",
      { rel: "noopener noreferrer", target: "_blank" },
      true,
    ),
  },
};

function sanitizeHtml(html: string): string {
  return sanitizeHtmlLib(html, ARTICLE_SANITIZE_OPTIONS);
}

function toJournalArticle(
  doc: ArticleDoc,
  tagsBySlug: Map<string, ContentTag>,
): JournalArticle {
  return {
    slug: doc.slug,
    tag: doc.tag,
    title: doc.title,
    excerpt: doc.excerpt,
    body: sanitizeHtml(doc.body),
    cover: doc.cover,
    date: faDate(doc.createdAt),
    tags: (doc.tags ?? []).flatMap((slug) => tagsBySlug.get(slug) ?? []),
    publishedAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function tagLookup(): Promise<Map<string, ContentTag>> {
  const tags = await getAllTags();
  return new Map(tags.map((t) => [t.slug, t]));
}

/** 📰 Every published article, newest first — the real replacement for the
 *  old client-only `localStorage` read (which the server side of every page
 *  below silently ignored, always falling back to the static seed). */
export const loadPublishedArticles = unstable_cache(
  async (): Promise<JournalArticle[]> => {
    await connectMongoose();
    const [docs, tagsBySlug] = await Promise.all([
      ArticleModel.find({ published: true }).sort({ createdAt: -1 }).lean(),
      tagLookup(),
    ]);
    return docs.map((doc) => toJournalArticle(doc, tagsBySlug));
  },
  ["published-articles"],
  { tags: [ARTICLES_TAG], revalidate: 3600 },
);

export const findPublishedArticle = unstable_cache(
  async (slug: string): Promise<JournalArticle | undefined> => {
    await connectMongoose();
    const [doc, tagsBySlug] = await Promise.all([
      ArticleModel.findOne({ slug, published: true }).lean(),
      tagLookup(),
    ]);
    return doc ? toJournalArticle(doc, tagsBySlug) : undefined;
  },
  ["published-article-by-slug"],
  { tags: [ARTICLES_TAG], revalidate: 3600 },
);
