"use client";

import { useMemo, useState } from "react";
import { CheckCheck, CircleAlert, Headphones, LockKeyhole, Mail, MessagesSquare, Reply, Send, TicketCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Textarea } from "@/components/ui/textarea";
import { AdminFilterBar, AdminFilterSelect, AdminStatStrip, PageHead } from "@/features/admin";
import { usePagination } from "@/hooks/use-pagination";
import { replyTicket, setTicketStatus, useTickets, type TicketStatus } from "@/lib/tickets";
import { cn } from "@/lib/utils";

const PER_PAGE = 6;
type StatusFilter = "all" | TicketStatus;
type SortFilter = "newest" | "oldest" | "most-replies";

const STATUS: Record<TicketStatus, { label: string; cls: string; dot: string }> = {
  open: { label: "در انتظار پاسخ", cls: "bg-rose/10 text-rose dark:bg-rose/15", dot: "bg-rose" },
  answered: { label: "پاسخ داده شده", cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/12 dark:text-emerald-300", dot: "bg-emerald-500" },
  closed: { label: "بسته شده", cls: "bg-navy/7 text-navy/55 dark:bg-white/7 dark:text-ivory/60", dot: "bg-navy/35 dark:bg-white/35" },
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
        const haystack = `${ticket.name} ${ticket.owner} ${ticket.subject} ${ticket.replies.map((item) => item.text).join(" ")}`.toLocaleLowerCase("fa");
        return (!term || haystack.includes(term)) && (status === "all" || ticket.status === status);
      })
      .sort((a, b) => {
        if (sort === "oldest") return a.createdAt.localeCompare(b.createdAt, "fa");
        if (sort === "most-replies") return b.replies.length - a.replies.length;
        return b.createdAt.localeCompare(a.createdAt, "fa");
      });
  }, [q, sort, status, tickets]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${sort}`);
  const unanswered = tickets.filter((ticket) => ticket.status === "open").length;
  const answered = tickets.filter((ticket) => ticket.status === "answered").length;
  const closed = tickets.filter((ticket) => ticket.status === "closed").length;
  const activeFilters = Number(!!q.trim()) + Number(status !== "all") + Number(sort !== "newest");

  function send(id: string) {
    if (reply.trim().length < 2) return toast("متن پاسخ را بنویسید");
    replyTicket(id, "support", reply);
    setReply("");
    setOpenId(null);
    toast.success("پاسخ ارسال و وضعیت تیکت به‌روزرسانی شد");
  }

  function changeStatus(id: string, nextStatus: TicketStatus) {
    setTicketStatus(id, nextStatus);
    toast.success(nextStatus === "closed" ? "تیکت بسته شد" : "تیکت دوباره باز شد");
  }

  return (
    <div>
      <PageHead kicker="SUPPORT CENTER" title="تیکت‌های پشتیبانی" description="رسیدگی متمرکز به درخواست‌ها و پایش سرعت پاسخ‌گویی تیم پشتیبانی." />

      <AdminStatStrip items={[
        { label: "کل تیکت‌ها", value: tickets.length, Icon: Headphones, tone: "blue" },
        { label: "بدون پاسخ", value: unanswered, hint: unanswered ? "نیازمند رسیدگی" : "همه پاسخ گرفته‌اند", Icon: CircleAlert, tone: "rose" },
        { label: "پاسخ‌داده‌شده", value: answered, Icon: CheckCheck, tone: "emerald" },
        { label: "بسته‌شده", value: closed, Icon: LockKeyhole, tone: "gold" },
      ]} />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام کاربر، موضوع یا متن پیام…"
        resultCount={list.length}
        resultLabel="تیکت"
        activeCount={activeFilters}
        onReset={() => { setQ(""); setStatus("all"); setSort("newest"); }}
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
        <div className="admin-card px-5 py-14 text-center">
          <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-gold/12 text-gold"><MessagesSquare className="size-6" /></span>
          <p className="mt-4 font-black text-navy dark:text-ivory">{tickets.length === 0 ? "هنوز تیکتی ثبت نشده" : "تیکتی مطابق فیلترها پیدا نشد"}</p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-6 text-navy/50 dark:text-wheat">{tickets.length === 0 ? "تیکت‌های ساخته‌شده در پنل کاربران، همراه با وضعیت پاسخ، اینجا نمایش داده می‌شوند." : "فیلتر وضعیت یا عبارت جستجو را تغییر دهید."}</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pg.pageItems.map((ticket, index) => {
            const replying = openId === ticket.id;
            const meta = STATUS[ticket.status];
            const lastReply = ticket.replies.at(-1);
            return (
              <article key={ticket.id} className={cn("admin-card overflow-hidden", ticket.status === "open" && "border-rose/20 dark:border-rose/25")} style={{ animationDelay: `${index * 45}ms` }}>
                <div className="p-3.5 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex min-w-0 items-start gap-3">
                      <span className="relative grid size-10 shrink-0 place-items-center rounded-xl bg-navy font-black text-gold dark:bg-gold/15 dark:text-gold-soft">
                        {ticket.name.charAt(0)}
                        <span className={cn("absolute -end-0.5 -top-0.5 size-2.5 rounded-full border-2 border-white dark:border-navy-mid", meta.dot)} />
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <p className="font-black text-navy dark:text-ivory">{ticket.name}</p>
                          <span className={cn("inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black", meta.cls)}>{ticket.status === "open" ? <CircleAlert className="size-3" /> : ticket.status === "answered" ? <CheckCheck className="size-3" /> : <LockKeyhole className="size-3" />}{meta.label}</span>
                        </div>
                        <h2 className="mt-1 text-sm font-black text-navy/78 dark:text-ivory/78">{ticket.subject}</h2>
                        <p className="mt-1 truncate text-[10px] font-bold text-navy/40 dark:text-wheat" dir="ltr">{ticket.owner}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-end">
                      <p className="text-[10px] font-bold text-navy/40 dark:text-wheat">{ticket.createdAt}</p>
                      <p className="mt-1 text-[9px] font-black text-navy/35 dark:text-wheat/55">{ticket.replies.length} پیام</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    {ticket.replies.map((item, replyIndex) => (
                      <div key={`${item.at}-${replyIndex}`} className={cn("max-w-[92%] rounded-2xl px-3.5 py-2.5 text-xs leading-6 sm:max-w-[82%]", item.from === "support" ? "ms-auto border border-gold/18 bg-gold/8 text-navy dark:text-ivory" : "me-auto bg-navy/[0.045] text-navy/80 dark:bg-white/[0.04] dark:text-ivory/80")}>
                        <div className="mb-0.5 flex items-center justify-between gap-4 text-[9px] font-black">
                          <span className={item.from === "support" ? "text-gold-deep dark:text-gold-soft" : "text-navy/45 dark:text-wheat"}>{item.from === "support" ? "پشتیبانی مالی" : "کاربر"}</span>
                          <span className="font-bold text-navy/30 dark:text-wheat/45">{item.at}</span>
                        </div>
                        <p>{item.text}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-navy/6 pt-3 dark:border-gold/12">
                    <p className="hidden text-[9px] font-bold text-navy/35 sm:block dark:text-wheat/55">آخرین پیام: {lastReply?.from === "support" ? "پشتیبانی" : "کاربر"}</p>
                    <div className="ms-auto flex w-full gap-2 sm:w-auto">
                      <Button type="button" variant="outline" size="sm" className="min-h-9 flex-1 rounded-xl text-[10px] sm:flex-none" onClick={() => changeStatus(ticket.id, ticket.status === "closed" ? "open" : "closed")}>
                        <TicketCheck className="size-3.5" /> {ticket.status === "closed" ? "بازکردن" : "بستن"}
                      </Button>
                      <Button type="button" variant={replying ? "outline" : "navy"} size="sm" className="min-h-9 flex-1 rounded-xl text-[10px] sm:flex-none" onClick={() => { setOpenId(replying ? null : ticket.id); setReply(""); }}>
                        <Reply className="size-3.5" /> {replying ? "انصراف" : "ثبت پاسخ"}
                      </Button>
                    </div>
                  </div>
                </div>

                {replying ? (
                  <div className="border-t border-navy/7 bg-navy/[0.02] p-3.5 dark:border-gold/12 dark:bg-white/[0.02] sm:p-5">
                    <label className="mb-2 flex items-center gap-1.5 text-[11px] font-black text-gold" htmlFor={`reply-${ticket.id}`}><Mail className="size-3.5" /> پاسخ به {ticket.name}</label>
                    <div className="mb-2 flex gap-1.5 overflow-x-auto pb-1 [scrollbar-width:none]">
                      {["سلام، ممنون از پیام شما.", "شماره سفارش را لطفاً ارسال کنید.", "موضوع در حال بررسی است و به‌زودی اطلاع می‌دهیم."].map((text) => (
                        <button key={text} type="button" onClick={() => setReply((current) => current ? `${current}\n${text}` : text)} className="shrink-0 rounded-xl border border-navy/8 bg-white/70 px-3 py-1.5 text-[10px] font-bold text-navy/60 transition hover:border-gold/40 dark:border-gold/14 dark:bg-navy-deep/35 dark:text-wheat">{text}</button>
                      ))}
                    </div>
                    <Textarea id={`reply-${ticket.id}`} value={reply} onChange={(event) => setReply(event.target.value)} placeholder="پاسخ کامل و شفاف خود را بنویسید…" className="min-h-28 resize-y rounded-xl bg-white/80 dark:bg-navy-deep/40" />
                    <div className="mt-2 flex justify-end">
                      <Button type="button" variant="navy" size="sm" className="min-h-10 w-full rounded-xl sm:w-auto" onClick={() => send(ticket.id)}><Send className="size-4" /> ارسال پاسخ</Button>
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
