import { unstable_cache } from "next/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { TagModel } from "@/lib/db/models/tag";

// 🧊 Small, site-wide, rarely-changing list — cached the same way as the
// product catalog/articles (`@/lib/shop/products`, `@/lib/articles`).
// Admin tag mutations (`admin/articles/_lib/actions.ts`) revalidate this tag.
export const TAGS_TAG = "tags";

export type ContentTag = { name: string; slug: string };

/** 🔤 A clean, Persian-friendly slug — same shape as `ArticleModel.slug`'s
 *  own generator (`admin/articles/_lib/actions.ts#uniqueSlug`), minus the
 *  numeric-suffix de-duplication loop: two tags typed close enough to
 *  collide on their slug (e.g. "تابستان" / "تابستان‌") are meant to resolve
 *  to the *same* canonical tag, not spawn a second near-duplicate one. */
export function slugifyTag(name: string): string {
  return (
    name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "") || "برچسب"
  );
}

/** 📚 Every tag in the taxonomy, alphabetical — the admin picker's full
 *  list and the lookup table article read-paths resolve slugs against. */
export const getAllTags = unstable_cache(
  async (): Promise<ContentTag[]> => {
    await connectMongoose();
    const docs = await TagModel.find().sort({ name: 1 }).lean();
    return docs.map((doc) => ({ name: doc.name, slug: doc.slug }));
  },
  ["all-tags"],
  { tags: [TAGS_TAG], revalidate: 3600 },
);
