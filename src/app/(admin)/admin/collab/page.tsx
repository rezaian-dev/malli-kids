"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Handshake,
  Phone,
  PhoneCall,
  RotateCcw,
  Tags,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
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
        <div className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 rounded-[22px] border px-6 py-14 text-center shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]">
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
          {pg.pageItems.map((request, index) => (
            <article
              key={request.id}
              className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 relative overflow-hidden rounded-[22px] border p-4 shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] sm:p-5 dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <span
                className={cn(
                  "absolute inset-y-0 inset-s-0 w-1",
                  request.status === "در انتظار بررسی"
                    ? "bg-amber-400"
                    : "bg-emerald-500",
                )}
              />
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="bg-navy text-gold dark:bg-gold/15 dark:text-gold-soft grid size-10 shrink-0 place-items-center rounded-xl font-black">
                    {request.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-navy dark:text-ivory truncate text-sm font-black">
                      {request.name}
                    </p>
                    <a
                      href={`tel:${request.phone}`}
                      className="text-navy/45 hover:text-gold dark:text-wheat mt-0.5 inline-flex items-center gap-1 text-[10px] font-bold"
                      dir="ltr"
                    >
                      <Phone className="size-3" /> {request.phone}
                    </a>
                  </div>
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-lg px-2 py-1 text-[9px] font-black",
                    request.status === "در انتظار بررسی"
                      ? "bg-amber-500/12 text-amber-700 dark:text-amber-300"
                      : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  )}
                >
                  {request.status}
                </span>
              </div>

              <span className="mt-4 inline-flex rounded-lg bg-sky-500/9 px-2.5 py-1 text-[9px] font-black text-sky-700 dark:text-sky-300">
                {request.kind}
              </span>
              <p className="bg-navy/[0.032] text-navy/78 dark:text-ivory/78 mt-2 min-h-20 rounded-2xl px-3.5 py-3 text-xs leading-7 dark:bg-white/[0.032]">
                {request.text}
              </p>
              <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                <p className="text-navy/35 dark:text-wheat/55 text-[9px] font-bold">
                  {request.at}
                </p>
                {request.status === "در انتظار بررسی" ? (
                  <Button
                    type="button"
                    variant="navy"
                    size="sm"
                    className="min-h-9 rounded-xl text-[10px]"
                    onClick={() => change(request.id, "تماس گرفته شد")}
                  >
                    <PhoneCall className="size-3.5" /> ثبت تماس
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="min-h-9 rounded-xl text-[10px]"
                    onClick={() => change(request.id, "در انتظار بررسی")}
                  >
                    <RotateCcw className="size-3.5" /> بازگشت به انتظار
                  </Button>
                )}
              </div>
            </article>
          ))}
        </div>
      )}

      {list.length > 0 ? <Pagination pg={pg} unit="درخواست" /> : null}
    </div>
  );
}
