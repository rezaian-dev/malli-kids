import { requireAdminPage } from "@/lib/auth/admin";
import { getAllTickets } from "@/lib/shop/tickets";
import { getChatConversationsForAdmin } from "@/lib/shop/chat";
import { AdminMessagesLanding } from "./_components/admin-messages-landing";

export default async function AdminMessages() {
  await requireAdminPage();

  const [tickets, conversations] = await Promise.all([
    getAllTickets(),
    getChatConversationsForAdmin(),
  ]);

  return (
    <AdminMessagesLanding tickets={tickets} conversations={conversations} />
  );
}
