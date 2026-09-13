"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getDashboardData, type DashboardData } from "./data";

export async function getDashboardDataAction(): Promise<DashboardData> {
  const admin = await requireAdmin();
  if (!admin) return { orders: [], products: [], activeCustomers: 0 };
  return getDashboardData();
}
