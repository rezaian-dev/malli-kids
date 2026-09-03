import { requireAdminPage } from "@/lib/auth/admin";
import { getAllTickets } from "@/lib/shop/tickets";
import { AdminMessagesLanding } from "./_components/admin-messages-landing";

export default async function AdminMessages() {
  const admin = await requireAdminPage();

  const tickets = await getAllTickets();

  return <AdminMessagesLanding tickets={tickets} />;
}
