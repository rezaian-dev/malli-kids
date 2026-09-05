import { connectMongoose } from "@/lib/db/mongoose";
import { BackInStockModel } from "@/lib/db/models/back-in-stock";
import { ProductModel } from "@/lib/db/models/product";
import { createNotification } from "@/lib/shop/notifications";

// 🔔 Real back-in-stock subscriptions — replaces the old PDP toast that just
// *said* "به محض موجود شدن خبرتان می‌کنیم" without ever storing that promise
// anywhere. `size` is normalized to `""` for a legacy/unsized product (the
// whole product, not one variant) — see `BackInStockDoc`.

function normalizeSize(size?: string): string {
  return size ?? "";
}

/** 📋 Every size (or `""` for "the whole product") this user already has a
 *  pending request for — the PDP uses this to render "🔔 مشترک شدید" instead
 *  of offering to subscribe twice. */
export async function getSubscribedSizes(
  userId: string,
  productId: number,
): Promise<string[]> {
  await connectMongoose();
  const docs = await BackInStockModel.find({ userId, productId })
    .select("size")
    .lean();
  return docs.map((d) => d.size);
}

/** 🙋 Upsert-style subscribe — resubmitting the same (user, product, size)
 *  is a harmless no-op, not a duplicate-key error, thanks to the unique
 *  index doubling as the real dedupe guard. */
export async function requestBackInStock(
  userId: string,
  productId: number,
  size?: string,
): Promise<void> {
  await connectMongoose();
  await BackInStockModel.updateOne(
    { userId, productId, size: normalizeSize(size) },
    { $setOnInsert: { userId, productId, size: normalizeSize(size) } },
    { upsert: true },
  );
}

/** 📣 The fulfillment half — called from every admin/order path that can
 *  raise a product's (or one variant's) stock above zero. Cheap no-op when
 *  nobody is waiting (the common case): one indexed query, nothing else.
 *  One-shot by design — a matched request is deleted once notified, so a
 *  shopper who wants to hear about the *next* time it sells out has to ask
 *  again, same as most retail "notify me" features.
 *
 *  🤐 Fire-and-forget on purpose, same as `logAudit` — this is a side
 *  effect of a stock change, not the change itself. A thrown error here
 *  (a bad connection, a schema mismatch) must never turn an otherwise-
 *  successful product save/restock into a reported failure. */
export async function notifyBackInStock(
  productId: number,
  size?: string,
): Promise<void> {
  try {
    await connectMongoose();
    const normalizedSize = normalizeSize(size);
    const pending = await BackInStockModel.find({
      productId,
      size: normalizedSize,
    }).lean();
    if (!pending.length) return;

    const product = await ProductModel.findOne({ id: productId })
      .select("name")
      .lean();
    if (!product) return;

    const sizeSuffix = normalizedSize ? ` (سایز ${normalizedSize})` : "";
    await Promise.all(
      pending.map((req) =>
        createNotification({
          userId: req.userId,
          kind: "restock",
          text: `«${product.name}»${sizeSuffix} دوباره موجود شد! 🎉`,
        }),
      ),
    );

    await BackInStockModel.deleteMany({ productId, size: normalizedSize });
  } catch {
    // 🤐 See the doc comment above — never let this fail the real mutation.
  }
}
