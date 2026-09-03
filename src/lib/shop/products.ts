// 🛍️ Real product reads — shared by the storefront (shop, PDP, wishlist,
// sitemap) and the admin catalog/inventory screens. Writes live in
// `admin/products/_lib/actions.ts`; this module is read-only.

import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel, type ProductDoc } from "@/lib/db/models/product";
import type { Product } from "@/types";

function toProduct(doc: ProductDoc): Product {
  // 🖼️ `images` (any pre-existing document written before this field
  // existed still has the old single `img` string on it) — falls back to
  // that, never to a made-up placeholder.
  const legacyImg = (doc as unknown as { img?: string }).img;
  const images = doc.images?.length ? doc.images : legacyImg ? [legacyImg] : [];

  return {
    id: doc.id,
    img: images[0] ?? "",
    images,
    name: doc.name,
    cat: doc.cat,
    season: doc.season,
    price: doc.price,
    old: doc.old,
    disc: doc.disc,
    badge: doc.badge,
    rate: doc.rate,
    stock: doc.stock,
    sold: doc.sold,
    desc: doc.desc,
  };
}

/** 📚 Every product, newest first — the single source both the shop grid and
 *  the admin catalog/inventory tables filter/sort client-side. */
export async function getAllProducts(): Promise<Product[]> {
  await connectMongoose();
  const docs = await ProductModel.find().sort({ id: -1 }).lean();
  return docs.map(toProduct);
}

export async function getProductById(id: number): Promise<Product | null> {
  await connectMongoose();
  const doc = await ProductModel.findOne({ id }).lean();
  return doc ? toProduct(doc) : null;
}

/** 💛 Hydrates a locally-stored favorites id list into real product cards. */
export async function getProductsByIds(ids: number[]): Promise<Product[]> {
  if (!ids.length) return [];
  await connectMongoose();
  const docs = await ProductModel.find({ id: { $in: ids } }).lean();
  return docs.map(toProduct);
}

export async function getRelatedProducts(
  cat: string,
  excludeId: number,
  limit = 4,
): Promise<Product[]> {
  await connectMongoose();
  const docs = await ProductModel.find({ cat, id: { $ne: excludeId } })
    .limit(limit)
    .lean();
  return docs.map(toProduct);
}

/** 🔢 The next auto-assigned public id for a new product — mirrors the
 *  admin form's old client-side `Math.max(999, …) + 1` scheme, just computed
 *  server-side now that creation is a real action. */
export async function nextProductId(): Promise<number> {
  await connectMongoose();
  const top = await ProductModel.findOne().sort({ id: -1 }).lean();
  return Math.max(999, top?.id ?? 0) + 1;
}
