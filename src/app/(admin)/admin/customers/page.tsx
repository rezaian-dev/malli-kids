import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminCustomersLanding } from "./_components/admin-customers-landing";

export default async function AdminCustomers() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminCustomersLanding />;
}
