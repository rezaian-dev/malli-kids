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
    pairsWith: doc.pairsWith ?? [],
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
    // 🛡️ A malformed route param (`parseProductRouteId` on a URL with no
    // leading number, e.g. a typo'd/garbage slug) hands this `NaN` — Mongo's
    // driver throws a `CastError` on that instead of just missing, which
    // would otherwise crash the page before its own `if (!product)
    // notFound()` ever runs. Treat it as "not found", same as any other id
    // with no matching product.
    if (!Number.isFinite(id)) return null;
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

/** 🧵 The admin-curated "complete the look" set for a product — resolves
 *  `pairsWith` ids to real, visible product cards and preserves the admin's
 *  chosen order (unlike `getProductsByIds`'s `$in` order, which Mongo
 *  doesn't guarantee). A product with no curated pairing (the common case)
 *  costs nothing beyond the empty-array check — no query at all. */
export async function getCompleteTheLook(pairIds: number[]): Promise<Product[]> {
  if (!pairIds.length) return [];
  const products = await getProductsByIds(pairIds);
  const byId = new Map(products.map((p) => [p.id, p]));
  return pairIds
    .map((id) => byId.get(id))
    .filter((p): p is Product => Boolean(p?.visible));
}

/** 🔢 The next auto-assigned public id for a new product — a durable,
 *  never-reused counter (own `counters` collection, keyed `"productId"`),
 *  not "current max + 1" off the live catalog.
 *
 *  🐛 That older scheme (`ProductModel.findOne().sort({id:-1}) + 1`) had two
 *  real bugs, confirmed live (not just in theory): (1) a race — two
 *  concurrent creates can both read the same "current max" and hand out the
 *  same id, which `id`'s unique index then rejects for whichever write
 *  loses; (2) id *reuse* — deleting the highest-id product and creating a
 *  new one shortly after reassigns that exact same id. (2) is the more
 *  dangerous one: `getProductById(id)` is `unstable_cache`-tagged by
 *  `PRODUCTS_TAG` and *should* invalidate on every create/update/delete via
 *  `revalidateCatalog()`, but a stale per-id cache entry for a reused id was
 *  reproduced live during Phase 8 QA — a brand-new product's edit page (and
 *  potentially its public PDP) briefly showing a *previous, deleted*
 *  product's data at that same numeric id. A `$inc` on a dedicated counter
 *  document is atomic (fixes the race) and monotonically increasing forever
 *  (an id is never handed out twice, so that stale-cache shape can't recur
 *  regardless of how the underlying cache invalidation behaves). Seeded
 *  from today's real max via `$max` so this drop-in change doesn't collide
 *  with ids already in the catalog. */
export async function nextProductId(): Promise<number> {
  const mongoose = await connectMongoose();
  const counters = mongoose.connection.collection<{ _id: string; seq: number }>(
    "counters",
  );

  const top = await ProductModel.findOne().sort({ id: -1 }).lean();
  const floor = Math.max(999, top?.id ?? 0);
  // 🌱 One-time (per id ever exceeding the counter's current value)
  // catch-up — a no-op once the counter has overtaken the live catalog's
  // own max, which it always will after its very first real use.
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
