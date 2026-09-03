import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth/admin";
import { AdminBannersLanding } from "./_components/admin-banners-landing";

export default async function AdminBanners() {
  const admin = await requireAdmin();
  if (!admin) redirect("/admin/login");

  return <AdminBannersLanding />;
}
