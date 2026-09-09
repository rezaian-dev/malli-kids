// 🛍️ Shared reads for storefront and admin; writes live in admin/products/_lib/actions.ts.

import { unstable_cache } from "next/cache";
import { REVALIDATE } from "@/lib/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel, type ProductDoc } from "@/lib/db/models/product";
import type { Product } from "@/types";

// 🧊 Cached like getActiveBanner; admin writes revalidate this tag, the 60s window is just a safety net.
export const PRODUCTS_TAG = "products";

function toProduct(doc: ProductDoc): Product {
  // 🖼️ Falls back to the legacy single img string on old documents, never to a made-up placeholder.
  const legacyImg = (doc as unknown as { img?: string }).img;
  const images = doc.images?.length ? doc.images : legacyImg ? [legacyImg] : [];

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
    // 🪶 ?? [] treats a pre-existing document (no variants key) as legacy/unsized instead of crashing consumers.
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

// 📚 Single source both the shop grid and admin tables filter/sort client-side. Build-safe.
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    try {
      await connectMongoose();
      const docs = await ProductModel.find().sort({ id: -1 }).lean();
      return docs.map(toProduct);
    } catch (err) {
      console.warn(
        "[products] getAllProducts failed — returning empty (build without DB):",
        (err as Error).message,
      );
      return [];
    }
  },
  ["all-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

export const getProductById = unstable_cache(
  async (id: number): Promise<Product | null> => {
    // 🛡️ A malformed route param can hand this NaN, which Mongo would throw a CastError on — treat it as not found.
    if (!Number.isFinite(id)) return null;
    try {
      await connectMongoose();
      const doc = await ProductModel.findOne({ id }).lean();
      return doc ? toProduct(doc) : null;
    } catch (err) {
      console.warn(
        `[products] getProductById(${id}) failed — returning null:`,
        (err as Error).message,
      );
      return null;
    }
  },
  ["product-by-id"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

/** 💛 Hydrates a locally-stored favorites id list into real product cards. Build-safe. */
export const getProductsByIds = unstable_cache(
  async (ids: number[]): Promise<Product[]> => {
    if (!ids.length) return [];
    try {
      await connectMongoose();
      const docs = await ProductModel.find({ id: { $in: ids } }).lean();
      return docs.map(toProduct);
    } catch (err) {
      console.warn(
        "[products] getProductsByIds failed — returning empty:",
        (err as Error).message,
      );
      return [];
    }
  },
  ["products-by-ids"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

export const getRelatedProducts = unstable_cache(
  async (cat: string, excludeId: number, limit = 4): Promise<Product[]> => {
    try {
      await connectMongoose();
      const docs = await ProductModel.find({ cat, id: { $ne: excludeId } })
        .limit(limit)
        .lean();
      return docs.map(toProduct);
    } catch (err) {
      console.warn(
        "[products] getRelatedProducts failed — returning empty:",
        (err as Error).message,
      );
      return [];
    }
  },
  ["related-products"],
  { tags: [PRODUCTS_TAG], revalidate: REVALIDATE.catalog },
);

// 🧵 Preserves the admin's chosen pairing order, unlike getProductsByIds's unguaranteed $in order.
export async function getCompleteTheLook(pairIds: number[]): Promise<Product[]> {
  if (!pairIds.length) return [];
  const products = await getProductsByIds(pairIds);
  const byId = new Map(products.map((p) => [p.id, p]));
  return pairIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p?.visible));
}

// 🔎 Live, tiny lookup for the home search's type-ahead dropdown — a direct
// query rather than unstable_cache since the term varies on every keystroke.
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
      .lean();

    return docs.map((doc) => ({
      id: doc.id,
      img: doc.images?.[0] ?? (doc as unknown as { img?: string }).img ?? "",
      name: doc.name,
      cat: doc.cat,
      price: doc.price,
    }));
  } catch (err) {
    console.warn(
      "[products] searchProductsPreview failed — returning empty:",
      (err as Error).message,
    );
    return [];
  }
}

// 🔢 Atomic $inc on a monotonic counter — max+1 races and reuses ids after
// deletes, which can serve a deleted product's stale cache
export async function nextProductId(): Promise<number> {
  const mongoose = await connectMongoose();
  const counters = mongoose.connection.collection<{ _id: string; seq: number }>(
    "counters",
  );

  const top = await ProductModel.findOne().sort({ id: -1 }).lean();
  const floor = Math.max(999, top?.id ?? 0);
  // 🌱 One-time catch-up; a no-op once the counter has overtaken the catalog's own max.
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
