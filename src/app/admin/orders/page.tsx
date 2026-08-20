import { requireAdminPage } from "@/lib/auth/admin";
import { getAllOrders } from "@/lib/shop/orders";
import { AdminOrdersLanding } from "./_components/admin-orders-landing";

export default async function AdminOrders() {
  const admin = await requireAdminPage();

  const orders = await getAllOrders();

  return <AdminOrdersLanding orders={orders} />;
}
