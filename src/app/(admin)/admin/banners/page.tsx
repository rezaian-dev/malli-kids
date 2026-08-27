"use client";

import { useAdmin } from "@/features/admin";
import { pickBanner, toJalali } from "@/features/festive/lib/occasions";
import { PageHead } from "@/features/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Pagination } from "@/components/ui/pagination";
import { usePagination } from "@/hooks/use-pagination";
import { toFaDigits } from "@/lib/format";

const PER_PAGE = 6;

export default function AdminBanners() {
  const { db, saveBanners } = useAdmin();
  const today = toJalali();
  const live = pickBanner(db.banners);
  const pg = usePagination(db.banners, PER_PAGE);

  return (
    <div>
      <PageHead kicker="CALENDAR" title="بنر مناسبت‌ها" />
      <div className="admin-card mb-5 p-4 sm:p-5">
        <p className="text-[11px] font-black text-gold">امروز · {toFaDigits(today.jy)}/{toFaDigits(today.jm)}/{toFaDigits(today.jd)}</p>
        <p className="mt-1 font-black text-navy dark:text-ivory">{live ? `${live.occasion} — ${live.title}` : "بنر پیش‌فرض ارسال رایگان"}</p>
        <p className="mt-1 text-sm text-navy/55 dark:text-wheat">فقط یک بنر پین‌شده یا اولین مناسبت فعالِ بازهٔ تاریخ بالای هدر می‌آید.</p>
      </div>
      <div className="grid gap-3">
        {pg.pageItems.map((b) => (
          <article key={b.id} className="admin-card p-4 sm:p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <Badge className="rounded-full bg-gold/20 text-gold">{b.occasion}</Badge>
                <p className="mt-2 text-[11px] font-bold text-navy/50 dark:text-wheat">
                  {b.from} تا {b.to}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 text-[11px] font-black">
                  پین
                  <Switch
                    checked={b.pinned}
                    onCheckedChange={(v) =>
                      saveBanners(db.banners.map((x) => ({ ...x, pinned: x.id === b.id ? v : false })))
                    }
                  />
                </label>
                <label className="flex items-center gap-2 text-[11px] font-black">
                  فعال
                  <Switch checked={b.active} onCheckedChange={(v) => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, active: v } : x)))} />
                </label>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <Field
                label="عنوان"
                value={b.title}
                onChange={(v) => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, title: v } : x)))}
              />
              <Field
                label="توضیح"
                value={b.subtitle}
                onChange={(v) => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, subtitle: v } : x)))}
              />
              <Field
                label="دکمه"
                value={b.cta}
                onChange={(v) => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, cta: v } : x)))}
              />
              <Field
                label="لینک"
                value={b.href}
                onChange={(v) => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, href: v } : x)))}
              />
              <Field
                label="کد تخفیف"
                value={b.coupon || ""}
                onChange={(v) => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, coupon: v || undefined } : x)))}
              />
            </div>
            <div className="mt-3 flex gap-2">
              {(["navy", "gold", "night"] as const).map((t) => (
                <Button
                  key={t}
                  type="button"
                  size="sm"
                  variant={b.theme === t ? "gold" : "outline"}
                  className="h-8 rounded-full"
                  onClick={() => saveBanners(db.banners.map((x) => (x.id === b.id ? { ...x, theme: t } : x)))}
                >
                  {t}
                </Button>
              ))}
            </div>
          </article>
        ))}
      </div>
      <Pagination pg={pg} unit="بنر" />
    </div>
  );
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <Label className="text-[11px] font-black text-gold">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 h-10 rounded-xl border-navy/12 bg-white text-navy dark:border-gold/25 dark:bg-navy-mid dark:text-ivory" />
    </div>
  );
}
