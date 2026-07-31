import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🧾 A small, targeted audit trail — only for the sensitive operations
// section 16 of the ops spec actually names (role changes, price changes,
// campaign publication, order state changes, destructive deletes). Not a
// generic enterprise event log: no schema for "every mutation ever", no
// retention policy, no export — just enough to answer "who did this, and
// when" for the handful of actions where that actually matters.
export type AuditLogDoc = {
  actorEmail: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  summary: string;
  createdAt: Date;
};

const auditLogSchema = new Schema<AuditLogDoc>(
  {
    actorEmail: { type: String, required: true },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
);

auditLogSchema.index({ createdAt: -1 });

export const AuditLogModel: Model<AuditLogDoc> =
  (models.AuditLog as Model<AuditLogDoc>) ||
  model<AuditLogDoc>("AuditLog", auditLogSchema);
