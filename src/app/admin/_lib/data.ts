import { headers } from "next/headers";
import { adminAuth } from "@/lib/auth/admin-auth";
import { getAllOrders } from "@/lib/shop/orders";
import { getAllProducts } from "@/lib/shop/products";
import type { AdminOrder, Product } from "@/types";

export type DashboardData = {
  orders: AdminOrder[];
  products: Product[];
  activeCustomers: number;
};

export async function getDashboardData(): Promise<DashboardData> {
  const [orders, products, { users }] = await Promise.all([
    getAllOrders(),
    getAllProducts(),
    // 🔑 `adminAuth`, not the storefront `auth` — this call authorizes off
    // the admin-only cookie in these same request headers.
    adminAuth.api.listUsers({ headers: await headers(), query: { limit: 500 } }),
  ]);

  const activeCustomers = users.filter(
    (user) => user.role !== "admin" && !user.banned,
  ).length;

  return { orders, products, activeCustomers };
}
