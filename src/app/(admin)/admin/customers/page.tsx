"use client";

import { useMemo, useState } from "react";
import { Ban, CircleCheckBig, Mail, Phone, Search, Trash2 } from "lucide-react";
import { formatToman, toFaDigits } from "@/lib/format";
import { useAdmin } from "@/features/admin";
import { AdminTable, type AdminCol } from "@/features/admin/components/admin-table";
import { Input } from "@/components/ui/input";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { PageHead } from "@/features/admin";
import { toast } from "sonner";
import type { AdminCustomer } from "@/types";

const PER_PAGE = 8;

export default function AdminCustomers() {
  const { db, saveCustomer, removeCustomer } = useAdmin();
  const [q, setQ] = useState("");

  const list = useMemo(() => {
    const t = q.trim();
    if (!t) return db.customers;
    return db.customers.filter(
      (c) => `${c.firstName} ${c.lastName}`.includes(t) || c.phone.includes(t) || c.email.includes(t) || (c.city || "").includes(t),
    );
  }, [db.customers, q]);

  const pg = usePagination(list, PER_PAGE, q);

  const cols: AdminCol<AdminCustomer>[] = [
    {
      key: "name",
      title: "مشتری",
      width: "1.6fr",
      render: (c) => (
        <div className="flex items-center gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-full bg-navy font-black text-gold dark:bg-gold dark:text-navy-deep">
            {c.firstName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate" title={`${c.firstName} ${c.lastName}`}>
              {c.firstName} {c.lastName}
            </p>
            <p className="text-[11px] font-bold text-navy/40 dark:text-wheat">{c.city}</p>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      title: "موبایل",
      width: "9.5rem",
      render: (c) => (
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap" dir="ltr">
          <Phone className="size-3.5 shrink-0 text-gold lg:hidden" /> {c.phone}
        </span>
      ),
    },
    {
      key: "email",
      title: "ایمیل",
      width: "1.5fr",
      render: (c) => (
        <span className="inline-flex max-w-full items-center gap-1.5 truncate" dir="ltr">
          <Mail className="size-3.5 shrink-0 text-gold lg:hidden" />
          <span className="truncate font-semibold text-navy/60 dark:text-wheat" title={c.email}>{c.email || "—"}</span>
        </span>
      ),
    },
    { key: "orders", title: "سفارش‌ها", width: "5.5rem", align: "center", render: (c) => toFaDigits(c.orders) },
    {
      key: "spent",
      title: "مجموع خرید",
      width: "8.5rem",
      align: "center",
      render: (c) => <span className="whitespace-nowrap font-black text-gold-deep dark:text-gold-soft">{formatToman(c.spent)}</span>,
    },
    {
      key: "status",
      title: "وضعیت",
      width: "6.5rem",
      align: "center",
      render: (c) =>
        (c.status ?? "فعال") === "فعال" ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-black text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <CircleCheckBig className="size-3" /> فعال
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-pale px-2.5 py-1 text-[10px] font-black text-rose dark:bg-rose/15">
            <Ban className="size-3" /> مسدود
          </span>
        ),
    },
    {
      key: "actions",
      title: "اقدام",
      width: "6.5rem",
      align: "end",
      renderMobile: (c) => (
        <div className="flex items-center justify-end gap-2 whitespace-nowrap">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              const next = (c.status ?? "فعال") === "فعال" ? "مسدود" : "فعال";
              saveCustomer({ ...c, status: next });
              toast(next === "مسدود" ? "مشتری مسدود شد" : "مسدودی رفع شد", { description: `${c.firstName} ${c.lastName}` });
            }}
            className={`inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[11px] font-black transition ${
              (c.status ?? "فعال") === "فعال"
                ? "border-navy/12 text-navy/70 hover:border-amber-400 hover:text-amber-600 dark:border-gold/25 dark:text-wheat dark:hover:text-amber-400"
                : "border-emerald-400/50 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300"
            }`}
          >
            <Ban className="size-3.5" /> {(c.status ?? "فعال") === "فعال" ? "مسدود" : "رفع مسدودی"}
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeCustomer(c.id);
            }}
            className="inline-flex min-h-9 items-center gap-1.5 rounded-full bg-rose-pale px-3.5 py-1.5 text-[11px] font-black text-rose transition hover:bg-rose/15 dark:bg-rose/15"
          >
            <Trash2 className="size-3.5" /> حذف
          </button>
        </div>
      ),
      render: (c) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title={(c.status ?? "فعال") === "فعال" ? "مسدود کردن" : "رفع مسدودی"}
            aria-label={(c.status ?? "فعال") === "فعال" ? "مسدود کردن" : "رفع مسدودی"}
            onClick={(e) => {
              e.stopPropagation();
              const next = (c.status ?? "فعال") === "فعال" ? "مسدود" : "فعال";
              saveCustomer({ ...c, status: next });
              toast(next === "مسدود" ? "مشتری مسدود شد" : "مسدودی رفع شد", { description: `${c.firstName} ${c.lastName}` });
            }}
            className={`grid size-9 shrink-0 place-items-center rounded-xl border transition ${
              (c.status ?? "فعال") === "فعال"
                ? "border-navy/12 text-navy/60 hover:border-amber-400 hover:text-amber-600 dark:border-gold/25 dark:text-wheat dark:hover:text-amber-400"
                : "border-emerald-400/50 text-emerald-600 hover:bg-emerald-50 dark:text-emerald-300"
            }`}
          >
            <Ban className="size-4" />
          </button>
          <button
            type="button"
            title="حذف مشتری"
            aria-label="حذف مشتری"
            onClick={(e) => {
              e.stopPropagation();
              removeCustomer(c.id);
            }}
            className="grid size-9 shrink-0 place-items-center rounded-xl bg-rose-pale text-rose transition hover:bg-rose/15 dark:bg-rose/15"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHead kicker="MOTHERS" title="مشتریان" />

      <div className="relative mb-4 max-w-md">
        <Search className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-gold" />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="جستجوی نام، موبایل یا ایمیل…" className="h-11 rounded-2xl pe-10" />
      </div>
      <p className="mb-3 text-xs font-bold text-navy/45 dark:text-wheat">{toFaDigits(list.length)} مشتری</p>

      <AdminTable cols={cols} rows={pg.pageItems} empty="مشتری‌ای مطابق جستجو یافت نشد." minWidth="56rem" />

      {list.length > 0 ? <Pagination pg={pg} unit="مشتری" /> : null}
    </div>
  );
}
