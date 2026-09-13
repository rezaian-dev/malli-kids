// Keep stock math free of database imports for client use.

export type ProductVariant = {
  size: string;
  color?: string;
  stock: number;
};

const LOW_STOCK_THRESHOLD = 3;

function totalVariantStock(variants: ProductVariant[]): number {
  return variants.reduce((sum, variant) => sum + Math.max(0, variant.stock), 0);
}

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
