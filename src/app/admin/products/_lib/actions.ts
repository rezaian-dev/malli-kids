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
// The UI bulk-selects visible rows (dozens); reject oversized payloads outright.
const MAX_BULK_ITEMS = 200;
const TOO_MANY_ERROR = "تعداد موارد انتخاب‌شده بیش از حد مجاز است.";
// Parity with productSchema — variant quantities above this are data entry errors.
const MAX_VARIANT_STOCK = 100_000;

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

// Legacy boolean toggle — still the whole story for variant-less products.
// For sized products the boolean stays derived: a manual flag that disagrees
// with the variants would desynchronize availability, so recompute instead.
export async function setProductStockAction(
  id: number,
  stock: boolean,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    await connectMongoose();
    const doc = await ProductModel.findOne({ id })
      .select("variants stock")
      .lean();
    if (!doc) return { ok: false, error: "محصول پیدا نشد." };
    const next =
      doc.variants.length > 0 ? deriveStock(doc.variants, doc.stock) : stock;
    await ProductModel.updateOne({ id }, { $set: { stock: next } });
    revalidateCatalog();
    if (next) await notifyBackInStock(id);
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
  if (!Number.isInteger(stock) || stock < 0 || stock > MAX_VARIANT_STOCK)
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

    // Recompute from live variants — deriving from the just-read document
    // could clobber a purchase that lands between the two writes.
    await ProductModel.updateOne(
      { id },
      [{ $set: { stock: { $gt: [{ $sum: "$variants.stock" }, 0] } } }],
      { updatePipeline: true },
    );

    revalidateCatalog();
    if (stock > 0) await notifyBackInStock(id, size);
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

// Same quantity on one size across several products (e.g. a shipment).
// All-or-nothing on malformed entries: a silent skip would leave the admin
// believing every row applied.
export async function bulkSetVariantStockAction(
  updates: { id: number; size: string; stock: number }[],
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };
  if (!updates.length) return { ok: true };
  if (updates.length > MAX_BULK_ITEMS)
    return { ok: false, error: TOO_MANY_ERROR };
  const malformed = updates.some(
    (update) =>
      !Number.isInteger(update.id) ||
      typeof update.size !== "string" ||
      update.size.trim().length < 1 ||
      update.size.trim().length > 20 ||
      !Number.isInteger(update.stock) ||
      update.stock < 0 ||
      update.stock > MAX_VARIANT_STOCK,
  );
  if (malformed) return { ok: false, error: FALLBACK_ERROR };

  try {
    await connectMongoose();
    for (const { id, size, stock } of updates) {
      // Stored sizes are trimmed at write time — match on the trimmed key.
      const sizeKey = size.trim();
      const updated = await ProductModel.findOneAndUpdate(
        { id, "variants.size": sizeKey },
        { $set: { "variants.$.stock": stock } },
        { new: true },
      );
      if (updated) {
        // Recompute from live variants (see setVariantStockAction).
        await ProductModel.updateOne(
          { id },
          [{ $set: { stock: { $gt: [{ $sum: "$variants.stock" }, 0] } } }],
          { updatePipeline: true },
        );
        if (stock > 0) await notifyBackInStock(id, sizeKey);
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
  if (ids.length > MAX_BULK_ITEMS) return { ok: false, error: TOO_MANY_ERROR };
  if (ids.some((id) => !Number.isInteger(id)))
    return { ok: false, error: FALLBACK_ERROR };

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
  if (ids.length > MAX_BULK_ITEMS) return { ok: false, error: TOO_MANY_ERROR };
  if (ids.some((id) => !Number.isInteger(id)))
    return { ok: false, error: FALLBACK_ERROR };

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
  if (ids.length > MAX_BULK_ITEMS) return { ok: false, error: TOO_MANY_ERROR };
  if (ids.some((id) => !Number.isInteger(id)))
    return { ok: false, error: FALLBACK_ERROR };

  try {
    await connectMongoose();
    const removed = await ProductModel.deleteMany({ id: { $in: ids } });
    revalidateCatalog();
    await logAudit({
      actor: admin,
      action: "product.remove",
      targetType: "product",
      targetId: ids.join(","),
      summary: `${removed.deletedCount} محصول به‌صورت گروهی حذف شد`,
    });
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
