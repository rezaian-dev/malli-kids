import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminOrdersLanding } from "./_components/admin-orders-landing";

export default async function AdminOrders() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminOrdersLanding />;
}
