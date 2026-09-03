"use client";

import { useMemo, useState, useTransition } from "react";
import {
  CheckCheck,
  CircleAlert,
  Headphones,
  LockKeyhole,
  MessagesSquare,
} from "lucide-react";
import { toast } from "@/lib/toast";

import { Pagination } from "@/components/ui/pagination";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import { usePolling } from "@/hooks/use-polling";
import type { Ticket, TicketStatus } from "@/lib/shop/tickets";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import {
  getAllTicketsAction,
  replyTicketAction,
  setTicketStatusAction,
} from "../_lib/actions";
import { TicketCard } from "./ticket-card";

const PER_PAGE = 6;
const POLL_MS = 8_000;
type StatusFilter = "all" | TicketStatus;
type SortFilter = "newest" | "oldest" | "most-replies";

export function AdminMessagesLanding({
  tickets: initialTickets,
}: {
  tickets: Ticket[];
}) {
  const [tickets] = usePolling(getAllTicketsAction, POLL_MS, initialTickets);
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  // 🗓️ `tickets` already arrives newest-first (sorted server-side by the
  // real `updatedAt`) — "oldest" just reverses that; "most-replies" is the
  // one real re-sort.
  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    const filtered = tickets.filter((ticket) => {
      const haystack =
        `${ticket.name} ${ticket.subject} ${ticket.replies.map((item) => item.text).join(" ")}`.toLocaleLowerCase(
          "fa",
        );
      return (
        (!term || haystack.includes(term)) &&
        (status === "all" || ticket.status === status)
      );
    });

    if (sort === "most-replies") {
      return [...filtered].sort((a, b) => b.replies.length - a.replies.length);
    }
    return sort === "oldest" ? [...filtered].reverse() : filtered;
  }, [q, sort, status, tickets]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${sort}`);
  const unanswered = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;
  const answered = tickets.filter(
    (ticket) => ticket.status === "answered",
  ).length;
  const closed = tickets.filter((ticket) => ticket.status === "closed").length;
  const activeFilters =
    Number(!!q.trim()) + Number(status !== "all") + Number(sort !== "newest");

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
    });
  }

  function changeStatus(id: string, nextStatus: TicketStatus) {
    startTransition(async () => {
      const result = await setTicketStatusAction(id, nextStatus);
      if (result.ok) {
        toast.success(
          nextStatus === "closed" ? "تیکت بسته شد" : "تیکت دوباره باز شد",
        );
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div>
      <AdminPageHeader
        kicker="SUPPORT CENTER"
        title="تیکت‌های پشتیبانی"
        description="رسیدگی متمرکز به درخواست‌ها و پایش سرعت پاسخ‌گویی تیم پشتیبانی."
      />

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
            label: "پاسخ‌داده‌شده",
            value: answered,
            Icon: CheckCheck,
            tone: "emerald",
          },
          { label: "بسته‌شده", value: closed, Icon: LockKeyhole, tone: "gold" },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام کاربر، موضوع یا متن پیام…"
        resultCount={list.length}
        resultLabel="تیکت"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStatus("all");
          setSort("newest");
        }}
      >
        <AdminFilterSelect
          label="وضعیت پاسخ"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه تیکت‌ها", count: tickets.length },
            { value: "open", label: "بدون پاسخ", count: unanswered },
            { value: "answered", label: "پاسخ‌داده‌شده", count: answered },
            { value: "closed", label: "بسته‌شده", count: closed },
          ]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "newest", label: "جدیدترین فعالیت" },
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
          <p className="text-navy/50 dark:text-wheat mx-auto mt-1 max-w-sm text-xs leading-6">
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
            />
          ))}
        </div>
      )}

      {list.length > 0 ? <Pagination pg={pg} unit="تیکت" /> : null}
    </div>
  );
}
