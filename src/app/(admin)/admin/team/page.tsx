import { requireAdminPage } from "@/lib/auth/admin";
import { getAllCustomers } from "../customers/_lib/data";
import { AdminTeamLanding } from "./_components/admin-team-landing";

export default async function AdminTeam() {
  await requireAdminPage();

  const customers = await getAllCustomers();

  return <AdminTeamLanding customers={customers} />;
}
