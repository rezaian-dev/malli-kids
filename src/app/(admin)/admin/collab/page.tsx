"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, Handshake, Tags } from "lucide-react";
import { toast } from "@/lib/toast";

import { Pagination } from "@/components/ui/pagination";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { usePagination } from "@/hooks/use-pagination";
import {
  COLLAB_KINDS,
  setCollabStatus,
  useCollabs,
  type CollabStatus,
} from "@/lib/collab";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import { CollabCard } from "./_components/collab-card";

const PER_PAGE = 6;
type StatusFilter = "all" | "waiting" | "contacted";

export default function AdminCollab() {
  const requests = useCollabs();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [kind, setKind] = useState("all");

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return requests.filter((request) => {
      const matchesSearch =
        !term ||
        `${request.name} ${request.phone} ${request.kind} ${request.text}`
          .toLocaleLowerCase("fa")
          .includes(term);
      const matchesStatus =
        status === "all" ||
        (status === "waiting"
          ? request.status === "در انتظار بررسی"
          : request.status === "تماس گرفته شد");
      const matchesKind = kind === "all" || request.kind === kind;
      return matchesSearch && matchesStatus && matchesKind;
    });
  }, [kind, q, requests, status]);

  const waiting = requests.filter(
    (request) => request.status === "در انتظار بررسی",
  ).length;
  const contacted = requests.length - waiting;
  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${kind}`);
  const activeFilters =
    Number(!!q.trim()) + Number(status !== "all") + Number(kind !== "all");

  function change(id: string, next: CollabStatus) {
    setCollabStatus(id, next);
    toast.success(
      next === "تماس گرفته شد"
        ? "درخواست به‌عنوان پیگیری‌شده ثبت شد"
        : "درخواست به صف بررسی بازگشت",
    );
  }

  return (
    <div>
      <AdminPageHeader
        kicker="PARTNERSHIP CRM"
        title="درخواست‌های همکاری"
        description="ارزیابی، دسته‌بندی و پیگیری فرصت‌های همکاری و ارتباطات تجاری."
      />

      <AdminStatStrip
        items={[
          {
            label: "کل درخواست‌ها",
            value: requests.length,
            Icon: Handshake,
            tone: "blue",
          },
          {
            label: "در انتظار بررسی",
            value: waiting,
            Icon: Clock3,
            tone: "rose",
          },
          {
            label: "تماس گرفته‌شده",
            value: contacted,
            Icon: CheckCircle2,
            tone: "emerald",
          },
          {
            label: "انواع همکاری",
            value: COLLAB_KINDS.length,
            Icon: Tags,
            tone: "gold",
          },
        ]}
      />

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="نام، شماره تماس یا متن درخواست…"
        resultCount={list.length}
        resultLabel="درخواست"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStatus("all");
          setKind("all");
        }}
      >
        <AdminFilterSelect
          label="وضعیت پیگیری"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه درخواست‌ها", count: requests.length },
            { value: "waiting", label: "در انتظار بررسی", count: waiting },
            { value: "contacted", label: "تماس گرفته شد", count: contacted },
          ]}
        />
        <AdminFilterSelect
          label="نوع همکاری"
          value={kind}
          onValueChange={setKind}
          options={[
            { value: "all", label: "همه موضوعات" },
            ...COLLAB_KINDS.map((item) => ({ value: item, label: item })),
          ]}
          className="xl:w-56"
        />
      </AdminFilterBar>

      {list.length === 0 ? (
        <div className={cn(adminGlassCard, "px-6 py-14 text-center")}>
          <span className="bg-gold/12 text-gold mx-auto grid size-14 place-items-center rounded-2xl">
            <Handshake className="size-6" />
          </span>
          <p className="text-navy dark:text-ivory mt-4 font-black">
            {requests.length === 0
              ? "هنوز درخواستی ثبت نشده"
              : "درخواستی مطابق فیلترها نیست"}
          </p>
          <p className="text-navy/50 dark:text-wheat mx-auto mt-1 max-w-xs text-xs leading-6">
            درخواست‌های فرم همکاری، همراه با وضعیت پیگیری، در این بخش مدیریت
            می‌شوند.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {pg.pageItems.map((request) => (
            <CollabCard
              key={request.id}
              request={request}
              onToggleStatus={() =>
                change(
                  request.id,
                  request.status === "در انتظار بررسی"
                    ? "تماس گرفته شد"
                    : "در انتظار بررسی",
                )
              }
            />
          ))}
        </div>
      )}

      {list.length > 0 ? <Pagination pg={pg} unit="درخواست" /> : null}
    </div>
  );
}
