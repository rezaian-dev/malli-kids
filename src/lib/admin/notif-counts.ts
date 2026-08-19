import { cache } from "react";
import { connectMongoose } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/order";
import { TicketModel } from "@/lib/db/models/ticket";
import { ReviewModel } from "@/lib/db/models/review";
import { ChatConversationModel } from "@/lib/db/models/chat";

export type AdminNotifCounts = {
  freshOrders: number;
  openTickets: number;
  openChats: number;
  pendingReviews: number;
};

/** 🔔 The four counts the admin header bell + sidebar badges show —
 *  computed once in `admin/layout.tsx` and threaded down as props instead
 *  of each component reading a client-side store. */
export const getAdminNotifCounts = cache(async (): Promise<AdminNotifCounts> => {
  await connectMongoose();
  const [freshOrders, openTickets, openChats, pendingReviews] =
    await Promise.all([
      OrderModel.countDocuments({ status: "جدید" }),
      TicketModel.countDocuments({ status: "open" }),
      ChatConversationModel.countDocuments({ status: "open" }),
      ReviewModel.countDocuments({ visible: false }),
    ]);

  return { freshOrders, openTickets, openChats, pendingReviews };
});
