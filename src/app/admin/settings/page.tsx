import { requireAdminPage } from "@/lib/auth/admin";
import { getCampaign, getSupportHours } from "@/lib/shop/settings";
import { AdminSettingsLanding } from "./_components/admin-settings-landing";

export default async function AdminSettings() {
  await requireAdminPage();

  const [campaign, support] = await Promise.all([
    getCampaign(),
    getSupportHours(),
  ]);

  return <AdminSettingsLanding campaign={campaign} support={support} />;
}
