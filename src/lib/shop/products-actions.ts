"use server";

import { getProductsByIds, searchProductsPreview } from "./products";
import type { Product } from "@/types";

// 💛 Hydrates a client-only id list (favorites, cart) into real product cards.
export async function getProductsByIdsAction(ids: number[]): Promise<Product[]> {
  return getProductsByIds(ids);
}

// 🔎 Backs the home search's live dropdown — real catalog, no static fixtures.
export async function searchProductsPreviewAction(query: string) {
  return searchProductsPreview(query);
}
