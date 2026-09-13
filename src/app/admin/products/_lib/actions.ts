"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/product";
import {
  getAllProducts,
  nextProductId,
  PRODUCTS_TAG,
} from "@/lib/shop/products";
import { deriveStock } from "@/lib/shop/inventory";
import { notifyBackInStock } from "@/lib/shop/back-in-stock";
import { logAudit } from "@/lib/admin/audit";
import { formatToman } from "@/lib/locale/fa";
import { uniqueSlugAgainst } from "@/lib/db/unique-slug";
import type { ActionResult } from "@/lib/action-result";
import type { Product } from "@/types";
import { productSchema, type ProductValues } from "./schemas";

// Polled by the products + inventory landings
export async function getAllProductsAction(): Promise<Product[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAllProducts();
}

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  // /shop renders dynamically — the catalog cache is the PRODUCTS_TAG, not a route cache
  revalidateTag(PRODUCTS_TAG, "max");
}

// URL-safe slug from the name, de-duplicated (admin may type their own)
async function uniqueProductSlug(name: string): Promise<string> {
  const base =
    name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-") || "product";

  return uniqueSlugAgainst(ProductModel, base);
}

// findOneAndUpdate skips pre("save") — derive the stock boolean by hand
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
    const slug =
      parsed.data.slug || (await uniqueProductSlug(parsed.data.name));
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

    // Best-effort back-in-stock notifies; no-op when nobody's subscribed
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

// Legacy boolean toggle — still the whole story for variant-less products
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

// Sets one variant's exact quantity; keeps the stock boolean derived
export async function setVariantStockAction(
  id: number,
  size: string,
  stock: number,
): Promise<ActionResult> {
  if (!Number.isInteger(stock) || stock < 0)
    return { ok: false, error: FALLBACK_ERROR };

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

// Same quantity on one size across several products (e.g. a shipment)
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

export async function bulkRemoveProductsAction(
  ids: number[],
): Promise<ActionResult> {
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
