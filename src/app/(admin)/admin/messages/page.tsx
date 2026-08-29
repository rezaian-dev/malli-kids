"use client";

import { useState } from "react";
import { Headphones, Mail, Reply, Send, TicketCheck } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";
import { replyTicket, setTicketStatus, useTickets, type Ticket, type TicketStatus } from "@/lib/tickets";
import { cn } from "@/lib/utils";

const PER_PAGE = 6;

const STATUS: Record<TicketStatus, { label: string; cls: string }> = {
  open: { label: "باز", cls: "bg-gold/15 text-gold" },
  answered: { label: "پاسخ‌داده‌شده", cls: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300" },
  closed: { label: "بسته", cls: "bg-navy/8 text-navy/55 dark:bg-white/10 dark:text-ivory/55" },
};

/**
 * تیکت‌های پشتیبانی — همان‌هایی که کاربر در پنلِ خودش ثبت کرده.
 * پاسخِ شما این‌جا ثبت می‌شود و کاربر آن را در پنلِ کاربریِ خودش می‌بیند.
 */
export default function AdminMessages() {
  const tickets = useTickets();
  const pg = usePagination(tickets, PER_PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  function send(id: string) {
    if (reply.trim().length < 2) return toast("متن پاسخ را بنویسید");
    replyTicket(id, "support", reply);
    setReply("");
    setOpenId(null);
    toast.success("پاسخ ثبت شد — کاربر آن را در پنل خودش می‌بیند");
  }

  function close(id: string, status: TicketStatus) {
    setTicketStatus(id, status);
    toast.success(status === "closed" ? "تیکت بسته شد" : "تیکت باز شد");
  }

  return (
    <div>
      <PageHead kicker="INBOX" title="تیکت‌های پشتیبانی" />
      <p className="mb-4 text-sm text-navy/50 dark:text-wheat">
        تیکت‌های ثبت‌شدهٔ کاربران در پنلِ کاربری؛ پاسخِ شما همین‌جا ذخیره و در پنلِ خودِ کاربر نمایش داده می‌شود.
      </p>

      {pg.pageItems.length === 0 ? (
        <div className="admin-card px-6 py-14 text-center">
          <Headphones className="mx-auto size-10 text-gold" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز تیکتی ثبت نشده</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">
            وقتی کاربری از پنلِ کاربری‌اش تیکت بسازد، همین‌جا دیده می‌شود.
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {pg.pageItems.map((m) => {
            const open = openId === m.id;
            const st = STATUS[m.status];
            return (
              <article key={m.id} className="admin-card overflow-hidden">
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-black text-gold dark:bg-gold dark:text-navy-deep">
                        {m.name.charAt(0)}
                      </span>
                      <div className="min-w-0">
                        <p className="flex items-center gap-2 font-black text-navy dark:text-ivory">
                          <span className="truncate">{m.name}</span>
                          <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-black", st.cls)}>{st.label}</span>
                        </p>
                        <p className="truncate text-sm font-bold text-navy/70 dark:text-ivory/70">{m.subject}</p>
                      </div>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-navy/40 dark:text-wheat">{m.createdAt}</span>
                  </div>

                  <div className="mt-3 space-y-2">
                    {m.replies.map((r, i) => (
                      <p
                        key={i}
                        className={cn(
                          "rounded-2xl px-4 py-3 text-sm leading-7",
                          r.from === "support"
                            ? "border border-gold/30 bg-gold/10 text-navy/90 dark:text-ivory/90"
                            : "bg-navy/[0.03] text-navy/80 dark:bg-white/[0.03] dark:text-ivory/80",
                        )}
                      >
                        <span className="mb-0.5 block text-[10px] font-black text-gold">{r.from === "support" ? "پشتیبانی" : "کاربر"}</span>
                        {r.text}
                      </p>
                    ))}
                  </div>

                  <div className="mt-3 flex justify-end gap-2">
                    {m.status === "closed" ? (
                      <Button type="button" variant="outline" size="sm" className="min-h-9 rounded-full" onClick={() => close(m.id, "open")}>
                        باز کردنِ دوباره
                      </Button>
                    ) : (
                      <Button type="button" variant="outline" size="sm" className="min-h-9 rounded-full" onClick={() => close(m.id, "closed")}>
                        <TicketCheck className="size-4" /> بستنِ تیکت
                      </Button>
                    )}
                    <Button
                      type="button"
                      variant={open ? "outline" : "navy"}
                      size="sm"
                      className="min-h-9 rounded-full"
                      onClick={() => setOpenId(open ? null : m.id)}
                    >
                      <Reply className="size-4" /> {open ? "بستن" : "پاسخ"}
                    </Button>
                  </div>
                </div>

                {open ? (
                  <div className="border-t border-navy/8 bg-navy/[0.02] p-4 dark:border-gold/15 dark:bg-white/[0.02] sm:p-5">
                    <label className="mb-2 flex items-center gap-1.5 text-xs font-black text-gold">
                      <Mail className="size-3.5" /> پاسخ به {m.name}
                    </label>
                    <div className="mb-2 flex flex-wrap gap-1.5">
                      {[
                        "سلام، ممنون از پیامتون 🙏",
                        "سفارش شما ارسال شد؛ کد رهگیری با پیامک براتون می‌آید.",
                        "این مدل موجود است و می‌تونید از فروشگاه ثبت سفارش کنید.",
                        "شمارهٔ سفارش‌تون را بفرستید تا بررسی کنم.",
                      ].map((t) => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setReply((r) => (r ? `${r}\n${t}` : t))}
                          className="rounded-full border border-navy/10 bg-white px-3 py-1.5 text-[11px] font-bold text-navy/65 transition hover:border-gold/50 hover:text-gold-deep dark:border-gold/20 dark:bg-navy-mid dark:text-wheat dark:hover:text-gold-soft"
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ… (با کلیک روی پیشنهادها پر می‌شود)" className="min-h-24 rounded-2xl" />
                    <div className="mt-2 flex justify-end">
                      <Button type="button" variant="navy" size="sm" className="min-h-9 rounded-full" onClick={() => send(m.id)}>
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

      <Pagination pg={pg} unit="تیکت" />
    </div>
  );
}
