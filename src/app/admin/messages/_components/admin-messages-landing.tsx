"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  CheckCheck,
  CircleAlert,
  Headphones,
  Hourglass,
  LockKeyhole,
  Mail,
  MessagesSquare,
  Zap,
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Pagination } from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { usePolling } from "@/hooks/use-polling";
import { notifyAdminMutation } from "@/lib/admin/live";
import type {
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
} from "@/lib/shop/tickets";
import type { ChatConversation } from "@/lib/shop/chat";
import { getChatConversationsAction } from "@/lib/shop/admin-chat-actions";
import {
  DEFAULT_CANNED_RESPONSES,
  type CannedResponse,
} from "@/lib/support/canned-defaults";
import { toFaDigits } from "@/lib/locale/fa";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import {
  getAllTicketsAction,
  getCannedResponsesAction,
  getSupportStaffAction,
  replyTicketAction,
  setTicketStatusAction,
  updateTicketMetaAction,
} from "../_lib/actions";
import { TicketCard } from "./ticket-card";
import { AdminChatPanel } from "./admin-chat-panel";
import { CannedManager } from "./canned-manager";
import {
  TICKET_CATEGORY_LABEL,
  TICKET_PRIORITY_LABEL,
} from "@/lib/support/ticket-labels";

const PER_PAGE = 6;
const POLL_MS = 8_000;
type StatusFilter = "all" | TicketStatus;
type CategoryFilter = "all" | TicketCategory;
type PriorityFilter = "all" | TicketPriority;
type SortFilter = "newest" | "oldest" | "most-replies" | "waiting";
type SupportTab = "tickets" | "chat";

function TabBadge({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span className="bg-rose grid min-w-5 place-items-center rounded-full px-1.5 py-0.5 text-[10px] leading-none font-black text-white">
      {toFaDigits(count)}
    </span>
  );
}

export function AdminMessagesLanding({
  tickets: initialTickets,
  conversations: initialConversations,
}: {
  tickets: Ticket[];
  conversations: ChatConversation[];
}) {
  const [tickets, , refreshTickets] = usePolling(
    getAllTicketsAction,
    POLL_MS,
    initialTickets,
  );
  // 📡 The one live-chat list poll — shared by the tab badge below and the
  // inbox inside `AdminChatPanel`, so the two never disagree.
  const [conversations, setConversations, refreshConversations] = usePolling(
    getChatConversationsAction,
    POLL_MS,
    initialConversations,
  );
  const [, startTransition] = useTransition();
  const [tab, setTab] = useState<SupportTab>("tickets");
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [assignee, setAssignee] = useState("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [staff, setStaff] = useState<{ id: string; name: string }[]>([]);
  const [canned, setCanned] = useState<CannedResponse[]>([]);
  const [cannedOpen, setCannedOpen] = useState(false);

  // 🧑‍💼 Staff + snippets change rarely — one load per visit, refreshed
  // after the manager edits (not polled like the tickets themselves).
  useEffect(() => {
    getSupportStaffAction().then(setStaff);
    getCannedResponsesAction().then(setCanned);
  }, []);

  const composerCanned = canned.length ? canned : DEFAULT_CANNED_RESPONSES;

  function synced() {
    refreshTickets();
    refreshConversations();
    notifyAdminMutation();
  }

  // #️⃣ Hash-routed tabs (`/admin/messages#chat`) — survives a refresh and
  // deep-links from the header bell, with no `useSearchParams` Suspense
  // boundary needed.
  useEffect(() => {
    const sync = () =>
      setTab(window.location.hash === "#chat" ? "chat" : "tickets");
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  function selectTab(next: SupportTab) {
    setTab(next);
    window.history.replaceState(
      null,
      "",
      next === "chat" ? "#chat" : window.location.pathname,
    );
  }

  // 🗓️ `tickets` already arrives newest-first (sorted server-side by the
  // real `updatedAt`) — "oldest" just reverses that; the other sorts are
  // the real re-sorts.
  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    const filtered = tickets.filter((ticket) => {
      const haystack =
        `${ticket.name} ${ticket.subject} ${ticket.replies.map((item) => item.text).join(" ")}`.toLocaleLowerCase(
          "fa",
        );
      return (
        (!term || haystack.includes(term)) &&
        (status === "all" || ticket.status === status) &&
        (category === "all" || ticket.category === category) &&
        (priority === "all" || ticket.priority === priority) &&
        (assignee === "all" ||
          (assignee === "none"
            ? !ticket.assigneeId
            : ticket.assigneeId === assignee))
      );
    });

    if (sort === "most-replies") {
      return [...filtered].sort((a, b) => b.replies.length - a.replies.length);
    }
    // ⏳ Longest-waiting first — the triage order for a busy support desk.
    if (sort === "waiting") {
      return [...filtered].sort(
        (a, b) => (b.waitingHours ?? -1) - (a.waitingHours ?? -1),
      );
    }
    return sort === "oldest" ? [...filtered].reverse() : filtered;
  }, [assignee, category, priority, q, sort, status, tickets]);

  const pg = usePagination(
    list,
    PER_PAGE,
    `${q}|${status}|${category}|${priority}|${assignee}|${sort}`,
  );
  const unanswered = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const pending = tickets.filter(
    (ticket) => ticket.status === "pending",
  ).length;
  const answered = tickets.filter(
    (ticket) => ticket.status === "answered",
  ).length;
  const closed = tickets.filter((ticket) => ticket.status === "closed").length;
  const urgent = tickets.filter(
    (ticket) => ticket.priority === "urgent" && ticket.status !== "closed",
  ).length;
  const waitingChats = conversations.filter(
    (conv) => conv.status === "open",
  ).length;
  const activeFilters =
    Number(!!q.trim()) +
    Number(status !== "all") +
    Number(category !== "all") +
    Number(priority !== "all") +
    Number(assignee !== "all") +
    Number(sort !== "newest");

  function resetFilters() {
    setQ("");
    setStatus("all");
    setCategory("all");
    setPriority("all");
    setAssignee("all");
    setSort("newest");
  }

  function send(id: string) {
    if (reply.trim().length < 2) return toast.warning("متن پاسخ را بنویسید");

    startTransition(async () => {
      const result = await replyTicketAction(id, reply);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      setReply("");
      setOpenId(null);
      toast.success("پاسخ ارسال و وضعیت تیکت به‌روزرسانی شد");
      synced();
    });
  }

  function changeStatus(id: string, nextStatus: TicketStatus) {
    startTransition(async () => {
      const result = await setTicketStatusAction(id, nextStatus);
      if (result.ok) {
        toast.success(
          nextStatus === "closed"
            ? "تیکت بسته شد"
            : nextStatus === "pending"
              ? "تیکت در انتظار مشتری قرار گرفت"
              : "تیکت به صف پاسخ بازگشت",
        );
        synced();
      } else {
        toast.error(result.error);
      }
    });
  }

  function changeMeta(
    id: string,
    patch: {
      category?: TicketCategory;
      priority?: TicketPriority;
      assigneeId?: string | null;
    },
  ) {
    startTransition(async () => {
      const result = await updateTicketMetaAction(id, patch);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      synced();
    });
  }

  // ⚡ A reply/close inside the chat thread updates the inbox list item in
  // the same breath — the stat strip above moves instantly, not on the
  // next poll tick.
  function conversationChanged(next: ChatConversation) {
    setConversations((current) =>
      current.map((conv) => (conv.id === next.id ? next : conv)),
    );
    notifyAdminMutation();
  }

  return (
    <div>
      <AdminPageHeader
        kicker="SUPPORT CENTER"
        title="مرکز پشتیبانی"
        description="رسیدگی متمرکز به تیکت‌ها و گفتگوی زنده، و پایش سرعت پاسخ‌گویی تیم پشتیبانی."
        action={
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-xl"
            onClick={() => setCannedOpen(true)}
          >
            <Zap className="size-4" /> پاسخ‌های آماده
          </Button>
        }
      />

      <div
        role="tablist"
        aria-label="بخش‌های پشتیبانی"
        className={cn(
          "mb-4 flex gap-2 rounded-2xl border p-1.5",
          "border-navy/10 bg-white/70",
          "dark:border-gold/25 dark:bg-white/4",
        )}
      >
        <button
          type="button"
          role="tab"
          id="support-tab-tickets"
          aria-selected={tab === "tickets"}
          aria-controls="support-panel-tickets"
          onClick={() => selectTab("tickets")}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black transition-colors",
            tab === "tickets"
              ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep shadow"
              : "text-navy/70 hover:bg-navy/5 dark:text-ivory/70 dark:hover:bg-white/6",
          )}
        >
          <Mail className="size-4" />
          تیکت‌ها
          <TabBadge count={unanswered} />
        </button>
        <button
          type="button"
          role="tab"
          id="support-tab-chat"
          aria-selected={tab === "chat"}
          aria-controls="support-panel-chat"
          onClick={() => selectTab("chat")}
          className={cn(
            "flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-black transition-colors",
            tab === "chat"
              ? "bg-navy text-ivory dark:bg-gold dark:text-navy-deep shadow"
              : "text-navy/70 hover:bg-navy/5 dark:text-ivory/70 dark:hover:bg-white/6",
          )}
        >
          <MessagesSquare className="size-4" />
          گفتگوی زنده
          <TabBadge count={waitingChats} />
        </button>
      </div>

      {tab === "chat" ? (
        <div
          role="tabpanel"
          id="support-panel-chat"
          aria-labelledby="support-tab-chat"
        >
          <AdminChatPanel
            conversations={conversations}
            setConversations={setConversations}
            onConversationChanged={conversationChanged}
            staff={staff}
            canned={composerCanned}
          />
        </div>
      ) : (
        <div
          role="tabpanel"
          id="support-panel-tickets"
          aria-labelledby="support-tab-tickets"
        >
          <AdminStatStrip
            items={[
              {
                label: "کل تیکت‌ها",
                value: tickets.length,
                Icon: Headphones,
                tone: "blue",
              },
              {
                label: "بدون پاسخ",
                value: unanswered,
                hint: unanswered ? "نیازمند رسیدگی" : "همه پاسخ گرفته‌اند",
                Icon: CircleAlert,
                tone: "rose",
              },
              {
                label: "در انتظار مشتری",
                value: pending,
                Icon: Hourglass,
                tone: "gold",
              },
              {
                label: "پاسخ‌داده‌شده",
                value: answered,
                Icon: CheckCheck,
                tone: "emerald",
              },
              {
                label: "بسته‌شده",
                value: closed,
                Icon: LockKeyhole,
                tone: "gold",
              },
            ]}
          />
          {urgent ? (
            <p className="bg-rose/8 text-rose border-rose/20 mb-3 rounded-2xl border px-4 py-2.5 text-xs font-black">
              {toFaDigits(urgent)} تیکت فوری باز — رسیدگی اول با این‌هاست.
            </p>
          ) : null}

          <AdminFilterBar
            search={q}
            onSearchChange={setQ}
            searchPlaceholder="نام کاربر، موضوع یا متن پیام…"
            resultCount={list.length}
            resultLabel="تیکت"
            activeCount={activeFilters}
            onReset={resetFilters}
          >
            <AdminFilterSelect
              label="وضعیت پاسخ"
              value={status}
              onValueChange={(value) => setStatus(value as StatusFilter)}
              options={[
                { value: "all", label: "همه تیکت‌ها", count: tickets.length },
                { value: "open", label: "بدون پاسخ", count: unanswered },
                { value: "pending", label: "در انتظار مشتری", count: pending },
                { value: "answered", label: "پاسخ‌داده‌شده", count: answered },
                { value: "closed", label: "بسته‌شده", count: closed },
              ]}
            />
            <AdminFilterSelect
              label="دسته‌بندی"
              value={category}
              onValueChange={(value) => setCategory(value as CategoryFilter)}
              options={[
                { value: "all", label: "همه دسته‌ها" },
                ...(Object.keys(TICKET_CATEGORY_LABEL) as TicketCategory[]).map(
                  (value) => ({
                    value,
                    label: TICKET_CATEGORY_LABEL[value],
                    count: tickets.filter((t) => t.category === value).length,
                  }),
                ),
              ]}
            />
            <AdminFilterSelect
              label="اولویت"
              value={priority}
              onValueChange={(value) => setPriority(value as PriorityFilter)}
              options={[
                { value: "all", label: "همه اولویت‌ها" },
                ...(Object.keys(TICKET_PRIORITY_LABEL) as TicketPriority[]).map(
                  (value) => ({
                    value,
                    label: TICKET_PRIORITY_LABEL[value],
                    count: tickets.filter((t) => t.priority === value).length,
                  }),
                ),
              ]}
            />
            <AdminFilterSelect
              label="کارشناس"
              value={assignee}
              onValueChange={setAssignee}
              options={[
                { value: "all", label: "همه" },
                {
                  value: "none",
                  label: "بدون ارجاع",
                  count: tickets.filter((t) => !t.assigneeId).length,
                },
                ...staff.map((person) => ({
                  value: person.id,
                  label: person.name,
                  count: tickets.filter((t) => t.assigneeId === person.id)
                    .length,
                })),
              ]}
            />
            <AdminFilterSelect
              label="مرتب‌سازی"
              value={sort}
              onValueChange={(value) => setSort(value as SortFilter)}
              options={[
                { value: "newest", label: "جدیدترین فعالیت" },
                { value: "waiting", label: "بیشترین انتظار" },
                { value: "oldest", label: "قدیمی‌ترین" },
                { value: "most-replies", label: "بیشترین پاسخ" },
              ]}
            />
          </AdminFilterBar>

          {list.length === 0 ? (
            <div className={cn(adminGlassCard, "px-5 py-14 text-center")}>
              <span className="bg-gold/12 text-gold mx-auto grid size-14 place-items-center rounded-2xl">
                <MessagesSquare className="size-6" />
              </span>
              <p className="text-navy dark:text-ivory mt-4 font-black">
                {tickets.length === 0
                  ? "هنوز تیکتی ثبت نشده"
                  : "تیکتی مطابق فیلترها پیدا نشد"}
              </p>
              <p className="text-navy/70 dark:text-wheat mx-auto mt-1 max-w-sm text-xs leading-6">
                {tickets.length === 0
                  ? "تیکت‌های ساخته‌شده در پنل کاربران، همراه با وضعیت پاسخ، اینجا نمایش داده می‌شوند."
                  : "فیلتر وضعیت یا عبارت جستجو را تغییر دهید."}
              </p>
            </div>
          ) : (
            <div className="grid gap-3">
              {pg.pageItems.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  replying={openId === ticket.id}
                  replyValue={reply}
                  onReplyChange={setReply}
                  onToggleReply={() => {
                    setOpenId(openId === ticket.id ? null : ticket.id);
                    setReply("");
                  }}
                  onSend={() => send(ticket.id)}
                  onToggleStatus={() =>
                    changeStatus(
                      ticket.id,
                      ticket.status === "closed" ? "open" : "closed",
                    )
                  }
                  onTogglePending={() =>
                    changeStatus(
                      ticket.id,
                      ticket.status === "pending" ? "open" : "pending",
                    )
                  }
                  staff={staff}
                  canned={composerCanned}
                  onMeta={(patch) => changeMeta(ticket.id, patch)}
                />
              ))}
            </div>
          )}

          {list.length > 0 ? <Pagination pg={pg} unit="تیکت" /> : null}
        </div>
      )}

      <CannedManager
        open={cannedOpen}
        canned={canned.length ? canned : DEFAULT_CANNED_RESPONSES}
        onClose={() => setCannedOpen(false)}
        onChanged={setCanned}
      />
    </div>
  );
}
