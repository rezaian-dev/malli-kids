import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🎫 Support tickets — the app's only "contact us" channel (see
// `/contact`: it points people at `/profile#support` instead of a form).
// Replaces the storefront's `lib/tickets.ts` localStorage list; shared by
// the profile "support" tab (owner) and `/admin/messages` (staff).
export type TicketStatus = "open" | "pending" | "answered" | "closed";
export type TicketCategory =
  "order" | "return" | "sizing" | "quality" | "other";
export type TicketPriority = "normal" | "high" | "urgent";
export type TicketReplyDoc = {
  from: "user" | "support";
  text: string;
  at: Date;
};

export type TicketDoc = {
  userId: string;
  name: string;
  subject: string;
  status: TicketStatus;
  category: TicketCategory;
  priority: TicketPriority;
  /** 🔢 Human-friendly serial (`#1001`) — assigned once at creation via
   *  the atomic `Counter` sequence; old rows predate it, so it's optional
   *  and the UI falls back to a short id for those. */
  number?: number;
  assigneeId?: string;
  assigneeName?: string;
  replies: TicketReplyDoc[];
  createdAt: Date;
  updatedAt: Date;
};

const ticketReplySchema = new Schema<TicketReplyDoc>(
  {
    from: { type: String, required: true, enum: ["user", "support"] },
    text: { type: String, required: true },
    at: { type: Date, required: true, default: Date.now },
  },
  { _id: false },
);

const ticketSchema = new Schema<TicketDoc>(
  {
    userId: { type: String, required: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    status: {
      type: String,
      required: true,
      enum: ["open", "pending", "answered", "closed"],
      default: "open",
    },
    // 🗂️ Optional-with-default (not `required`) so pre-existing rows stay
    // valid — `toTicket` fills the same defaults when they're missing.
    category: {
      type: String,
      enum: ["order", "return", "sizing", "quality", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["normal", "high", "urgent"],
      default: "normal",
    },
    number: { type: Number },
    assigneeId: { type: String },
    assigneeName: { type: String },
    replies: { type: [ticketReplySchema], default: [] },
  },
  { timestamps: true },
);

// 🔔 The sidebar badge's `countDocuments({ status: "open" })` + the
// assignee filter both deserve an index.
ticketSchema.index({ status: 1 });
ticketSchema.index({ assigneeId: 1 });
ticketSchema.index({ number: 1 }, { unique: true, sparse: true });

export const TicketModel: Model<TicketDoc> =
  (models.Ticket as Model<TicketDoc>) ||
  model<TicketDoc>("Ticket", ticketSchema);
