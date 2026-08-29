"use client";

import { Handshake, Phone, PhoneCall, RotateCcw } from "lucide-react";
import { PageHead } from "@/features/admin";
import { Button } from "@/components/ui/button";
import { setCollabStatus, useCollabs } from "@/lib/collab";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

/** درخواست‌های همکاریِ ثبت‌شده از صفحهٔ «همکاری» */
export default function AdminCollab() {
  const list = useCollabs();

  return (
    <div>
      <PageHead kicker="COLLAB" title="درخواست‌های همکاری" />
      <p className="mb-4 text-sm text-navy/50 dark:text-wheat">فرمِ صفحهٔ «همکاری» این‌جا می‌نشیند؛ پس از تماس، وضعیت را عوض کنید.</p>

      {list.length === 0 ? (
        <div className="admin-card px-6 py-14 text-center">
          <Handshake className="mx-auto size-10 text-gold" />
          <p className="mt-3 font-black text-navy dark:text-ivory">هنوز درخواستی نیست</p>
          <p className="mx-auto mt-1 max-w-xs text-xs leading-6 text-navy/50 dark:text-wheat">وقتی کسی از صفحهٔ «همکاری» فرم بفرستد، این‌جا دیده می‌شود.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {list.map((r) => (
            <article key={r.id} className="admin-card p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-black text-gold dark:bg-gold dark:text-navy-deep">
                    {r.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-black text-navy dark:text-ivory">{r.name}</p>
                    <p className="inline-flex items-center gap-1 text-[11px] font-bold text-navy/50 dark:text-wheat" dir="ltr">
                      <Phone className="size-3" /> {r.phone}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-[10px] font-black",
                    r.status === "در انتظار بررسی" ? "bg-gold/15 text-gold" : "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300",
                  )}
                >
                  {r.status}
                </span>
              </div>

              <p className="mt-2 inline-block rounded-full bg-navy/5 px-3 py-1 text-[10px] font-black text-navy/60 dark:bg-white/5 dark:text-ivory/60">{r.kind}</p>
              <p className="mt-2 rounded-2xl bg-navy/[0.03] px-4 py-3 text-sm leading-7 text-navy/80 dark:bg-white/[0.03] dark:text-ivory/80">{r.text}</p>
              <p className="mt-2 text-[10px] font-bold text-navy/40 dark:text-wheat">{r.at}</p>

              <div className="mt-3 flex justify-end">
                {r.status === "در انتظار بررسی" ? (
                  <Button
                    type="button"
                    variant="navy"
                    size="sm"
                    className="min-h-9 rounded-full"
                    onClick={() => {
                      setCollabStatus(r.id, "تماس گرفته شد");
                      toast.success("وضعیت به «تماس گرفته شد» تغییر کرد");
                    }}
                  >
                    <PhoneCall className="size-4" /> تماس گرفته شد
                  </Button>
                ) : (
                  <Button type="button" variant="outline" size="sm" className="min-h-9 rounded-full" onClick={() => setCollabStatus(r.id, "در انتظار بررسی")}>
                    <RotateCcw className="size-4" /> برگشت به انتظار
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
