import { requireAdminPage } from "@/lib/auth/admin";
import { getAuditLog } from "./_lib/data";
import { AdminAuditLanding } from "./_components/admin-audit-landing";

export default async function AdminAudit() {
  await requireAdminPage();

  const entries = await getAuditLog();

  return <AdminAuditLanding entries={entries} />;
}
