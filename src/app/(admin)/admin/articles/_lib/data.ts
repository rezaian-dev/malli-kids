import { connectMongoose } from "@/lib/db/mongoose";
import { ArticleModel } from "@/lib/db/models/article";
import { faDate } from "@/lib/locale/fa";
import type { AdminArticle } from "@/types";

/** 📰 Every article — published and draft — for the admin list/editor.
 *  Unlike `@/lib/articles` (storefront, published-only, sanitized), this
 *  keeps the raw body so it can be re-loaded straight back into the editor. */
export async function getAllArticles(): Promise<AdminArticle[]> {
  await connectMongoose();
  const docs = await ArticleModel.find().sort({ createdAt: -1 }).lean();

  return docs.map((doc) => ({
    slug: doc.slug,
    tag: doc.tag,
    title: doc.title,
    excerpt: doc.excerpt,
    body: doc.body,
    cover: doc.cover,
    published: doc.published,
    date: faDate(doc.createdAt),
  }));
}
