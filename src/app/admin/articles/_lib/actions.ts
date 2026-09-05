"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ArticleModel } from "@/lib/db/models/article";
import { TagModel } from "@/lib/db/models/tag";
import { toFaDigits } from "@/lib/locale/fa";
import { ARTICLES_TAG } from "@/lib/articles";
import { getAllTags, TAGS_TAG, slugifyTag, type ContentTag } from "@/lib/tags";
import { uniqueSlugAgainst } from "@/lib/db/unique-slug";
import { getAllArticles } from "./data";
import type { ActionResult } from "@/lib/action-result";
import type { AdminArticle } from "@/types";
import { articleSchema, tagNameSchema, type ArticleValues } from "./schemas";

/** 🔄 Polled from `AdminArticlesLanding` — article/tag edits (this tab or
 *  another admin) show up without a manual reload. */
export async function getAdminArticlesAction(): Promise<{
  articles: AdminArticle[];
  tags: ContentTag[];
}> {
  const admin = await requireAdmin();
  if (!admin) return { articles: [], tags: [] };
  const [articles, tags] = await Promise.all([getAllArticles(), getAllTags()]);
  return { articles, tags };
}

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const TAG_NAME_ERROR = "نام برچسب باید بین ۲ تا ۳۰ نویسه باشد.";

function revalidateArticles() {
  revalidatePath("/admin/articles");
  // 🧊 Article routes render dynamically — bust ARTICLES_TAG, not a route cache
  revalidateTag(ARTICLES_TAG, "max");
}

// 🪶 Persian-friendly slug, de-duplicated (uniqueSlugAgainst)
async function uniqueSlug(title: string): Promise<string> {
  const base =
    title
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "") || "مقاله";

  return uniqueSlugAgainst(ArticleModel, base, toFaDigits);
}

export async function createArticleAction(
  values: ArticleValues,
): Promise<ActionResult<{ slug: string }>> {
  const parsed = articleSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const slug = await uniqueSlug(parsed.data.title);
    const tags = Array.from(new Set(parsed.data.tags));
    await ArticleModel.create({ ...parsed.data, tags, slug });
    revalidateArticles();
    return { ok: true, data: { slug } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function updateArticleAction(
  slug: string,
  values: ArticleValues,
): Promise<ActionResult> {
  const parsed = articleSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const tags = Array.from(new Set(parsed.data.tags));
    const updated = await ArticleModel.findOneAndUpdate(
      { slug },
      { $set: { ...parsed.data, tags } },
    );
    if (!updated) return { ok: false, error: "مقاله پیدا نشد." };

    revalidateArticles();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function setArticlePublishedAction(
  slug: string,
  published: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await ArticleModel.updateOne({ slug }, { $set: { published } });
    revalidateArticles();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeArticleAction(slug: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await ArticleModel.deleteOne({ slug });
    revalidateArticles();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

function revalidateTags() {
  revalidateTag(TAGS_TAG, "max");
}

// 🏷️ Resolves a typed name to a real tag — upsert, never a near-duplicate
export async function createTagAction(
  name: string,
): Promise<ActionResult<ContentTag>> {
  const parsed = tagNameSchema.safeParse(name);
  if (!parsed.success) return { ok: false, error: TAG_NAME_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const slug = slugifyTag(parsed.data);
    const doc = await TagModel.findOneAndUpdate(
      { slug },
      { $setOnInsert: { name: parsed.data, slug } },
      { upsert: true, new: true },
    );
    revalidateTags();
    return { ok: true, data: { name: doc.name, slug: doc.slug } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

// 🗑️ Deletes a tag and pulls it off articles — no rename at this taxonomy size
export async function removeTagAction(slug: string): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await TagModel.deleteOne({ slug });
    await ArticleModel.updateMany({ tags: slug }, { $pull: { tags: slug } });
    revalidateTags();
    revalidateArticles();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
