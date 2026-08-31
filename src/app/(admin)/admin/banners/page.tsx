"use client";

import { useMemo, useState } from "react";
import { CalendarDays, Eye, EyeOff, Megaphone, Pin } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Pagination } from "@/components/ui/pagination";
import { Switch } from "@/components/ui/switch";
import {
  AdminFilterBar,
  AdminFilterSelect,
  AdminStatStrip,
  AdminPageHeader,
  useAdmin,
} from "@/components/admin";
import { pickBanner, toJalali } from "@/lib/festive/occasions";
import { usePagination } from "@/hooks/use-pagination";
import { toFaDigits } from "@/lib/format";
import type { FestiveTheme } from "@/types";

const PER_PAGE = 6;
type StatusFilter = "all" | "active" | "inactive";
type PinFilter = "all" | "pinned" | "normal";

export default function AdminBanners() {
  const { db, saveBanners } = useAdmin();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [pin, setPin] = useState<PinFilter>("all");
  const [theme, setTheme] = useState("all");
  const today = toJalali();
  const live = pickBanner(db.banners);

  const list = useMemo(() => {
    const term = q.trim().toLocaleLowerCase("fa");
    return db.banners.filter((banner) => {
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
  }, [db.banners, pin, q, status, theme]);

  const pg = usePagination(list, PER_PAGE, `${q}|${status}|${pin}|${theme}`);
  const active = db.banners.filter((banner) => banner.active).length;
  const pinned = db.banners.filter((banner) => banner.pinned).length;
  const activeFilters =
    Number(!!q.trim()) +
    Number(status !== "all") +
    Number(pin !== "all") +
    Number(theme !== "all");

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
            value: db.banners.length,
            Icon: Megaphone,
            tone: "blue",
          },
          { label: "فعال", value: active, Icon: Eye, tone: "emerald" },
          {
            label: "غیرفعال",
            value: db.banners.length - active,
            Icon: EyeOff,
            tone: "rose",
          },
          { label: "پین‌شده", value: pinned, Icon: Pin, tone: "gold" },
        ]}
      />

      <div className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 mb-5 overflow-hidden rounded-[22px] border shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="bg-gold/14 text-gold-deep dark:text-gold-soft grid size-11 shrink-0 place-items-center rounded-2xl">
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
            className={`w-max rounded-xl px-3 py-1.5 text-[9px] font-black ${live ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : "bg-navy/6 text-navy/55 dark:text-wheat dark:bg-white/6"}`}
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
              count: db.banners.length - active,
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
          {pg.pageItems.map((banner, index) => (
            <article
              key={banner.id}
              className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 overflow-hidden rounded-[22px] border shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]"
              style={{ animationDelay: `${index * 45}ms` }}
            >
              <div
                className={`h-1 w-full ${banner.theme === "gold" ? "from-gold-deep via-gold-light to-gold bg-linear-to-r" : banner.theme === "night" ? "from-navy-deep to-navy bg-linear-to-r via-purple-500/60" : "from-navy-deep via-navy-soft to-gold bg-linear-to-r"}`}
              />
              <div className="p-4 sm:p-5">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-gold/15 text-gold-deep dark:text-gold-soft rounded-lg border-0">
                        {banner.occasion}
                      </Badge>
                      {banner.pinned ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-sky-500/10 px-2 py-1 text-[9px] font-black text-sky-700 dark:text-sky-300">
                          <Pin className="size-3" /> پین‌شده
                        </span>
                      ) : null}
                    </div>
                    <p className="text-navy/45 dark:text-wheat mt-2 text-[10px] font-bold">
                      بازه نمایش: {banner.from} تا {banner.to}
                    </p>
                  </div>
                  <div className="bg-navy/3 flex items-center gap-4 rounded-xl px-3 py-2 dark:bg-white/3">
                    <label className="flex items-center gap-2 text-[10px] font-black">
                      <span className="text-navy/55 dark:text-wheat">پین</span>
                      <Switch
                        checked={banner.pinned}
                        onCheckedChange={(value) =>
                          saveBanners(
                            db.banners.map((item) => ({
                              ...item,
                              pinned: item.id === banner.id ? value : false,
                            })),
                          )
                        }
                      />
                    </label>
                    <span className="bg-navy/8 dark:bg-gold/14 h-5 w-px" />
                    <label className="flex items-center gap-2 text-[10px] font-black">
                      <span
                        className={
                          banner.active
                            ? "text-emerald-600 dark:text-emerald-300"
                            : "text-rose"
                        }
                      >
                        {banner.active ? "فعال" : "خاموش"}
                      </span>
                      <Switch
                        checked={banner.active}
                        onCheckedChange={(value) =>
                          saveBanners(
                            db.banners.map((item) =>
                              item.id === banner.id
                                ? { ...item, active: value }
                                : item,
                            ),
                          )
                        }
                      />
                    </label>
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  <Field
                    label="عنوان"
                    value={banner.title}
                    onChange={(value) =>
                      saveBanners(
                        db.banners.map((item) =>
                          item.id === banner.id
                            ? { ...item, title: value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label="توضیح کوتاه"
                    value={banner.subtitle}
                    onChange={(value) =>
                      saveBanners(
                        db.banners.map((item) =>
                          item.id === banner.id
                            ? { ...item, subtitle: value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label="متن دکمه"
                    value={banner.cta}
                    onChange={(value) =>
                      saveBanners(
                        db.banners.map((item) =>
                          item.id === banner.id
                            ? { ...item, cta: value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label="لینک مقصد"
                    value={banner.href}
                    onChange={(value) =>
                      saveBanners(
                        db.banners.map((item) =>
                          item.id === banner.id
                            ? { ...item, href: value }
                            : item,
                        ),
                      )
                    }
                  />
                  <Field
                    label="کد تخفیف"
                    value={banner.coupon || ""}
                    onChange={(value) =>
                      saveBanners(
                        db.banners.map((item) =>
                          item.id === banner.id
                            ? { ...item, coupon: value || undefined }
                            : item,
                        ),
                      )
                    }
                  />
                  <AdminFilterSelect
                    label="تم بنر"
                    value={banner.theme}
                    onValueChange={(value) =>
                      saveBanners(
                        db.banners.map((item) =>
                          item.id === banner.id
                            ? { ...item, theme: value as FestiveTheme }
                            : item,
                        ),
                      )
                    }
                    options={[
                      { value: "navy", label: "سرمه‌ای" },
                      { value: "gold", label: "طلایی" },
                      { value: "night", label: "شب" },
                    ]}
                    className="w-full xl:w-full"
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="border-navy/9 bg-paper/94 hover:border-gold/40 dark:border-gold-soft/16 dark:hover:border-gold-soft/30 rounded-[22px] border px-5 py-14 text-center shadow-[0_20px_48px_-34px_rgba(14,42,71,0.38),inset_0_1px_0_rgba(255,255,255,0.72)] backdrop-blur-[18px] transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.22,1,.36,1)] hover:shadow-[0_24px_52px_-34px_rgba(14,42,71,0.44)] max-[639px]:rounded-[19px] dark:bg-[rgba(16,43,70,0.72)] dark:shadow-[0_25px_60px_-35px_rgba(0,0,0,0.76),inset_0_1px_0_rgba(255,255,255,0.045),0_0_0_1px_rgba(193,147,87,0.025)] dark:hover:shadow-[0_28px_64px_-36px_rgba(0,0,0,0.88),0_0_34px_rgba(193,147,87,0.035)]">
          <Megaphone className="text-gold mx-auto size-10" />
          <p className="mt-3 text-sm font-black">بنری مطابق فیلترها پیدا نشد</p>
        </div>
      )}
      {list.length > 0 ? <Pagination pg={pg} unit="بنر" /> : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <Label className="text-navy/50 dark:text-wheat/75 text-[10px] font-black">
        {label}
      </Label>
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="border-navy/9 text-navy dark:border-gold/16 dark:bg-navy-deep/38 dark:text-ivory mt-1.5 h-11 rounded-xl bg-white/75 shadow-none"
      />
    </div>
  );
}
