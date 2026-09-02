"use client";

import { useMemo, useState } from "react";
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
import {
  replyTicket,
  setTicketStatus,
  useTickets,
  type TicketStatus,
} from "@/lib/tickets";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import { TicketCard } from "./_components/ticket-card";

const PER_PAGE = 6;
type StatusFilter = "all" | TicketStatus;
type SortFilter = "newest" | "oldest" | "most-replies";

export default function AdminMessages() {
  const tickets = useTickets();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return tickets
      .filter((ticket) => {
        const haystack =
          `${ticket.name} ${ticket.owner} ${ticket.subject} ${ticket.replies.map((item) => item.text).join(" ")}`.toLocaleLowerCase(
            "fa",
          );
        return (
          (!term || haystack.includes(term)) &&
          (status === "all" || ticket.status === status)
        );
      })
      .sort((a, b) => {
        if (sort === "oldest")
          return a.createdAt.localeCompare(b.createdAt, "fa");
        if (sort === "most-replies") return b.replies.length - a.replies.length;
        return b.createdAt.localeCompare(a.createdAt, "fa");
      });
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
    replyTicket(id, "support", reply);
    setReply("");
    setOpenId(null);
    toast.success("پاسخ ارسال و وضعیت تیکت به‌روزرسانی شد");
  }

  function changeStatus(id: string, nextStatus: TicketStatus) {
    setTicketStatus(id, nextStatus);
    toast.success(
      nextStatus === "closed" ? "تیکت بسته شد" : "تیکت دوباره باز شد",
    );
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
