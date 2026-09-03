"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { connectMongoose } from "@/lib/db/mongoose";
import { ProductModel } from "@/lib/db/models/product";
import { nextProductId } from "@/lib/shop/products";
import type { ActionResult } from "@/lib/action-result";
import { productSchema, type ProductValues } from "./schemas";

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";
const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";

function revalidateCatalog() {
  revalidatePath("/admin/products");
  revalidatePath("/admin/inventory");
  revalidatePath("/admin");
  revalidatePath("/shop");
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
    await ProductModel.create({ ...parsed.data, id, rate: 4.8, sold: 0 });
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
    const updated = await ProductModel.findOneAndUpdate(
      { id },
      { $set: parsed.data },
    );
    if (!updated) return { ok: false, error: "محصول پیدا نشد." };

    revalidateCatalog();
    revalidatePath(`/admin/products/${id}/edit`);
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
    await ProductModel.deleteOne({ id });
    revalidateCatalog();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

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
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
