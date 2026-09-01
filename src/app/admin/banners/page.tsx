import { requireAdminPage } from "@/lib/auth/admin";
import { getAllBanners } from "./_lib/data";
import { AdminBannersLanding } from "./_components/admin-banners-landing";

export default async function AdminBanners() {
  const admin = await requireAdminPage();

  const banners = await getAllBanners();

  return <AdminBannersLanding banners={banners} />;
}
