"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getDashboardData, type DashboardData } from "./data";

/** 🔄 Polled from `DashboardLanding` — KPIs, the latest-orders table, and
 *  the low-stock strip stay fresh without a manual reload. */
export async function getDashboardDataAction(): Promise<DashboardData> {
  const admin = await requireAdmin();
  if (!admin) return { orders: [], products: [], activeCustomers: 0 };
  return getDashboardData();
}
