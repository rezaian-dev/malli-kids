import { requireAdminPage } from "@/lib/auth/admin";
import { getAllCollabRequests } from "@/lib/shop/collab";
import { AdminCollabLanding } from "./_components/admin-collab-landing";

export default async function AdminCollab() {
  const admin = await requireAdminPage();

  const requests = await getAllCollabRequests();

  return <AdminCollabLanding requests={requests} />;
}
