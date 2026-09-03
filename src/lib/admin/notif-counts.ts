import { connectMongoose } from "@/lib/db/mongoose";
import { OrderModel } from "@/lib/db/models/order";
import { TicketModel } from "@/lib/db/models/ticket";
import { ReviewModel } from "@/lib/db/models/review";

export type AdminNotifCounts = {
  freshOrders: number;
  openTickets: number;
  pendingReviews: number;
};

/** 🔔 The three counts the admin header bell + sidebar badges show —
 *  computed once in `admin/layout.tsx` and threaded down as props instead
 *  of each component reading a client-side store. */
export async function getAdminNotifCounts(): Promise<AdminNotifCounts> {
  await connectMongoose();
  const [freshOrders, openTickets, pendingReviews] = await Promise.all([
    OrderModel.countDocuments({ status: "جدید" }),
    TicketModel.countDocuments({ status: "open" }),
    ReviewModel.countDocuments({ visible: false }),
  ]);

  return { freshOrders, openTickets, pendingReviews };
}
