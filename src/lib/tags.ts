import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { TagModel } from "@/lib/db/models/tag";

// 🧊 Cached like the product catalog/articles; admin tag mutations revalidate this tag.
export const TAGS_TAG = "tags";

export type ContentTag = { name: string; slug: string };

// 🔤 No de-dup suffix loop — near-duplicate tags are meant to collide onto the same canonical slug.
export function slugifyTag(name: string): string {
  return (
    name
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "") || "برچسب"
  );
}

// 📚 Alphabetical — feeds the admin picker and the slug lookup table.
export const getAllTags = unstable_cache(
  async (): Promise<ContentTag[]> => {
    await connectMongoose();
    const docs = await TagModel.find().sort({ name: 1 }).lean();
    return docs.map((doc) => ({ name: doc.name, slug: doc.slug }));
  },
  ["all-tags"],
  { tags: [TAGS_TAG], revalidate: REVALIDATE.editorial },
);
