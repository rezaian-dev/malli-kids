import { requireAdminPage } from "@/lib/auth/admin";
import { getDashboardData } from "./_lib/data";
import { DashboardLanding } from "./_components/dashboard-landing";

export default async function AdminHome() {
  const admin = await requireAdminPage();

  const data = await getDashboardData();

  return <DashboardLanding {...data} />;
}
