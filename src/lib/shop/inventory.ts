// 📦 Pure, no DB import — client components can share this math without pulling Mongoose into the bundle.

export type ProductVariant = {
  size: string;
  color?: string;
  stock: number;
};

// 🪶 Shared threshold so "needs attention" means the same thing on the table and the dashboard count.
const LOW_STOCK_THRESHOLD = 3;

function totalVariantStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
}

// 🔁 The one place stock gets computed from variants; unvaried products keep their manual boolean.
export function deriveStock(
  variants: ProductVariant[],
  manualStock: boolean,
): boolean {
  if (!variants.length) return manualStock;
  return totalVariantStock(variants) > 0;
}

export type VariantStockStatus = "in-stock" | "low-stock" | "out-of-stock";

export function variantStockStatus(stock: number): VariantStockStatus {
  if (stock <= 0) return "out-of-stock";
  if (stock <= LOW_STOCK_THRESHOLD) return "low-stock";
  return "in-stock";
}
