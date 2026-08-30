"use server";

import { getOrdersForUser } from "@/lib/shop/orders";
import type { AdminOrder } from "@/types";
import { requireUserId } from "./shared";

export async function getMyOrdersAction(): Promise<AdminOrder[]> {
  const userId = await requireUserId();
  if (!userId) return [];
  return getOrdersForUser(userId);
}
