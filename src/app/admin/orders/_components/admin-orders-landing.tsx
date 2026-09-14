"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Banknote, Clock3, PackageCheck, ShoppingBag } from "lucide-react";

import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  AdminTable,
} from "@/components/admin";
import { Pagination } from "@/components/ui/pagination";
import { ORDER_FLOW, isRevenueOrder } from "@/lib/shop/order-status";
import { usePagination } from "@/hooks/use-pagination";
import { usePolling } from "@/hooks/use-polling";
import { notifyAdminMutation } from "@/lib/admin/live";
import { formatToman } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { requestErrorMessage } from "@/lib/action-result";
import type { AdminOrder, OrderStatus } from "@/types";
import { getAllOrdersAction, setOrderStatusAction } from "../_lib/actions";
import { ORDER_COLUMNS } from "./order-columns";
import { OrderDetailSheet } from "./order-detail-sheet";

const PER_PAGE = 6;
// Orders move the sidebar badge — operational cadence, not content.
const POLL_MS = 8_000;
type StatusFilter = "all" | OrderStatus;
type SortFilter = "newest" | "amount-desc" | "amount-asc" | "items";

export function AdminOrdersLanding({ orders: initialOrders }: { orders: AdminOrder[] }) {
  const [all, setAll, refreshOrders] = usePolling(
    getAllOrdersAction,
    POLL_MS,
    initialOrders,
  );
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [city, setCity] = useState("all");
  const [sort, setSort] = useState<SortFilter>("newest");
  const [open, setOpen] = useState<AdminOrder | null>(null);
  useEffect(() => {
    setOpen((current) =>
      current ? (all.find((order) => order.id === current.id) ?? current) : null,
    );
  }, [all]);

  function applyOrder(order: AdminOrder) {
    setAll((current) => current.map((item) => (item.id === order.id ? order : item)));
    setOpen(order);
    refreshOrders();
    notifyAdminMutation();
  }

  const cities = useMemo(
    () =>
      Array.from(new Set(all.map((order) => order.city).filter(Boolean))).sort((a, b) =>
        a.localeCompare(b, "fa"),
      ),
    [all],
  );
  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return all
      .filter((order) => {
        const matchesSearch =
          !term ||
          `${order.id} ${order.customer} ${order.phone} ${order.city}`
            .toLocaleLowerCase("fa")
            .includes(term);
        const matchesStatus = status === "all" || order.status === status;
        const matchesCity = city === "all" || order.city === city;
        return matchesSearch && matchesStatus && matchesCity;
      })
      .sort((a, b) => {
        if (sort === "amount-desc") return b.total - a.total;
        if (sort === "amount-asc") return a.total - b.total;
        if (sort === "items")
          return (
            b.items.reduce((sum, item) => sum + item.qty, 0) -
            a.items.reduce((sum, item) => sum + item.qty, 0)
          );
        return b.id.localeCompare(a.id, "fa");
      });
  }, [all, city, q, sort, status]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${city}|${sort}`);
  const activeFilters =
    Number(!!q.trim()) +
    Number(status !== "all") +
    Number(city !== "all") +
    Number(sort !== "newest");
  const totalSales = all
    .filter(isRevenueOrder)
    .reduce((sum, order) => sum + order.total, 0);
  const newCount = all.filter((order) => order.status === "جدید").length;
  const inProgress = all.filter(
    (order) => order.status === "در حال آماده‌سازی" || order.status === "ارسال‌شده",
  ).length;
  const completed = all.filter((order) => order.status === "تحویل‌شده").length;

  return (
    <div>
      <AdminPageHeader
        kicker="ORDERS"
        title="مدیریت سفارش‌ها"
        description="پیگیری یکپارچه سفارش‌ها از لحظه ثبت تا پردازش، ارسال و تحویل نهایی."
      />

      <AdminStatStrip
        items={[
          { label: "سفارش جدید", value: newCount, Icon: Clock3, tone: "rose" },
          {
            label: "در حال پردازش",
            value: inProgress,
            Icon: ShoppingBag,
            tone: "gold",
          },
          {
            label: "تحویل‌شده",
            value: completed,
            Icon: PackageCheck,
            tone: "emerald",
          },
          {
            label: "پرداخت تأییدشده",
            value: `${formatToman(totalSales)} ت`,
            Icon: Banknote,
            tone: "blue",
          },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="شناسه، مشتری، موبایل یا شهر…"
        resultCount={list.length}
        resultLabel="سفارش"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStatus("all");
          setCity("all");
          setSort("newest");
        }}
      >
        <AdminFilterSelect
          label="وضعیت سفارش"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه وضعیت‌ها", count: all.length },
            ...ORDER_FLOW.map((item) => ({
              value: item,
              label: item,
              count: all.filter((order) => order.status === item).length,
            })),
          ]}
        />
        <AdminFilterSelect
          label="شهر مقصد"
          value={city}
          onValueChange={setCity}
          options={[
            { value: "all", label: "همه شهرها" },
            ...cities.map((item) => ({ value: item, label: item })),
          ]}
        />
        <AdminFilterSelect
          label="مرتب‌سازی"
          value={sort}
          onValueChange={(value) => setSort(value as SortFilter)}
          options={[
            { value: "newest", label: "جدیدترین" },
            { value: "amount-desc", label: "بیشترین مبلغ" },
            { value: "amount-asc", label: "کمترین مبلغ" },
            { value: "items", label: "بیشترین اقلام" },
          ]}
        />
      </AdminFilterBar>

      <AdminTable<AdminOrder>
        cols={ORDER_COLUMNS}
        rows={pg.pageItems}
        empty="سفارشی مطابق فیلترهای انتخابی وجود ندارد."
        onRowClick={setOpen}
        minWidth="59rem"
      />
      {list.length > 0 ? <Pagination pg={pg} unit="سفارش" /> : null}

      <OrderDetailSheet
        order={open}
        onOpenChange={(value) => !value && setOpen(null)}
        onChanged={applyOrder}
        busy={pending}
        onStatusChange={(next) => {
          if (!open || pending) return;
          const current = open;
          startTransition(async () => {
            try {
              const result = await setOrderStatusAction(current.id, next);
              if (result.ok) {
                applyOrder(result.data);
                toast.success("وضعیت سفارش تغییر کرد", { description: next });
              } else {
                refreshOrders();
                toast.error(result.error);
              }
            } catch {
              toast.error(requestErrorMessage());
            }
          });
        }}
      />
    </div>
  );
}
