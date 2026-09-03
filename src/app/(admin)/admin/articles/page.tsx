import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminArticlesLanding } from "./_components/admin-articles-landing";

export default async function AdminArticles() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminArticlesLanding />;
}
