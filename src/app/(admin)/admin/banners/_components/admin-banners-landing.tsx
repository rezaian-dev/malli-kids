"use client";

import { useMemo, useState, useTransition } from "react";
import { CalendarDays, Eye, EyeOff, Megaphone, Pin } from "lucide-react";

import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
} from "@/components/admin";
import { Pagination } from "@/components/ui/pagination";
import { pickBanner, toJalali } from "@/lib/festive/occasions";
import { usePagination } from "@/hooks/use-pagination";
import { toFaDigits } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { FestiveBanner } from "@/types";
import { updateBannerAction } from "../_lib/actions";
import { BannerCard } from "./banner-card";

const PER_PAGE = 6;
type StatusFilter = "all" | "active" | "inactive";
type PinFilter = "all" | "pinned" | "normal";

export function AdminBannersLanding({ banners }: { banners: FestiveBanner[] }) {
  const [, startTransition] = useTransition();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pin, setPin] = useState<PinFilter>("all");
  const [theme, setTheme] = useState("all");
  const today = toJalali();
  const live = pickBanner(banners);

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return banners.filter((banner) => {
      const matchesSearch =
        !term ||
        `${banner.occasion} ${banner.title} ${banner.subtitle} ${banner.coupon ?? ""}`
          .toLocaleLowerCase("fa")
          .includes(term);
      const matchesStatus =
        status === "all" ||
        (status === "active" ? banner.active : !banner.active);
      const matchesPin =
        pin === "all" || (pin === "pinned" ? banner.pinned : !banner.pinned);
      const matchesTheme = theme === "all" || banner.theme === theme;
      return matchesSearch && matchesStatus && matchesPin && matchesTheme;
    });
  }, [banners, pin, q, status, theme]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${pin}|${theme}`);
  const active = banners.filter((banner) => banner.active).length;
  const pinned = banners.filter((banner) => banner.pinned).length;
  const activeFilters =
    Number(!!q.trim()) +
    Number(status !== "all") +
    Number(pin !== "all") +
    Number(theme !== "all");

  function updateBanner(id: string, patch: Partial<FestiveBanner>) {
    startTransition(async () => {
      const result = await updateBannerAction(id, patch);
      if (!result.ok) toast.error(result.error);
    });
  }

  return (
    <div>
      <AdminPageHeader
        kicker="CAMPAIGN CALENDAR"
        title="بنر مناسبت‌ها"
        description="برنامه‌ریزی و کنترل کمپین‌های مناسبتی با زمان‌بندی و اولویت نمایش دقیق."
      />

      <AdminStatStrip
        items={[
          {
            label: "کل بنرها",
            value: banners.length,
            Icon: Megaphone,
            tone: "blue",
          },
          { label: "فعال", value: active, Icon: Eye, tone: "emerald" },
          {
            label: "غیرفعال",
            value: banners.length - active,
            Icon: EyeOff,
            tone: "rose",
          },
          { label: "پین‌شده", value: pinned, Icon: Pin, tone: "gold" },
        ]}
      />

      <div className={cn(adminGlassCard, "mb-5")}>
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              className={cn(
                "grid size-11 shrink-0 place-items-center rounded-2xl",
                "bg-gold/14 text-gold-deep",
                "dark:text-gold-soft",
              )}
            >
              <CalendarDays className="size-5" />
            </span>
            <div className="min-w-0">
              <p className="text-gold text-[9px] font-black">
                امروز · {toFaDigits(today.jy)}/{toFaDigits(today.jm)}/
                {toFaDigits(today.jd)}
              </p>
              <p className="text-navy dark:text-ivory mt-1 truncate text-sm font-black">
                {live
                  ? `${live.occasion} — ${live.title}`
                  : "بنر پیش‌فرض ارسال رایگان"}
              </p>
            </div>
          </div>
          <span
            className={cn(
              "w-max rounded-xl px-3 py-1.5 text-[9px] font-black",
              live
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                : "bg-navy/6 text-navy/70 dark:text-wheat dark:bg-white/6",
            )}
          >
            {live ? "در حال نمایش" : "بدون کمپین فعال"}
          </span>
        </div>
      </div>

      <AdminFilterBar
        search={q}
        onSearchChange={setQ}
        searchPlaceholder="مناسبت، عنوان یا کد تخفیف…"
        resultCount={list.length}
        resultLabel="بنر"
        activeCount={activeFilters}
        onReset={() => {
          setQ("");
          setStatus("all");
          setPin("all");
          setTheme("all");
        }}
      >
        <AdminFilterSelect
          label="وضعیت نمایش"
          value={status}
          onValueChange={(value) => setStatus(value as StatusFilter)}
          options={[
            { value: "all", label: "همه بنرها" },
            { value: "active", label: "فعال", count: active },
            {
              value: "inactive",
              label: "غیرفعال",
              count: banners.length - active,
            },
          ]}
        />
        <AdminFilterSelect
          label="اولویت"
          value={pin}
          onValueChange={(value) => setPin(value as PinFilter)}
          options={[
            { value: "all", label: "همه اولویت‌ها" },
            { value: "pinned", label: "پین‌شده", count: pinned },
            { value: "normal", label: "عادی" },
          ]}
        />
        <AdminFilterSelect
          label="تم رنگی"
          value={theme}
          onValueChange={setTheme}
          options={[
            { value: "all", label: "همه تم‌ها" },
            { value: "navy", label: "سرمه‌ای" },
            { value: "gold", label: "طلایی" },
            { value: "night", label: "شب" },
          ]}
        />
      </AdminFilterBar>

      {list.length > 0 ? (
        <div className="grid gap-3">
          {pg.pageItems.map((banner) => (
            <BannerCard
              key={banner.id}
              banner={banner}
              onUpdate={(patch) => updateBanner(banner.id, patch)}
            />
          ))}
        </div>
      ) : (
        <div className={cn(adminGlassCard, "px-5 py-14 text-center")}>
          <Megaphone className="text-gold mx-auto size-10" />
          <p className="mt-3 text-sm font-black">بنری مطابق فیلترها پیدا نشد</p>
        </div>
      )}
      {list.length > 0 ? <Pagination pg={pg} unit="بنر" /> : null}
    </div>
  );
}
