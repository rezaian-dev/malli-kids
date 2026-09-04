"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ArticleModel } from "@/lib/db/models/article";
import { toFaDigits } from "@/lib/locale/fa";
import { ARTICLES_TAG } from "@/lib/articles";
import type { ActionResult } from "@/lib/action-result";
import { articleSchema, type ArticleValues } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateArticles() {
  revalidatePath("/admin/articles");
  // 🧊 The public article list/detail pages read from `loadPublishedArticles`/
  // `findPublishedArticle`'s own `unstable_cache` (tag `ARTICLES_TAG`), not a
  // route-level page cache — those routes render dynamically, so there's no
  // cache entry here for `revalidatePath("/articles")` to bust.
  revalidateTag(ARTICLES_TAG, "max");
}

/** 🪶 A clean Persian-friendly slug from the title, de-duplicated against
 *  what's already in the database (moved from the old client-side draft —
 *  uniqueness has to be checked against the real collection now). */
async function uniqueSlug(title: string): Promise<string> {
  const base =
    title
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]/gu, "") || "مقاله";

  let slug = base;
  let i = 2;
  while (await ArticleModel.exists({ slug })) {
    slug = `${base}-${toFaDigits(i++)}`;
  }
  return slug;
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
    await ArticleModel.create({ ...parsed.data, slug });
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
    const updated = await ArticleModel.findOneAndUpdate(
      { slug },
      { $set: parsed.data },
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
