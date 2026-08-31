"use client";

import { useMemo, useState } from "react";
import {
  CheckCheck,
  CircleAlert,
  Headphones,
  LockKeyhole,
  Mail,
  MessagesSquare,
  Reply,
  Send,
  TicketCheck,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
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

const PER_PAGE = 6;
type StatusFilter = "all" | TicketStatus;
type SortFilter = "newest" | "oldest" | "most-replies";

const STATUS: Record<
  TicketStatus,
  { label: string; cls: string; dot: string }
> = {
  open: {
    label: "در انتظار پاسخ",
    cls: "bg-rose/10 text-rose dark:bg-rose/15",
    dot: "bg-rose",
  },
  answered: {
    label: "پاسخ داده شده",
    cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "بسته شده",
    cls: "bg-navy/7 text-navy/55 dark:bg-white/7 dark:text-ivory/60",
    dot: "bg-navy/35 dark:bg-white/35",
  },
};

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
    if (reply.trim().length < 2) return toast("متن پاسخ را بنویسید");
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
        <div className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 rounded-[22px] border px-5 py-14 text-center shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]">
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
          {pg.pageItems.map((ticket, index) => {
            const replying = openId === ticket.id;
            const meta = STATUS[ticket.status];
            const lastReply = ticket.replies.at(-1);
            return (
              <article
                key={ticket.id}
                className={cn(
                  "border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 overflow-hidden rounded-[22px] border shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]",
                  ticket.status === "open" &&
                    "border-rose/20 dark:border-rose/25",
                )}
                style={{ animationDelay: `${index * 45}ms` }}
              >
                <div className="p-3.5 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="bg-navy text-gold dark:bg-gold/15 dark:text-gold-soft relative grid size-10 shrink-0 place-items-center rounded-xl font-black">
                        {ticket.name.charAt(0)}
                        <span
                          className={cn(
                            "dark:border-navy-mid absolute -inset-e-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white",
                            meta.dot,
                          )}
                        />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="text-navy dark:text-ivory font-black">
                            {ticket.name}
                          </p>
                          <span
                            className={cn(
                              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black",
                              meta.cls,
                            )}
                          >
                            {ticket.status === "open" ? (
                              <CircleAlert className="size-3" />
                            ) : ticket.status === "answered" ? (
                              <CheckCheck className="size-3" />
                            ) : (
                              <LockKeyhole className="size-3" />
                            )}
                            {meta.label}
                          </span>
                        </div>
                        <h2 className="text-navy/78 dark:text-ivory/78 mt-1 text-sm font-black">
                          {ticket.subject}
                        </h2>
                        <p
                          className="text-navy/40 dark:text-wheat mt-1 truncate text-[10px] font-bold"
                          dir="ltr"
                        >
                          {ticket.owner}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-end">
                      <p className="text-navy/40 dark:text-wheat text-[10px] font-bold">
                        {ticket.createdAt}
                      </p>
                      <p className="text-navy/35 dark:text-wheat/55 mt-1 text-[9px] font-black">
                        {ticket.replies.length} پیام
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {ticket.replies.map((item, replyIndex) => (
                      <div
                        key={`${item.at}-${replyIndex}`}
                        className={cn(
                          "max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-6 sm:max-w-[82%]",
                          item.from === "support"
                            ? "border-gold/18 bg-gold/8 text-navy dark:text-ivory ms-auto border"
                            : "bg-navy/4.5 text-navy/80 dark:text-ivory/80 me-auto dark:bg-white/4",
                        )}
                      >
                        <div className="mb-0.5 flex items-center justify-between gap-4 text-[9px] font-black">
                          <span
                            className={
                              item.from === "support"
                                ? "text-gold-deep dark:text-gold-soft"
                                : "text-navy/45 dark:text-wheat"
                            }
                          >
                            {item.from === "support"
                              ? "پشتیبانی ملی‌کیدز"
                              : "کاربر"}
                          </span>
                          <span className="text-navy/30 dark:text-wheat/45 font-bold">
                            {item.at}
                          </span>
                        </div>
                        <p>{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="border-navy/6 dark:border-gold/12 mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3">
                    <p className="text-navy/35 dark:text-wheat/55 hidden text-[9px] font-bold sm:block">
                      آخرین پیام:{" "}
                      {lastReply?.from === "support" ? "پشتیبانی" : "کاربر"}
                    </p>
                    <div className="ms-auto flex w-full gap-2 sm:w-auto">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="min-h-9 flex-1 rounded-xl text-[10px] sm:flex-none"
                        onClick={() =>
                          changeStatus(
                            ticket.id,
                            ticket.status === "closed" ? "open" : "closed",
                          )
                        }
                      >
                        <TicketCheck className="size-3.5" />{" "}
                        {ticket.status === "closed" ? "بازکردن" : "بستن"}
                      </Button>
                      <Button
                        type="button"
                        variant={replying ? "outline" : "navy"}
                        size="sm"
                        className="min-h-9 flex-1 rounded-xl text-[10px] sm:flex-none"
                        onClick={() => {
                          setOpenId(replying ? null : ticket.id);
                          setReply("");
                        }}
                      >
                        <Reply className="size-3.5" />{" "}
                        {replying ? "انصراف" : "ثبت پاسخ"}
                      </Button>
                    </div>
                  </div>
                </div>

                {replying ? (
                  <div className="border-navy/7 bg-navy/2 dark:border-gold/12 border-t p-3.5 sm:p-5 dark:bg-white/2">
                    <label
                      className="text-gold mb-2 flex items-center gap-1.5 text-[11px] font-black"
                      htmlFor={`reply-${ticket.id}`}
                    >
                      <Mail className="size-3.5" /> پاسخ به {ticket.name}
                    </label>
                    <div className="mb-2 flex scrollbar-none gap-1.5 overflow-x-auto pb-1">
                      {[
                        "سلام، ممنون از پیام شما.",
                        "شماره سفارش را لطفاً ارسال کنید.",
                        "موضوع در حال بررسی است و به‌زودی اطلاع می‌دهیم.",
                      ].map((text) => (
                        <button
                          key={text}
                          type="button"
                          onClick={() =>
                            setReply((current) =>
                              current ? `${current}\n${text}` : text,
                            )
                          }
                          className="border-navy/8 text-navy/60 hover:border-gold/40 dark:border-gold/14 dark:bg-navy-deep/35 dark:text-wheat shrink-0 rounded-xl border bg-white/70 px-3 py-1.5 text-[10px] font-bold transition"
                        >
                          {text}
                        </button>
                      ))}
                    </div>
                    <Textarea
                      id={`reply-${ticket.id}`}
                      value={reply}
                      onChange={(event) => setReply(event.target.value)}
                      placeholder="پاسخ کامل و شفاف خود را بنویسید…"
                      className="min-h-28 resize-y rounded-xl bg-transparent"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        type="button"
                        variant="navy"
                        size="sm"
                        className="min-h-10 w-full rounded-xl sm:w-auto"
                        onClick={() => send(ticket.id)}
                      >
                        <Send className="size-4" /> ارسال پاسخ
                      </Button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}

      {list.length > 0 ? <Pagination pg={pg} unit="تیکت" /> : null}
    </div>
  );
}
