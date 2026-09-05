"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/product";
import { nextProductId, PRODUCTS_TAG } from "@/lib/shop/products";
import { deriveStock, type ProductVariant } from "@/lib/shop/inventory";
import { notifyBackInStock } from "@/lib/shop/back-in-stock";
import { logAudit } from "@/lib/admin/audit";
import { formatToman } from "@/lib/locale/fa";
import type { ActionResult } from "@/lib/action-result";
import { productSchema, type ProductValues } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  // 🧊 The public catalog itself is served from `getAllProducts`/
  // `getProductById`'s own `unstable_cache` (tag `PRODUCTS_TAG`), not from a
  // route-level page cache — `/shop` renders dynamically (root layout reads
  // per-request session/cart state), so there's no route cache entry here
  // for `revalidatePath("/shop")` to bust.
  revalidateTag(PRODUCTS_TAG, "max");
}

/** 🪶 A clean, URL-safe slug from the name, de-duplicated against what's
 *  already in the database — same pattern as `articles/_lib/actions.ts`'s
 *  `uniqueSlug`. Only used when the admin didn't type their own. */
async function uniqueProductSlug(name: string): Promise<string> {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "product";

  let slug = base;
  let i = 2;
  while (await ProductModel.exists({ slug })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

/** 🧮 `findOneAndUpdate` skips the model's `pre("save")` hook, so the
 *  `stock` boolean has to be derived by hand here to stay honest with
 *  whatever `variants` this write is setting. */
function withDerivedStock(values: ProductValues) {
  return { ...values, stock: deriveStock(values.variants, values.stock) };
}

export async function createProductAction(
  values: ProductValues,
): Promise<ActionResult<{ id: number }>> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const id = await nextProductId();
    const slug = parsed.data.slug || (await uniqueProductSlug(parsed.data.name));
    await ProductModel.create({ ...parsed.data, slug, id, rate: 4.8, sold: 0 });
    revalidateCatalog();
    return { ok: true, data: { id } };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function updateProductAction(
  id: number,
  values: ProductValues,
): Promise<ActionResult> {
  const parsed = productSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const before = await ProductModel.findOne({ id }).lean();
    if (!before) return { ok: false, error: "محصول پیدا نشد." };

    const updated = await ProductModel.findOneAndUpdate(
      { id },
      { $set: withDerivedStock(parsed.data) },
      { new: true },
    );
    if (!updated) return { ok: false, error: "محصول پیدا نشد." };

    if (before.price !== parsed.data.price || before.old !== parsed.data.old) {
      await logAudit({
        actor: admin,
        action: "product.price",
        targetType: "product",
        targetId: String(id),
        summary: `قیمت «${parsed.data.name}» به ${formatToman(parsed.data.price)} تومان تغییر کرد`,
      });
    }

    revalidateCatalog();
    revalidatePath(`/admin/products/${id}/edit`);

    // 🔔 Best-effort: tell anyone waiting on a size (or the whole legacy
    // product) that just gained stock in this save. A cheap no-op for the
    // overwhelmingly common case where nobody's subscribed.
    if (parsed.data.variants.length) {
      for (const variant of parsed.data.variants) {
        if (variant.stock > 0) await notifyBackInStock(id, variant.size);
      }
    } else if (parsed.data.stock) {
      await notifyBackInStock(id);
    }

    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeProductAction(id: number): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const removed = await ProductModel.findOneAndDelete({ id }).lean();
    revalidateCatalog();
    if (removed) {
      await logAudit({
        actor: admin,
        action: "product.remove",
        targetType: "product",
        targetId: String(id),
        summary: `محصول «${removed.name}» حذف شد`,
      });
    }
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 🪶 The legacy boolean toggle — still the whole story for a product that
 *  was never given variants (e.g. an unsized accessory). */
export async function setProductStockAction(
  id: number,
  stock: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    await ProductModel.updateOne({ id }, { $set: { stock } });
    revalidateCatalog();
    if (stock) await notifyBackInStock(id);
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 📦 Inline stock edit from the inventory table — sets one variant's exact
 *  quantity (not a delta) and keeps the product's `stock` boolean derived
 *  from the result. */
export async function setVariantStockAction(
  id: number,
  size: string,
  stock: number,
): Promise<ActionResult> {
  if (!Number.isInteger(stock) || stock < 0) return { ok: false, error: FALLBACK_ERROR };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const updated = await ProductModel.findOneAndUpdate(
      { id, "variants.size": size },
      { $set: { "variants.$.stock": stock } },
      { new: true },
    );
    if (!updated) return { ok: false, error: "این تنوع پیدا نشد." };

    await ProductModel.updateOne(
      { id },
      { $set: { stock: deriveStock(updated.variants, updated.stock) } },
    );

    revalidateCatalog();
    if (stock > 0) await notifyBackInStock(id, size);
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 📦 Bulk stock update — sets the same quantity on one size across several
 *  products at once (e.g. a fresh shipment landed for size ۹۸ everywhere). */
export async function bulkSetVariantStockAction(
  updates: { id: number; size: string; stock: number }[],
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!updates.length) return { ok: true };

  try {
    await connectMongoose();
    for (const { id, size, stock } of updates) {
      if (!Number.isInteger(stock) || stock < 0) continue;
      const updated = await ProductModel.findOneAndUpdate(
        { id, "variants.size": size },
        { $set: { "variants.$.stock": stock } },
        { new: true },
      );
      if (updated) {
        await ProductModel.updateOne(
          { id },
          { $set: { stock: deriveStock(updated.variants, updated.stock) } },
        );
        if (stock > 0) await notifyBackInStock(id, size);
      }
    }
    revalidateCatalog();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function bulkSetProductVisibilityAction(
  ids: number[],
  visible: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!ids.length) return { ok: true };

  try {
    await connectMongoose();
    await ProductModel.updateMany({ id: { $in: ids } }, { $set: { visible } });
    revalidateCatalog();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function bulkSetProductFeaturedAction(
  ids: number[],
  featured: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!ids.length) return { ok: true };

  try {
    await connectMongoose();
    await ProductModel.updateMany({ id: { $in: ids } }, { $set: { featured } });
    revalidateCatalog();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function bulkRemoveProductsAction(ids: number[]): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!ids.length) return { ok: true };

  try {
    await connectMongoose();
    await ProductModel.deleteMany({ id: { $in: ids } });
    revalidateCatalog();
    await logAudit({
      actor: admin,
      action: "product.remove",
      targetType: "product",
      targetId: ids.join(","),
      summary: `${ids.length} محصول به‌صورت گروهی حذف شد`,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export type { ProductVariant };
