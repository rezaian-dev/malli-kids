"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getAuditLog, type AuditEntry } from "./data";

/** 🔄 Polled from `AdminAuditLanding` — the log is append-only and written
 *  by every other admin page, so a live tail is the whole point of it. */
export async function getAuditLogAction(): Promise<AuditEntry[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAuditLog();
}
