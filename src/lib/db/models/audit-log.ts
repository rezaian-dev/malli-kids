import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🧾 Targeted audit trail for sensitive ops only (role/price/campaign/order changes) — not a generic event log.
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
