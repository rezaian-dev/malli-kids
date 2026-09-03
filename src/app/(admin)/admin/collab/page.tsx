import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminCollabLanding } from "./_components/admin-collab-landing";

export default async function AdminCollab() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminCollabLanding />;
}
