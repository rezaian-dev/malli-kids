import { connectMongoose } from "@/lib/db/mongoose";
import { ArticleModel } from "@/lib/db/models/article";
import { faDate } from "@/lib/locale/fa";
import type { AdminArticle } from "@/types";

// 📰 All articles, raw body kept for the editor (storefront lib sanitizes)
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
    tags: doc.tags ?? [],
    date: faDate(doc.createdAt),
  }));
}
