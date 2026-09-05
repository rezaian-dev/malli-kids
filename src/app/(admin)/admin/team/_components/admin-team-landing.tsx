"use client";

import { useMemo, useState, useTransition } from "react";
import { Crown, ShieldCheck, UserPlus } from "lucide-react";

import {
  AdminConfirmDialog,
  AdminFilterBar,
  AdminPageHeader,
  AdminStatStrip,
} from "@/components/admin";
import { Button } from "@/components/ui/button";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type { AdminCustomer } from "@/types";
import {
  demoteAdminAction,
  promoteCustomerAction,
} from "../../customers/_lib/actions";

export function AdminTeamLanding({ customers }: { customers: AdminCustomer[] }) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");

  const admins = useMemo(
    () => customers.filter((customer) => customer.role === "admin"),
    [customers],
  );
  const candidates = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    if (!term) return [];
    return customers
      .filter((customer) => customer.role !== "admin")
      .filter((customer) =>
        `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone}`
          .toLocaleLowerCase("fa")
          .includes(term),
      )
      .slice(0, 8);
  }, [customers, q]);

  const isLastAdmin = admins.length <= 1;

  function promote(customer: AdminCustomer) {
    startTransition(async () => {
      const result = await promoteCustomerAction(customer.id);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("دسترسیِ ادمین اعطا شد ✨", {
        description: `${customer.firstName} ${customer.lastName}`,
      });
      setQ("");
    });
  }

  return (
    <div>
      <AdminPageHeader
        kicker="TEAM"
        title="تیم مدیریت"
        description="ادمین‌های فعلی فروشگاه و ارتقای اعضای جدید — همیشه حداقل یک ادمین باید باقی بماند."
      />

      <AdminStatStrip
        items={[
          {
            label: "کل ادمین‌ها",
            value: admins.length,
            Icon: ShieldCheck,
            tone: "gold",
          },
        ]}
      />

      <div className={cn(adminGlassCard, "mb-5 p-4 sm:p-5")}>
        <h2 className="text-gold mb-3 text-sm font-black">ارتقای عضو جدید</h2>
        <AdminFilterBar
          search={q}
          onSearchChange={setQ}
          searchPlaceholder="جستجوی نام، ایمیل یا موبایل کاربر…"
          resultCount={candidates.length}
          resultLabel="کاربر"
          activeCount={0}
          onReset={() => setQ("")}
        />
        {q.trim() ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {candidates.length === 0 ? (
              <p className="text-navy/70 dark:text-wheat text-xs font-bold">
                کاربری مطابق جستجو پیدا نشد.
              </p>
            ) : (
              candidates.map((customer) => (
                <div
                  key={customer.id}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-xl border px-3 py-2",
                    "border-navy/8 dark:border-gold/16",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-black">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-navy/70 dark:text-wheat truncate text-[10px]" dir="ltr">
                      {customer.email}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    className="h-9 shrink-0 rounded-xl px-2.5 text-[10px]"
                    onClick={() => promote(customer)}
                  >
                    <UserPlus className="size-3.5" /> ارتقا
                  </Button>
                </div>
              ))
            )}
          </div>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
        {admins.map((admin) => (
          <article key={admin.id} className={cn(adminGlassCard, "p-4")}>
            <div className="flex items-center gap-3">
              <span className="bg-gold text-navy-deep grid size-10 shrink-0 place-items-center rounded-xl">
                <Crown className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-black">
                  {admin.firstName} {admin.lastName}
                </p>
                <p className="text-navy/70 dark:text-wheat truncate text-[10px]" dir="ltr">
                  {admin.email}
                </p>
              </div>
            </div>
            <div className="mt-3">
              {isLastAdmin ? (
                <p
                  title="امکان تنزل آخرین ادمین وجود ندارد"
                  className="text-navy/60 dark:text-wheat/70 rounded-xl border border-dashed px-3 py-2 text-center text-[10px] font-bold"
                >
                  آخرین ادمین — قابل تنزل نیست
                </p>
              ) : (
                <AdminConfirmDialog
                  title="تنزل این ادمین؟"
                  description={`دسترسی مدیریتی «${admin.firstName} ${admin.lastName}» گرفته می‌شود و به کاربر عادی تبدیل می‌شود.`}
                  confirmLabel="تنزل"
                  successMessage="ادمین تنزل یافت"
                  onConfirm={() => demoteAdminAction(admin.id)}
                  trigger={
                    <button
                      type="button"
                      className="bg-rose/10 text-rose hover:bg-rose/15 w-full rounded-xl px-3 py-2 text-[11px] font-black transition"
                    >
                      تنزل به کاربر عادی
                    </button>
                  }
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
