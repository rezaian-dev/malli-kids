import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import sanitizeHtmlLib from "sanitize-html";
import { connectMongoose } from "@/lib/db/mongoose";
import { ArticleModel, type ArticleDoc } from "@/lib/db/models/article";
import { faDate } from "@/lib/locale/fa";
import { getAllTags, type ContentTag } from "@/lib/tags";

// 🧊 Cached like the product catalog; admin writes revalidate this tag.
export const ARTICLES_TAG = "articles";

export type JournalArticle = {
  slug: string;
  tag: string;
  title: string;
  excerpt: string;
  body: string;
  cover?: string;
  date?: string;
  // 🏷️ A deleted tag's slug silently drops out instead of rendering blank.
  tags: ContentTag[];
  // 🕒 ISO 8601 for schema.org, not the Jalali display string above.
  publishedAt: string;
  updatedAt: string;
};

// 🔐 Allowlist sanitizer: this HTML renders via dangerouslySetInnerHTML.
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
  // ✍️ Only text-align passes — no CSS-injection surface.
  allowedStyles: {
    "*": { "text-align": [/^(left|right|center|justify)$/] },
  },
  allowedSchemesByTag: {
    a: ["http", "https"],
    // 🖼️ Cover/inline images are stored as compressed data URLs.
    img: ["http", "https", "data"],
  },
  transformTags: {
    // 🔗 Forces noopener noreferrer on every link — closes reverse-tabnabbing.
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

// 📰 Newest first.
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
  { tags: [ARTICLES_TAG], revalidate: REVALIDATE.editorial },
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
  { tags: [ARTICLES_TAG], revalidate: REVALIDATE.editorial },
);
