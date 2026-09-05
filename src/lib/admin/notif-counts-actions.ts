"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getAdminNotifCounts, type AdminNotifCounts } from "./notif-counts";

const EMPTY_COUNTS: AdminNotifCounts = {
  freshOrders: 0,
  openTickets: 0,
  openChats: 0,
  pendingReviews: 0,
};

// 🔄 Polled from AdminShell to keep header/sidebar badges live.
export async function getAdminNotifCountsAction(): Promise<AdminNotifCounts> {
  const admin = await requireAdmin();
  if (!admin) return EMPTY_COUNTS;
  return getAdminNotifCounts();
}
