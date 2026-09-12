"use server";

import { requireAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import {
  adminSendMessage,
  getChatConversationsForAdmin,
  getChatMessages,
  getChatThreadForAdmin,
  markChatReadAsAdmin,
  setChatStatus,
  setTypingAsAdmin,
  type ChatConversation,
  type ChatStatus,
} from "./chat";
import {
  cleanBody,
  cleanClientId,
  FALLBACK_ERROR,
  type ChatThread,
} from "./chat-shared";

export type { ChatThread };

const ADMIN_AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const TOO_FAST_ERROR = "پیام‌ها کمی سریع ارسال شدند؛ چند لحظه صبر کنید.";

export async function getChatConversationsAction(): Promise<
  ChatConversation[]
> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getChatConversationsForAdmin();
}

export async function getChatThreadAction(
  conversationId: string,
): Promise<ChatThread | null> {
  const admin = await requireAdmin();
  if (!admin) return null;
  const thread = await getChatThreadForAdmin(conversationId);
  if (!thread) return null;
  return { conversation: thread.conversation, messages: thread.messages };
}

export async function sendChatReplyAction(input: {
  conversationId: string;
  body: string;
  clientId: string;
}): Promise<ActionResult<ChatThread>> {
  const body = cleanBody(input.body);
  const clientId = cleanClientId(input.clientId);
  if (!body || !clientId || typeof input.conversationId !== "string") {
    return { ok: false, error: FALLBACK_ERROR };
  }

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: ADMIN_AUTH_ERROR };
  const session = await getSession();
  const adminId = session?.user.id;
  if (!adminId) return { ok: false, error: ADMIN_AUTH_ERROR };

  const limited = rateLimit(`chat-send-admin:${adminId}`, {
    windowMs: 60_000,
    max: 30,
  });
  if (!limited.ok) return { ok: false, error: TOO_FAST_ERROR };

  try {
    const sent = await adminSendMessage({
      conversationId: input.conversationId,
      adminId,
      body,
      clientId,
    });
    if (!sent) return { ok: false, error: "گفتگو پیدا نشد." };

    // 🔕 Deliberately NO header-bell notification — the bell is reserved
    // for ticket replies and order status; a support reply surfaces as a
    // badge on the chat bubble itself (see `getMyChatUnreadAction`).

    return {
      ok: true,
      data: {
        conversation: sent.conversation,
        messages: await getChatMessages(sent.conversation.id),
      },
    };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function setChatStatusAction(
  conversationId: string,
  status: ChatStatus,
): Promise<ActionResult> {
  if (!["open", "active", "closed"].includes(status)) {
    return { ok: false, error: FALLBACK_ERROR };
  }
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: ADMIN_AUTH_ERROR };

  try {
    const found = await setChatStatus(conversationId, status);
    if (!found) return { ok: false, error: "گفتگو پیدا نشد." };
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function markChatReadAsAdminAction(
  conversationId: string,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin) return;
  await markChatReadAsAdmin(conversationId);
}

export async function pingChatTypingAsAdminAction(
  conversationId: string,
): Promise<void> {
  const admin = await requireAdmin();
  if (!admin || typeof conversationId !== "string") return;
  await setTypingAsAdmin(conversationId);
}
