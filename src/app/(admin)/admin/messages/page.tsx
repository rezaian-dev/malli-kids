"use client";

import { useState } from "react";
import { Mail, Phone, Reply, Send } from "lucide-react";
import { toast } from "sonner";
import { useAdmin } from "@/lib/admin-store";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/lib/use-pagination";
import { PageHead } from "@/components/admin/shell";

const PER_PAGE = 6;

export default function AdminMessages() {
  const { db } = useAdmin();
  const pg = usePagination(db.messages, PER_PAGE);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reply, setReply] = useState("");

  function send() {
    if (reply.trim().length < 2) return toast("متن پاسخ را بنویسید");
    setReply("");
    setOpenId(null);
    toast("ارسال پاسخ با راه‌اندازی backend فعال می‌شود");
  }

  return (
    <div>
      <PageHead kicker="INBOX" title="پیام‌های تماس" />
      <p className="mb-4 text-sm text-navy/50 dark:text-wheat">پیام‌های فرم «تماس با ما» را بخوانید و پاسخ دهید.</p>

      <div className="grid gap-3">
        {pg.pageItems.map((m) => {
          const open = openId === m.id;
          return (
            <article key={m.id} className={`admin-card overflow-hidden transition-shadow ${!m.read ? "ring-2 ring-gold/45" : ""}`}>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-black text-gold dark:bg-gold dark:text-navy-deep">{m.name.charAt(0)}</span>
                    <div>
                      <p className="flex items-center gap-2 font-black text-navy dark:text-ivory">
                        {m.name}
                        {!m.read ? <span className="size-2 rounded-full bg-gold" /> : null}
                      </p>
                      <p className="inline-flex items-center gap-1 text-[11px] font-bold text-navy/50 dark:text-wheat" dir="ltr">
                        <Phone className="size-3" /> {m.phone}
                      </p>
                    </div>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold text-navy/40 dark:text-wheat">{m.date}</span>
                </div>

                <p className="mt-3 rounded-2xl bg-navy/[0.03] px-4 py-3 text-sm leading-7 text-navy/80 dark:bg-white/[0.03] dark:text-ivory/80">{m.text}</p>

                <div className="mt-3 flex justify-end">
                  <Button type="button" variant={open ? "outline" : "navy"} size="sm" className="rounded-full" onClick={() => setOpenId(open ? null : m.id)}>
                    <Reply className="size-4" /> {open ? "بستن" : "پاسخ"}
                  </Button>
                </div>
              </div>

              {open ? (
                <div className="border-t border-navy/8 bg-navy/[0.02] p-4 dark:border-gold/15 dark:bg-white/[0.02] sm:p-5">
                  <label className="mb-2 flex items-center gap-1.5 text-xs font-black text-gold">
                    <Mail className="size-3.5" /> پاسخ به {m.name}
                  </label>
                  <Textarea value={reply} onChange={(e) => setReply(e.target.value)} placeholder="پاسخ خود را بنویسید…" className="min-h-24 rounded-2xl" />
                  <div className="mt-2 flex justify-end">
                    <Button type="button" variant="navy" size="sm" className="rounded-full" onClick={send}>
                      <Send className="size-4" /> ارسال پاسخ
                    </Button>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      <Pagination pg={pg} unit="پیام" />
    </div>
  );
}
