"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { getAllTickets, replyTicket, setTicketStatus } from "@/lib/shop/tickets";
import { createNotification } from "@/lib/shop/notifications";
import type { ActionResult } from "@/lib/action-result";
import type { Ticket, TicketStatus } from "@/lib/shop/tickets";

const AUTH_ERROR = "برای این کار باید ادمین وارد شده باشید.";
const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

/** 🔄 Polled from `AdminMessagesLanding` — a new customer ticket/reply
 *  should show up in an already-open admin tab without a manual reload. */
export async function getAllTicketsAction(): Promise<Ticket[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getAllTickets();
}

function revalidateTickets() {
  revalidatePath("/admin/messages");
  revalidatePath("/profile");
}

export async function replyTicketAction(
  id: string,
  text: string,
): Promise<ActionResult> {
  if (text.trim().length < 2) return { ok: false, error: "متن پاسخ را بنویسید." };

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const ticket = await replyTicket(id, "support", text);
    if (!ticket) return { ok: false, error: "تیکت پیدا نشد." };

    await createNotification({
      userId: ticket.userId,
      kind: "ticket",
      text: `پاسخ جدید به تیکت «${ticket.subject}»`,
    });

    revalidateTickets();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function setTicketStatusAction(
  id: string,
  status: TicketStatus,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const found = await setTicketStatus(id, status);
    if (!found) return { ok: false, error: "تیکت پیدا نشد." };

    revalidateTickets();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
