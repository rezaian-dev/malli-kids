import { connectMongoose } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/lib/db/models/audit-log";
import { faDateTime } from "@/lib/locale/fa";

export type AuditEntry = {
  id: string;
  actorEmail: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  date: string;
};

const LIMIT = 200;

/** 🧾 Newest-first, capped — this is a small targeted trail (see
 *  `@/lib/admin/audit`), not a paged enterprise log, so one bounded read is
 *  enough. */
export async function getAuditLog(): Promise<AuditEntry[]> {
  await connectMongoose();
  const docs = await AuditLogModel.find()
    .sort({ createdAt: -1 })
    .limit(LIMIT)
    .lean();

  return docs.map((doc) => ({
    id: String(doc._id),
    actorEmail: doc.actorEmail,
    actorName: doc.actorName,
    action: doc.action,
    targetType: doc.targetType,
    targetId: doc.targetId,
    summary: doc.summary,
    date: faDateTime(doc.createdAt),
  }));
}
