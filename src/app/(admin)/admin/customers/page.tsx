"use client";

import { useMemo, useState } from "react";
import { Ban, Mail, Phone, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { formatToman, toFaDigits } from "@/lib/format";
import { useAdmin } from "@/features/admin";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";

const PER_PAGE = 8;
const SOON = () => toast("این بخش با راه‌اندازی backend فعال می‌شود");

export default function AdminCustomers() {
  const { db } = useAdmin();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const t = q.trim();
    if (!t) return db.customers;
    return db.customers.filter(
      (c) => `${c.firstName} ${c.lastName}`.includes(t) || c.phone.includes(t) || c.email.includes(t) || (c.city || "").includes(t),
    );
  }, [db.customers, q]);

  const pg = usePagination(list, PER_PAGE, q);

  return (
    <div>
      <PageHead kicker="MOTHERS" title="مشتریان" />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gold" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نام، موبایل یا ایمیل…" className="h-11 rounded-2xl pe-10" />
      </div>
      <p className="mb-3 text-xs font-bold text-navy/45 dark:text-wheat">{toFaDigits(list.length)} مشتری</p>

      <div className="admin-card overflow-hidden">
        {/* Table header (desktop) */}
        <div className="hidden border-b border-navy/8 bg-navy/[0.03] px-5 py-3 text-[11px] font-black text-navy/50 dark:border-gold/15 dark:bg-white/[0.03] dark:text-wheat lg:grid lg:grid-cols-[1.6fr_1.1fr_1.7fr_0.7fr_0.9fr_11rem] lg:gap-4">
          <span>مشتری</span>
          <span>موبایل</span>
          <span>ایمیل</span>
          <span className="text-center">سفارش‌ها</span>
          <span className="text-center">مجموع خرید</span>
          <span className="text-end">اقدام</span>
        </div>

        <ul className="divide-y divide-navy/6 dark:divide-gold/10">
          {pg.pageItems.map((c) => (
            <li
              key={c.id}
              className="grid grid-cols-1 gap-3 p-4 transition-colors hover:bg-navy/[0.02] dark:hover:bg-white/[0.02] lg:grid-cols-[1.6fr_1.1fr_1.7fr_0.7fr_0.9fr_11rem] lg:items-center lg:gap-4 lg:px-5"
            >
              {/* name + avatar */}
              <div className="flex items-center gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-black text-gold dark:bg-gold dark:text-navy-deep">{c.firstName.charAt(0)}</span>
                <div className="min-w-0">
                  <p className="truncate font-black text-navy dark:text-ivory">
                    {c.firstName} {c.lastName}
                  </p>
                  <p className="text-[11px] text-navy/40 dark:text-wheat">{c.city}</p>
                </div>
              </div>

              {/* phone */}
              <p className="inline-flex items-center gap-1.5 text-sm font-bold text-navy/80 dark:text-ivory/85" dir="ltr">
                <Phone className="size-3.5 shrink-0 text-gold lg:hidden" /> {c.phone}
              </p>

              {/* email */}
              <p className="inline-flex items-center gap-1.5 truncate text-sm text-navy/60 dark:text-wheat" dir="ltr">
                <Mail className="size-3.5 shrink-0 text-gold lg:hidden" /> {c.email || "—"}
              </p>

              {/* orders */}
              <p className="text-sm font-black text-navy dark:text-ivory lg:text-center">
                <span className="text-[11px] font-bold text-navy/40 dark:text-wheat lg:hidden">سفارش‌ها: </span>
                {toFaDigits(c.orders)}
              </p>

              {/* spent */}
              <p className="text-sm font-black text-gold lg:text-center">
                <span className="text-[11px] font-bold text-navy/40 dark:text-wheat lg:hidden">مجموع: </span>
                {formatToman(c.spent)}
              </p>

              {/* actions */}
              <div className="flex items-center gap-2 lg:justify-end">
                <button
                  type="button"
                  onClick={SOON}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-navy/12 px-3.5 py-1.5 text-[11px] font-black text-navy/70 transition hover:border-amber-400 hover:text-amber-600 dark:border-gold/25 dark:text-wheat dark:hover:text-amber-400"
                >
                  <Ban className="size-3.5" /> مسدود
                </button>
                <button
                  type="button"
                  onClick={SOON}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-rose-pale px-3.5 py-1.5 text-[11px] font-black text-rose transition hover:bg-rose/15 dark:bg-rose/15"
                >
                  <Trash2 className="size-3.5" /> حذف
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {list.length === 0 ? (
        <p className="admin-card mt-3 p-8 text-center text-sm font-bold text-navy/45 dark:text-wheat">مشتری‌ای مطابق جستجو یافت نشد.</p>
      ) : (
        <Pagination pg={pg} unit="مشتری" />
      )}
    </div>
  );
}
