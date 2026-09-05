// 🛍️ Real product reads — shared by the storefront (shop, PDP, wishlist,
// sitemap) and the admin catalog/inventory screens. Writes live in
// `admin/products/_lib/actions.ts`; this module is read-only.

import { unstable_cache } from "next/cache";
import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel, type ProductDoc } from "@/lib/db/models/product";
import type { Product } from "@/types";

// 🧊 The catalog is public and identical for every visitor, so it's cached
// (not queried fresh per request) — same `unstable_cache` tag-and-time
// pattern as `getActiveBanner` (see `@/lib/shop/banners`). Every admin write
// (`admin/products/_lib/actions.ts`) revalidates this tag on demand; the
// 1-hour `revalidate` is just a safety net, not the primary invalidation
// path. `nextProductId` below stays uncached on purpose — it hands out the
// next id for a brand-new product and must always see the real current max.
export const PRODUCTS_TAG = "products";

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
    // 🪶 A document written before this field existed simply doesn't have
    // the key on read — `?? []` treats it as "legacy, unsized" rather than
    // crashing every consumer that does `product.variants.map(...)`.
    variants: doc.variants ?? [],
    sold: doc.sold,
    desc: doc.desc,
    seoTitle: doc.seoTitle,
    seoDescription: doc.seoDescription,
    visible: doc.visible ?? true,
    featured: doc.featured ?? false,
    updatedAt: doc.updatedAt?.toISOString(),
  };
}

/** 📚 Every product, newest first — the single source both the shop grid and
 *  the admin catalog/inventory tables filter/sort client-side. */
export const getAllProducts = unstable_cache(
  async (): Promise<Product[]> => {
    await connectMongoose();
    const docs = await ProductModel.find().sort({ id: -1 }).lean();
    return docs.map(toProduct);
  },
  ["all-products"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

export const getProductById = unstable_cache(
  async (id: number): Promise<Product | null> => {
    await connectMongoose();
    const doc = await ProductModel.findOne({ id }).lean();
    return doc ? toProduct(doc) : null;
  },
  ["product-by-id"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

/** 💛 Hydrates a locally-stored favorites id list into real product cards. */
export const getProductsByIds = unstable_cache(
  async (ids: number[]): Promise<Product[]> => {
    if (!ids.length) return [];
    await connectMongoose();
    const docs = await ProductModel.find({ id: { $in: ids } }).lean();
    return docs.map(toProduct);
  },
  ["products-by-ids"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

export const getRelatedProducts = unstable_cache(
  async (cat: string, excludeId: number, limit = 4): Promise<Product[]> => {
    await connectMongoose();
    const docs = await ProductModel.find({ cat, id: { $ne: excludeId } })
      .limit(limit)
      .lean();
    return docs.map(toProduct);
  },
  ["related-products"],
  { tags: [PRODUCTS_TAG], revalidate: 3600 },
);

/** 🔢 The next auto-assigned public id for a new product — mirrors the
 *  admin form's old client-side `Math.max(999, …) + 1` scheme, just computed
 *  server-side now that creation is a real action. */
export async function nextProductId(): Promise<number> {
  await connectMongoose();
  const top = await ProductModel.findOne().sort({ id: -1 }).lean();
  return Math.max(999, top?.id ?? 0) + 1;
}
