// Shared reads for storefront and admin; writes live in admin/products/_lib/actions.ts.

import { unstable_cache } from "next/cache";
import { errorMessage } from "@/lib/action-result";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel, type ProductDoc } from "@/lib/db/models/product";
import type { Product } from "@/types";

// Invalidate on admin edits; the time limit is a fallback.
export const PRODUCTS_TAG = "products";

type ProductRow = ProductDoc & { img?: string };

function toProduct(doc: ProductRow): Product {
  // Support the legacy single-image field.
  const images = doc.images?.length ? doc.images : doc.img ? [doc.img] : [];

  return {
    id: doc.id,
    img: images[0] ?? "",
    images,
    name: doc.name,
    cat: doc.cat,
    gender: doc.gender,
    ageRange: doc.ageRange,
    slug: doc.slug,
    season: doc.season,
    price: doc.price,
    old: doc.old,
    disc: doc.disc,
    badge: doc.badge,
    rate: doc.rate,
    stock: doc.stock,
    // Treat missing variants as a legacy unsized product.
    variants: doc.variants ?? [],
    sold: doc.sold,
    desc: doc.desc,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    visible: doc.visible ?? true,
    featured: doc.featured ?? false,
    pairsWith: doc.pairsWith ?? [],
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

// Single source both the shop grid and admin tables filter/sort client-side. Build-safe.
async function readProducts(
  query: () => PromiseLike<ProductRow[]>,
  operation: string,
): Promise<Product[]> {
  try {
    await connectMongoose();
    return (await query()).map(toProduct);
  } catch (error) {
    console.warn(
      `[products] ${operation} failed:`,
      error instanceof Error ? error.name : "unknown",
    );
    return [];
  }
}

export const getAllProducts = unstable_cache(
  () => readProducts(() => ProductModel.find().sort({ id: -1 }).lean(), "getAllProducts"),
  ["all-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

export const getProductById = unstable_cache(
  async (id: number): Promise<Product | null> => {
    // Treat invalid numeric IDs as missing products.
    if (!Number.isFinite(id)) return null;
    try {
      await connectMongoose();
      const doc = await ProductModel.findOne({ id }).lean();
      return doc ? toProduct(doc) : null;
    } catch (err) {
      console.warn(
        `[products] getProductById(${id}) failed — returning null:`,
        errorMessage(err),
      );
      return null;
    }
  },
  ["product-by-id"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

/** Hydrates a locally-stored favorites id list into real product cards. Build-safe. */
export const getProductsByIds = unstable_cache(
  async (ids: number[]): Promise<Product[]> => {
    if (!ids.length) return [];
    return readProducts(
      () => ProductModel.find({ id: { $in: ids } }).lean(),
      "getProductsByIds",
    );
  },
  ["products-by-ids"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

// Hydrates client-held id lists (cart, wishlist). Unlike readProducts, an
// infrastructure failure rejects instead of resolving [] — callers must be able
// to tell "product gone" from "fetch failed". Rejections are never cached, so a
// retry can succeed; successful reads cache like the rest of the catalog.
export const getHydratedProductsByIds = unstable_cache(
  async (ids: number[]): Promise<Product[]> => {
    if (!ids.length) return [];
    await connectMongoose();
    return (await ProductModel.find({ id: { $in: ids } }).lean()).map(toProduct);
  },
  ["hydrated-products-by-ids"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

export const getRelatedProducts = unstable_cache(
  (cat: string, excludeId: number, limit = 4) =>
    readProducts(
      () =>
        ProductModel.find({ cat, id: { $ne: excludeId } })
          .limit(limit)
          .lean(),
      "getRelatedProducts",
    ),
  ["related-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

// Restore the chosen pairing order after the unordered database query.
export async function getCompleteTheLook(pairIds: number[]): Promise<Product[]> {
  if (!pairIds.length) return [];
  const products = await getProductsByIds(pairIds);
  const byId = new Map(products.map((p) => [p.id, p]));
  return pairIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p?.visible));
}

// Do not cache each type-ahead search term.
export async function searchProductsPreview(
  query: string,
  limit = 5,
): Promise<Pick<Product, "id" | "img" | "name" | "cat" | "price">[]> {
  const q = query.trim();
  if (!q) return [];

  try {
    await connectMongoose();
    const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    const docs = await ProductModel.find({
      visible: true,
      $or: [{ name: rx }, { cat: rx }],
    })
      .limit(limit)
      .select("id img images name cat price")
      .lean<Pick<ProductRow, "id" | "images" | "img" | "name" | "cat" | "price">[]>();

    return docs.map((doc) => ({
      id: doc.id,
      img: doc.images?.[0] ?? doc.img ?? "",
      name: doc.name,
      cat: doc.cat,
      price: doc.price,
    }));
  } catch (err) {
    console.warn(
      "[products] searchProductsPreview failed — returning empty:",
      errorMessage(err),
    );
    return [];
  }
}

// Allocate IDs atomically and never reuse deleted product IDs.
export async function nextProductId(): Promise<number> {
  const mongoose = await connectMongoose();
  const counters = mongoose.connection.collection<{ _id: string; seq: number }>(
    "counters",
  );

  const top = await ProductModel.findOne().sort({ id: -1 }).lean();
  const floor = Math.max(999, top?.id ?? 0);
  // One-time catch-up; a no-op once the counter has overtaken the catalog's own max.
  await counters.updateOne(
    { _id: "productId" },
    { $max: { seq: floor } },
    { upsert: true },
  );

  const result = await counters.findOneAndUpdate(
    { _id: "productId" },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" },
  );
  return result!.seq;
}
