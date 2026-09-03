"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getAdminNotifCounts, type AdminNotifCounts } from "./notif-counts";

const EMPTY_COUNTS: AdminNotifCounts = {
  freshOrders: 0,
  openTickets: 0,
  pendingReviews: 0,
};

/** 🔄 Polled from `AdminShell` — the header bell + sidebar badges stay live
 *  as new orders/tickets/reviews arrive, without a manual reload. */
export async function getAdminNotifCountsAction(): Promise<AdminNotifCounts> {
  const admin = await requireAdmin();
  if (!admin) return EMPTY_COUNTS;
  return getAdminNotifCounts();
}
