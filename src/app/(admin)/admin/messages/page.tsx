import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminMessagesLanding } from "./_components/admin-messages-landing";

export default async function AdminMessages() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminMessagesLanding />;
}
