import type { ChatConversation, ChatMessage } from "./chat";
import { CHAT_MESSAGE_MAX_LEN } from "./chat";

// 🧩 Shared by both `chat-actions.ts` (customer) and `admin-chat-actions.ts`
// (admin) — plain input-cleaning helpers and the one response shape both
// return, not a "use server" boundary itself.

export const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

export type ChatThread = {
  conversation: ChatConversation | null;
  messages: ChatMessage[];
};

// 🧭 The storefront path the chat started from (`/product/…`) — context
// only, and only accepted in the shape a real path has.
export function cleanPage(page: unknown): string | undefined {
  if (typeof page !== "string") return undefined;
  const trimmed = page.trim().slice(0, 120);
  return trimmed.startsWith("/") ? trimmed : undefined;
}

export function cleanBody(body: unknown): string | null {
  if (typeof body !== "string") return null;
  const text = body.trim();
  if (!text || text.length > CHAT_MESSAGE_MAX_LEN) return null;
  return text;
}

export function cleanClientId(clientId: unknown): string | null {
  if (typeof clientId !== "string") return null;
  const trimmed = clientId.trim().slice(0, 64);
  return trimmed ? trimmed : null;
}
