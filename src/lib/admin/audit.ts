import "server-only";
import { connectMongoose } from "@/lib/db/mongoose";
import { AuditLogModel } from "@/lib/db/models/audit-log";
import type { User } from "@/types";

export type AuditAction =
  | "role.promote"
  | "role.demote"
  | "customer.ban"
  | "customer.unban"
  | "customer.remove"
  | "order.status"
  | "banner.publish"
  | "coupon.active"
  | "product.price"
  | "product.remove"
  | "review.remove";

/** 📝 Fire-and-forget on purpose: a logging failure must never block the
 *  real mutation it's describing — callers `await` this for ordering, but a
 *  thrown error here is swallowed, not surfaced as the action's own error. */
export async function logAudit(entry: {
  actor: User;
  action: AuditAction;
  targetType: string;
  targetId: string;
  summary: string;
}): Promise<void> {
  try {
    await connectMongoose();
    await AuditLogModel.create({
      actorEmail: entry.actor.email,
      actorName: `${entry.actor.firstName} ${entry.actor.lastName ?? ""}`.trim(),
      action: entry.action,
      targetType: entry.targetType,
      targetId: entry.targetId,
      summary: entry.summary,
    });
  } catch {
    // 🤐 Never let an audit-log write fail the operation it's logging.
  }
}
