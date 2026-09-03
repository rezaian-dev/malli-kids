import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { DashboardLanding } from "./_components/dashboard-landing";

export default async function AdminHome() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <DashboardLanding />;
}
