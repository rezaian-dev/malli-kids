import { connectMongoose } from "@/lib/db/mongoose";
import { BackInStockModel } from "@/lib/db/models/back-in-stock";
import { ProductModel } from "@/lib/db/models/product";
import { createNotification } from "@/lib/shop/notifications";

// 🔔 size is normalized to "" for a legacy/unsized product (the whole product, not one variant).

function normalizeSize(size?: string): string {
  return size ?? "";
}

// 📋 Lets the PDP render "🔔 مشترک شدید" instead of offering to subscribe twice.
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

// 🙋 Upsert: resubmitting the same (user, product, size) is a no-op, not a duplicate-key error.
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

// 📣 One-shot: a matched request is deleted once notified, so shoppers must ask again next time.
// 🤐 Fire-and-forget — a failure here must never turn a successful restock into a reported failure.
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
    // 🤐 Never let this fail the real stock mutation.
  }
}
