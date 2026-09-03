import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminProductsLanding } from "./_components/admin-products-landing";

export default async function AdminProducts() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminProductsLanding />;
}
