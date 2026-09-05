"use client";

import { useMemo, useState } from "react";
import { History } from "lucide-react";

import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminPageHeader,
  AdminTable,
  type AdminCol,
} from "@/components/admin";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { AuditEntry } from "../_lib/data";

const PER_PAGE = 12;

const ACTION_LABEL: Record<string, string> = {
  "role.promote": "ارتقا به ادمین",
  "role.demote": "تنزل ادمین",
  "customer.ban": "مسدودسازی کاربر",
  "customer.unban": "رفع مسدودی کاربر",
  "customer.remove": "حذف کاربر",
  "order.status": "تغییر وضعیت سفارش",
  "banner.publish": "انتشار بنر",
  "coupon.active": "فعال/غیرفعال‌سازی کد تخفیف",
  "product.price": "تغییر قیمت محصول",
  "product.remove": "حذف محصول",
  "review.remove": "حذف نظر",
};

export function AdminAuditLanding({ entries }: { entries: AuditEntry[] }) {
  const [q, setQ] = useState("");
  const [action, setAction] = useState("all");

  const actions = useMemo(
    () => Array.from(new Set(entries.map((entry) => entry.action))),
    [entries],
  );

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return entries.filter((entry) => {
      const matchesSearch =
        !term ||
        `${entry.summary} ${entry.actorName} ${entry.actorEmail}`
          .toLocaleLowerCase("fa")
          .includes(term);
      const matchesAction = action === "all" || entry.action === action;
      return matchesSearch && matchesAction;
    });
  }, [action, entries, q]);

  const pg = usePagination(list, PER_PAGE, `${q}|${action}`);
  const activeFilters = Number(!!q.trim()) + Number(action !== "all");

  const cols: AdminCol<AuditEntry>[] = [
    {
      key: "date",
      title: "زمان",
      width: "9rem",
      render: (entry) => (
        <span className="text-navy/70 dark:text-wheat text-[11px] font-bold whitespace-nowrap">
          {entry.date}
        </span>
      ),
    },
    {
      key: "actor",
      title: "انجام‌دهنده",
      width: "1fr",
      hideTablet: true,
      render: (entry) => (
        <div className="min-w-0">
          <p className="truncate">{entry.actorName}</p>
          <p className="text-navy/70 dark:text-wheat truncate text-[10px]" dir="ltr">
            {entry.actorEmail}
          </p>
        </div>
      ),
    },
    {
      key: "action",
      title: "عملیات",
      width: "10rem",
      render: (entry) => (
        <span className="bg-gold/12 text-gold-deep dark:text-gold-soft inline-flex rounded-lg px-2 py-1 text-[10px] font-black">
          {ACTION_LABEL[entry.action] ?? entry.action}
        </span>
      ),
    },
    {
      key: "summary",
      title: "شرح",
      width: "2fr",
      render: (entry) => (
        <span className="text-navy dark:text-ivory">{entry.summary}</span>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader
        kicker="AUDIT"
        title="تاریخچه عملیات حساس"
        description="ثبت خودکار تغییرات نقش، قیمت، وضعیت سفارش و انتشار کمپین‌ها — فقط عملیات حساس، نه هر رویداد."
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام، ایمیل یا شرح عملیات…"
        resultCount={list.length}
        resultLabel="رویداد"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setAction("all");
        }}
      >
        <AdminFilterSelect
          label="نوع عملیات"
          value={action}
          onValueChange={setAction}
          options={[
            { value: "all", label: "همه عملیات‌ها" },
            ...actions.map((item) => ({
              value: item,
              label: ACTION_LABEL[item] ?? item,
            })),
          ]}
        />
      </AdminFilterBar>

      <AdminTable
        cols={cols}
        rows={pg.pageItems}
        empty="هنوز رویداد حساسی ثبت نشده."
        minWidth="52rem"
        header={
          entries.length === 0 ? (
            <div className="flex items-center gap-2 text-[11px] font-bold opacity-70">
              <History className="size-3.5" /> این فهرست فقط عملیات حساس را نشان می‌دهد.
            </div>
          ) : undefined
        }
      />
      {list.length > 0 ? <Pagination pg={pg} unit="رویداد" /> : null}
    </div>
  );
}
