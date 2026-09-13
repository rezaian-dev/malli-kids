import type { Product } from "@/types";

// One row per sellable unit — per variant, or one for legacy unsized
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
