import { requireAdminPage } from "@/lib/auth/admin";
import { getAllCustomers } from "./_lib/data";
import { AdminCustomersLanding } from "./_components/admin-customers-landing";

export default async function AdminCustomers() {
  const admin = await requireAdminPage();

  const customers = await getAllCustomers();

  return <AdminCustomersLanding customers={customers} />;
}
