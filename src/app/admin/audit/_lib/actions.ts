"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getAuditLog, type AuditEntry } from "./data";

export async function getAuditLogAction(): Promise<AuditEntry[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAuditLog();
}
