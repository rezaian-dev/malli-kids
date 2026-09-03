import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminInventoryLanding } from "./_components/admin-inventory-landing";

export default async function AdminInventory() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminInventoryLanding />;
}
