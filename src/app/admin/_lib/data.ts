import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
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
    auth.api.listUsers({ headers: await headers(), query: { limit: 500 } }),
  ]);

  const activeCustomers = users.filter(
    (user) => user.role !== "admin" && !user.banned,
  ).length;

  return { orders, products, activeCustomers };
}
