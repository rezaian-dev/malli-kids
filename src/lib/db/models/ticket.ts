import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 🎫 Support tickets — the app's only "contact us" channel (see
// `/contact`: it points people at `/profile#support` instead of a form).
// Replaces the storefront's `lib/tickets.ts` localStorage list; shared by
// the profile "support" tab (owner) and `/admin/messages` (staff).
export type TicketStatus = "open" | "answered" | "closed";
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
  replies: TicketReplyDoc[];
  createdAt: Date;
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
      enum: ["open", "answered", "closed"],
      default: "open",
    },
    replies: { type: [ticketReplySchema], default: [] },
  },
  { timestamps: true },
);

export const TicketModel: Model<TicketDoc> =
  (models.Ticket as Model<TicketDoc>) ||
  model<TicketDoc>("Ticket", ticketSchema);
