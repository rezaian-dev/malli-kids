import "server-only";
import { Schema, model, models, type Model } from "mongoose";

// 💬 Live-chat conversations — deliberately NOT folded into `ticket.ts`:
// a ticket is a subject-first async thread with embedded replies and no
// read state; a chat is a realtime back-and-forth with per-side unread
// counts. Forcing them into one model would contort both. MongoDB is the
// source of truth here (customer, conversation, messages, status, read
// state); the polling transport (`usePolling`) only delivers what is
// already persisted.
export type ChatStatus = "open" | "active" | "closed";
export type ChatSenderRole = "customer" | "admin";

export type ConversationDoc = {
  customerId: string;
  customerName: string;
  assignedAdminId?: string;
  status: ChatStatus;
  lastMessageAt: Date;
  lastMessagePreview: string;
  customerUnreadCount: number;
  adminUnreadCount: number;
  // ⌨️ Typing heartbeats — fresh (< 6s) means "…در حال نوشتن" on the
  // other side; sending clears, silence expires. Optional so old rows
  // stay valid.
  customerTypingAt?: Date;
  adminTypingAt?: Date;
  // ⭐ Post-close rating, customer-given.
  rating?: number;
  ratingNote?: string;
  ratedAt?: Date;
  // 🎫 Escalation link — set once when the chat becomes a ticket.
  escalatedTicketId?: string;
  escalatedTicketNumber?: number;
  page?: string;
  createdAt: Date;
  updatedAt: Date;
};

const conversationSchema = new Schema<ConversationDoc>(
  {
    customerId: { type: String, required: true },
    // 📛 Snapshot of the customer's name at creation — avoids a join to
    // the `user` collection every time the admin inbox lists conversations.
    customerName: { type: String, required: true },
    // First admin to reply auto-claims the thread (see `chat.ts`); there
    // is no manual assignment UI in the MVP — this field just records it.
    assignedAdminId: { type: String },
    status: {
      type: String,
      required: true,
      enum: ["open", "active", "closed"],
      default: "open",
    },
    lastMessageAt: { type: Date, required: true, default: Date.now },
    // 📝 Not `required` — mongoose's required-check rejects the `""` a
    // brand-new conversation legitimately starts with.
    lastMessagePreview: { type: String, default: "" },
    customerUnreadCount: { type: Number, required: true, default: 0 },
    adminUnreadCount: { type: Number, required: true, default: 0 },
    customerTypingAt: { type: Date },
    adminTypingAt: { type: Date },
    rating: { type: Number, min: 1, max: 5 },
    ratingNote: { type: String },
    ratedAt: { type: Date },
    escalatedTicketId: { type: String },
    escalatedTicketNumber: { type: Number },
    // 🧭 Where the chat started (a storefront path like `/product/…`) —
    // context only, never page state.
    page: { type: String },
  },
  { timestamps: true },
);

// 🗂️ The two query patterns that need help: a customer's own thread(s)
// (`customerId`, above) and the admin inbox's newest-activity-first list.
conversationSchema.index({ lastMessageAt: -1 });
// 🛡️ One live thread per customer, enforced by the database — two tabs
// sending the first message in the same millisecond still end up in one
// conversation (the loser's insert throws, it re-reads the winner's).
conversationSchema.index(
  { customerId: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $in: ["open", "active"] } },
  },
);

export const ChatConversationModel: Model<ConversationDoc> =
  (models.ChatConversation as Model<ConversationDoc>) ||
  model<ConversationDoc>("ChatConversation", conversationSchema);

export type ChatMessageDoc = {
  conversationId: string;
  senderId: string;
  senderRole: ChatSenderRole;
  body: string;
  clientId: string;
  readAt?: Date;
  createdAt: Date;
  updatedAt: Date;
};

const chatMessageSchema = new Schema<ChatMessageDoc>(
  {
    // 🔗 Plain string like every other `*Id` in this app (`Ticket.userId`,
    // `Notification.userId`, …) — the conversation's `_id` stringified.
    conversationId: { type: String, required: true },
    // 🔐 Always derived server-side from the real session — never trusted
    // from the client (see `chat-actions.ts`).
    senderId: { type: String, required: true },
    senderRole: { type: String, required: true, enum: ["customer", "admin"] },
    body: { type: String, required: true },
    // 🔁 Client-generated UUID per send attempt — a retry/double-click
    // replays the same `clientId`, and the unique index below turns the
    // second insert into a "return the existing message" instead of a
    // duplicate row.
    clientId: { type: String, required: true },
    readAt: { type: Date },
  },
  { timestamps: true },
);

chatMessageSchema.index({ conversationId: 1, createdAt: 1 });
chatMessageSchema.index({ conversationId: 1, clientId: 1 }, { unique: true });

export const ChatMessageModel: Model<ChatMessageDoc> =
  (models.ChatMessage as Model<ChatMessageDoc>) ||
  model<ChatMessageDoc>("ChatMessage", chatMessageSchema);
