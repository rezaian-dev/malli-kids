import {
  Ban,
  CircleCheckBig,
  Mail,
  Phone,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";
import type { AdminCol } from "@/components/admin";
import { formatToman, toFaDigits } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { AdminCustomer } from "@/types";

/** 🧱 The customer table column set — a plain builder (not a hook) so it
 *  can stay a Server-Component-clean file; `page.tsx` owns the callbacks. */
export function buildCustomerColumns({
  onToggleStatus,
  onRemove,
}: {
  onToggleStatus: (customer: AdminCustomer) => void;
  onRemove: (id: string) => void;
}): AdminCol<AdminCustomer>[] {
  return [
    {
      key: "name",
      title: "کاربر",
      width: "1.55fr",
      render: (customer) => (
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={cn(
              "grid size-10 shrink-0 place-items-center rounded-xl font-black",
              customer.role === "admin"
                ? "bg-gold text-navy-deep"
                : "bg-navy text-gold dark:bg-gold/15 dark:text-gold-soft",
            )}
          >
            {customer.role === "admin" ? (
              <ShieldCheck className="size-4" />
            ) : (
              customer.firstName.charAt(0)
            )}
          </span>
          <div className="min-w-0">
            <p
              className="truncate"
              title={`${customer.firstName} ${customer.lastName}`}
            >
              {customer.firstName} {customer.lastName}
            </p>
            <p
              className={cn(
                "mt-0.5 truncate text-[10px] font-bold",
                "text-navy/40",
                "dark:text-wheat",
              )}
            >
              {customer.city} · عضویت {customer.joined}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "نقش",
      width: "6.5rem",
      align: "center",
      render: (customer) =>
        customer.role === "admin" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black",
              "bg-gold/15 text-gold-deep",
              "dark:text-gold-soft",
            )}
          >
            <ShieldCheck className="size-3" /> ادمین
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black",
              "bg-sky-500/10 text-sky-700",
              "dark:text-sky-300",
            )}
          >
            <UserRound className="size-3" /> کاربر
          </span>
        ),
    },
    {
      key: "contact",
      title: "اطلاعات تماس",
      width: "1.45fr",
      render: (customer) => (
        <div className="min-w-0 space-y-1.5 text-start">
          <span
            className="flex w-max max-w-full items-center gap-1.5 text-xs font-extrabold whitespace-nowrap"
            dir="ltr"
          >
            <Phone className="text-gold size-3.5 shrink-0" /> {customer.phone}
          </span>
          <span
            className={cn(
              "flex w-max max-w-full items-center gap-1.5 text-[11px] font-bold",
              "text-navy/65",
              "dark:text-wheat",
            )}
            dir="ltr"
          >
            <Mail className="text-gold size-3.5 shrink-0" />
            <span className="truncate" title={customer.email}>
              {customer.email || "—"}
            </span>
          </span>
        </div>
      ),
    },
    {
      key: "orders",
      title: "سفارش",
      width: "4.5rem",
      align: "center",
      hideTablet: true,
      render: (customer) =>
        customer.role === "admin" ? "—" : toFaDigits(customer.orders),
    },
    {
      key: "spent",
      title: "مجموع خرید",
      width: "8rem",
      hideTablet: true,
      align: "center",
      render: (customer) => (
        <span className="text-gold-deep dark:text-gold-soft font-black whitespace-nowrap">
          {customer.role === "admin" ? "—" : formatToman(customer.spent)}
        </span>
      ),
    },
    {
      key: "status",
      title: "وضعیت",
      width: "6rem",
      align: "center",
      render: (customer) =>
        (customer.status ?? "فعال") === "فعال" ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black",
              "bg-emerald-500/10 text-emerald-700",
              "dark:text-emerald-300",
            )}
          >
            <CircleCheckBig className="size-3" /> فعال
          </span>
        ) : (
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black",
              "bg-rose/10 text-rose",
            )}
          >
            <Ban className="size-3" /> مسدود
          </span>
        ),
    },
    {
      key: "actions",
      title: "عملیات",
      width: "6.5rem",
      align: "end",
      renderMobile: (customer) =>
        customer.role === "admin" ? (
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2 text-[10px] font-black",
              "bg-gold/8 text-gold-deep",
              "dark:text-gold-soft",
            )}
          >
            <ShieldCheck className="size-3.5" /> حساب مدیر محافظت‌شده
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onToggleStatus(customer);
              }}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl border px-2 text-[10px] font-black transition",
                "border-navy/10 text-navy hover:border-gold",
                "dark:border-gold/20 dark:text-wheat",
              )}
            >
              {(customer.status ?? "فعال") === "فعال" ? (
                <Ban className="size-3.5" />
              ) : (
                <CircleCheckBig className="size-3.5" />
              )}{" "}
              {(customer.status ?? "فعال") === "فعال"
                ? "مسدودکردن"
                : "رفع مسدودی"}
            </button>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(customer.id);
              }}
              className={cn(
                "inline-flex min-h-9 items-center justify-center gap-1.5 rounded-xl px-2 text-[10px] font-black transition",
                "bg-rose/10 text-rose hover:bg-rose/15",
              )}
            >
              <Trash2 className="size-3.5" /> حذف کاربر
            </button>
          </div>
        ),
      render: (customer) =>
        customer.role === "admin" ? (
          <span
            title="حساب مدیر محافظت‌شده"
            className="bg-gold/10 text-gold ms-auto grid size-9 place-items-center rounded-xl"
          >
            <ShieldCheck className="size-4" />
          </span>
        ) : (
          <div className="flex items-center justify-end gap-1.5">
            <button
              type="button"
              title={
                (customer.status ?? "فعال") === "فعال"
                  ? "مسدودکردن"
                  : "رفع مسدودی"
              }
              aria-label={
                (customer.status ?? "فعال") === "فعال"
                  ? "مسدودکردن"
                  : "رفع مسدودی"
              }
              onClick={(event) => {
                event.stopPropagation();
                onToggleStatus(customer);
              }}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl border transition",
                "border-navy/10 text-navy/60 hover:border-gold hover:text-gold-deep",
                "dark:border-gold/20 dark:text-wheat",
              )}
            >
              {(customer.status ?? "فعال") === "فعال" ? (
                <Ban className="size-4" />
              ) : (
                <CircleCheckBig className="size-4" />
              )}
            </button>
            <button
              type="button"
              title="حذف کاربر"
              aria-label="حذف کاربر"
              onClick={(event) => {
                event.stopPropagation();
                onRemove(customer.id);
              }}
              className={cn(
                "grid size-9 shrink-0 place-items-center rounded-xl transition",
                "bg-rose/10 text-rose hover:bg-rose/15",
              )}
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        ),
    },
  ];
}
