"use server";

import { getProductsByIds } from "./products";
import type { Product } from "@/types";

/** 💛 Hydrates a client-only id list (favorites, cart) into real product
 *  cards — shared by every client component that needs that, sitewide. */
export async function getProductsByIdsAction(ids: number[]): Promise<Product[]> {
  return getProductsByIds(ids);
}
