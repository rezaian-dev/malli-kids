"use server";

import { getHydratedProductsByIds, searchProductsPreview } from "./products";
import type { Product } from "@/types";

// Hydrates a client-only id list (favorites, cart) into real product cards.
// Rejects on infrastructure failure so callers can distinguish a genuinely
// missing product from a failed fetch (and offer retry instead of deletion).
export async function getProductsByIdsAction(ids: number[]): Promise<Product[]> {
  return getHydratedProductsByIds(ids);
}

// Backs the home search's live dropdown — real catalog, no static fixtures.
export async function searchProductsPreviewAction(query: string) {
  return searchProductsPreview(query);
}
