import type { Product } from "@/types";

// 🧱 One row per sellable unit — a variant-tracked product contributes one
// row per size/color, a legacy (unsized) product contributes a single row
// that falls back to its plain boolean `stock`. This is what makes the
// inventory table variant-aware instead of just re-listing products.
export type InventoryRow = {
  id: string;
  product: Product;
  size?: string;
  color?: string;
  stock?: number;
};

export function buildInventoryRows(products: Product[]): InventoryRow[] {
  return products.flatMap((product): InventoryRow[] => {
    if (!product.variants.length) {
      return [{ id: `${product.id}-legacy`, product }];
    }
    return product.variants.map((variant) => ({
      id: `${product.id}-${variant.size}-${variant.color ?? ""}`,
      product,
      size: variant.size,
      color: variant.color,
      stock: variant.stock,
    }));
  });
}
