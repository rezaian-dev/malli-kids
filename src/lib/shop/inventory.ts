// 📦 Pure variant-stock helpers — no database import (mirrors
// `@/lib/shop/order-status`'s role), so both the server actions/data layer
// AND client components (the inventory table's status badges) can use the
// exact same math without pulling Mongoose into the browser bundle.

export type ProductVariant = {
  size: string;
  color?: string;
  stock: number;
};

/** 🪶 Below this, a variant is flagged "low stock" (but still sellable) —
 *  one shared threshold so "needs attention" means the same thing on the
 *  inventory table as it does on the dashboard's low-stock count. */
export const LOW_STOCK_THRESHOLD = 3;

export function totalVariantStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
}

/** 🔁 `Product.stock` stays a plain boolean for every existing consumer
 *  (shop filters, the PDP badge, the product card) — this is the one place
 *  that boolean gets computed from real variant stock instead of hand-set.
 *  A product with no variants yet (legacy, or deliberately unsized — an
 *  accessory) keeps using its own manually-set boolean untouched. */
export function deriveStock(variants: ProductVariant[], manualStock: boolean): boolean {
  if (!variants.length) return manualStock;
  return totalVariantStock(variants) > 0;
}

export type VariantStockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function variantStockStatus(stock: number): VariantStockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}
