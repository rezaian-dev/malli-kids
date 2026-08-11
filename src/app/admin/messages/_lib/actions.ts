"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth/admin";
import { getSession } from "@/lib/auth/session";
import {
  claimTicketIfUnassigned,
  getAllTickets,
  replyTicket,
  setTicketMeta,
  setTicketStatus,
} from "@/lib/shop/tickets";
import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/shop/tickets";
import {
  createCannedResponse,
  getCannedResponses,
  removeCannedResponse,
  type CannedResponse,
} from "@/lib/shop/canned-responses";
import { setChatAssignee } from "@/lib/shop/chat";
import { createNotification } from "@/lib/shop/notifications";
import type { ActionResult } from "@/lib/action-result";
import { getAllCustomers } from "../../customers/_lib/data";

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

    // 🙋 First reply claims the thread, so the assignee filter tells the
    // truth even when nobody assigned it by hand.
    const session = await getSession();
    if (session?.user) {
      await claimTicketIfUnassigned(id, session.user.id, session.user.name);
    }

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

const CATEGORIES: TicketCategory[] = [
  "order",
  "return",
  "sizing",
  "quality",
  "other",
];
const PRIORITIES: TicketPriority[] = ["normal", "high", "urgent"];

export async function setTicketStatusAction(
  id: string,
  status: TicketStatus,
): Promise<ActionResult> {
  if (!["open", "pending", "answered", "closed"].includes(status)) {
    return { ok: false, error: FALLBACK_ERROR };
  }
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

/** 🗂️ Category / priority / assignee upkeep — enums re-checked here (the
 *  client only sends ids), and the assignee name is resolved server-side
 *  from the real staff list, never trusted from the client. */
export async function updateTicketMetaAction(
  id: string,
  patch: {
    category?: TicketCategory;
    priority?: TicketPriority;
    assigneeId?: string | null;
  },
): Promise<ActionResult> {
  if (patch.category && !CATEGORIES.includes(patch.category)) {
    return { ok: false, error: FALLBACK_ERROR };
  }
  if (patch.priority && !PRIORITIES.includes(patch.priority)) {
    return { ok: false, error: FALLBACK_ERROR };
  }

  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    let assigneeName: string | null | undefined;
    if (patch.assigneeId) {
      const staff = await getAllCustomers();
      const person = staff.find(
        (c) => c.id === patch.assigneeId && c.role === "admin",
      );
      if (!person) return { ok: false, error: "کارشناس معتبر نیست." };
      assigneeName = `${person.firstName} ${person.lastName}`.trim();
    } else if (patch.assigneeId === null) {
      assigneeName = null;
    }
    const found = await setTicketMeta(id, {
      category: patch.category,
      priority: patch.priority,
      assigneeId: patch.assigneeId,
      assigneeName,
    });
    if (!found) return { ok: false, error: "تیکت پیدا نشد." };

    revalidateTickets();
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

/** 🧑‍💼 Assignable support staff — admins only, id + display name. */
/** 🧑‍💼 Manual chat assignment — the assignee name resolves from the
 *  staff list wherever it's displayed; only the id is stored. */
export async function setChatAssigneeAction(
  conversationId: string,
  assigneeId: string | null,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    if (assigneeId) {
      const staff = await getAllCustomers();
      if (!staff.some((c) => c.id === assigneeId && c.role === "admin")) {
        return { ok: false, error: "کارشناس معتبر نیست." };
      }
    }
    const found = await setChatAssignee(conversationId, assigneeId);
    if (!found) return { ok: false, error: "گفتگو پیدا نشد." };
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function getSupportStaffAction(): Promise<
  { id: string; name: string }[]
> {
  const admin = await requireAdmin();
  if (!admin) return [];
  const customers = await getAllCustomers();
  return customers
    .filter((c) => c.role === "admin")
    .map((c) => ({
      id: c.id,
      name: `${c.firstName} ${c.lastName}`.trim() || c.email,
    }));
}

export async function getCannedResponsesAction(): Promise<CannedResponse[]> {
  const admin = await requireAdmin();
  if (!admin) return [];
  return getCannedResponses();
}

export async function createCannedResponseAction(
  title: string,
  body: string,
): Promise<ActionResult<CannedResponse>> {
  if (title.trim().length < 2 || body.trim().length < 2) {
    return { ok: false, error: "عنوان و متن پاسخ آماده را بنویسید." };
  }
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const created = await createCannedResponse({ title, body });
    revalidatePath("/admin/messages");
    return { ok: true, data: created };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}

export async function removeCannedResponseAction(
  id: string,
): Promise<ActionResult> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: AUTH_ERROR };

  try {
    const found = await removeCannedResponse(id);
    if (!found) return { ok: false, error: "پاسخ آماده پیدا نشد." };
    revalidatePath("/admin/messages");
    return { ok: true };
  } catch {
    return { ok: false, error: FALLBACK_ERROR };
  }
}
