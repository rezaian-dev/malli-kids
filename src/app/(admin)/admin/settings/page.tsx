import { requireAdminPage } from "@/lib/auth/admin";
import { getCampaign } from "@/lib/shop/settings";
import { AdminSettingsLanding } from "./_components/admin-settings-landing";

export default async function AdminSettings() {
  await requireAdminPage();

  const campaign = await getCampaign();

  return <AdminSettingsLanding campaign={campaign} />;
}
