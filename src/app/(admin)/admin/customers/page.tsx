"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CircleCheckBig,
  ShieldCheck,
  UsersRound,
  UserX,
} from "lucide-react";
import { toast } from "@/lib/toast";

import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  AdminTable,
  useAdmin,
} from "@/components/admin";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { AdminCustomer } from "@/types";
import { buildCustomerColumns } from "./_components/customer-columns";

const PER_PAGE = 8;

type RoleFilter = "all" | "user" | "admin";
type StatusFilter = "all" | "active" | "blocked";

export default function AdminCustomers() {
  const { db, saveCustomer, removeCustomer } = useAdmin();
  const [q, setQ] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [city, setCity] = useState("all");

  const cities = useMemo(
    () =>
      Array.from(
        new Set(db.customers.map((customer) => customer.city).filter(Boolean)),
      ).sort((a, b) => a.localeCompare(b, "fa")),
    [db.customers],
  );

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.customers.filter((customer) => {
      const customerRole = customer.role ?? "user";
      const customerStatus = customer.status ?? "فعال";
      const matchesSearch =
        !term ||
        `${customer.firstName} ${customer.lastName} ${customer.phone} ${customer.email} ${customer.city}`
          .toLocaleLowerCase("fa")
          .includes(term);
      const matchesRole = role === "all" || customerRole === role;
      const matchesStatus =
        status === "all" ||
        (status === "active"
          ? customerStatus === "فعال"
          : customerStatus === "مسدود");
      const matchesCity = city === "all" || customer.city === city;
      return matchesSearch && matchesRole && matchesStatus && matchesCity;
    });
  }, [city, db.customers, q, role, status]);

  const resetKey = `${q}|${role}|${status}|${city}`;
  const pg = usePagination(list, PER_PAGE, resetKey);
  const activeFilters =
    Number(!!q.trim()) +
    Number(role !== "all") +
    Number(status !== "all") +
    Number(city !== "all");
  const userCount = db.customers.filter(
    (customer) => (customer.role ?? "user") === "user",
  ).length;
  const adminCount = db.customers.filter(
    (customer) => customer.role === "admin",
  ).length;
  const blockedCount = db.customers.filter(
    (customer) => customer.status === "مسدود",
  ).length;

  function toggleStatus(customer: AdminCustomer) {
    if (customer.role === "admin")
      return toast.info("حساب مدیر اصلی محافظت‌شده است");
    const next = (customer.status ?? "فعال") === "فعال" ? "مسدود" : "فعال";
    saveCustomer({ ...customer, status: next });
    const toKind = next === "مسدود" ? toast.warning : toast.success;
    toKind(next === "مسدود" ? "حساب کاربر مسدود شد" : "مسدودی حساب رفع شد", {
      description: `${customer.firstName} ${customer.lastName}`,
    });
  }

  const cols = buildCustomerColumns({
    onToggleStatus: toggleStatus,
    onRemove: removeCustomer,
  });

  return (
    <div>
      <AdminPageHeader
        kicker="AUDIENCE"
        title="کاربران و مشتریان"
        description="مدیریت مشتریان، وضعیت حساب‌ها و سطح دسترسی اعضای تیم مدیریت."
      />

      <AdminStatStrip
        items={[
          {
            label: "کاربران فروشگاه",
            value: userCount,
            hint: "حساب مشتری",
            Icon: UsersRound,
            tone: "blue",
          },
          {
            label: "مدیران",
            value: adminCount,
            hint: "دسترسی کنسول",
            Icon: ShieldCheck,
            tone: "gold",
          },
          {
            label: "حساب‌های فعال",
            value: db.customers.length - blockedCount,
            Icon: CircleCheckBig,
            tone: "emerald",
          },
          { label: "مسدودشده", value: blockedCount, Icon: UserX, tone: "rose" },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام، موبایل، ایمیل یا شهر…"
        resultCount={list.length}
        resultLabel="حساب"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setRole("all");
          setStatus("all");
          setCity("all");
        }}
      >
        <AdminFilterSelect
          label="نوع حساب"
          value={role}
          onValueChange={(value) => setRole(value as RoleFilter)}
          options={[
            { value: "all", label: "همه حساب‌ها", count: db.customers.length },
            { value: "user", label: "کاربران", count: userCount },
            { value: "admin", label: "ادمین‌ها", count: adminCount },
          ]}
        />
        <AdminFilterSelect
          label="وضعیت حساب"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه وضعیت‌ها" },
            { value: "active", label: "فعال" },
            { value: "blocked", label: "مسدود" },
          ]}
        />
        <AdminFilterSelect
          label="شهر"
          value={city}
          onValueChange={setCity}
          options={[
            { value: "all", label: "همه شهرها" },
            ...cities.map((item) => ({ value: item, label: item })),
          ]}
        />
      </AdminFilterBar>

      <AdminTable
        cols={cols}
        rows={pg.pageItems}
        empty="کاربری مطابق فیلترهای انتخابی پیدا نشد."
        minWidth="62rem"
      />
      {list.length > 0 ? <Pagination pg={pg} unit="حساب" /> : null}
    </div>
  );
}
