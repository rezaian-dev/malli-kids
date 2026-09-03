import { Pin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AdminFilterSelect } from "@/components/admin";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import type { FestiveBanner, FestiveTheme } from "@/types";

function BannerField({
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
        className={cn(
          "mt-1.5 h-11 rounded-xl bg-transparent shadow-none",
          "border-navy/9 text-navy",
          "dark:border-gold/16 dark:text-ivory",
        )}
      />
    </div>
  );
}

/** 📣 One occasion banner — pin/active switches and its inline-editable
 *  copy fields. */
export function BannerCard({
  banner,
  onUpdate,
}: {
  banner: FestiveBanner;
  onUpdate: (patch: Partial<FestiveBanner>) => void;
}) {
  return (
    <article className={adminGlassCard}>
      <div
        className={cn(
          "h-1 w-full",
          banner.theme === "gold"
            ? "from-gold-deep via-gold-light to-gold bg-linear-to-r"
            : banner.theme === "night"
              ? "from-navy-deep to-navy bg-linear-to-r via-purple-500/60"
              : "from-navy-deep via-navy-soft to-gold bg-linear-to-r",
        )}
      />
      <div className="p-4 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge className="bg-gold/15 text-gold-deep dark:text-gold-soft rounded-lg border-0">
                {banner.occasion}
              </Badge>
              {banner.pinned ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[9px] font-black",
                    "bg-sky-500/10 text-sky-700",
                    "dark:text-sky-300",
                  )}
                >
                  <Pin className="size-3" /> پین‌شده
                </span>
              ) : null}
            </div>
            <p className="text-navy/45 dark:text-wheat mt-2 text-[10px] font-bold">
              بازه نمایش: {banner.from} تا {banner.to}
            </p>
          </div>
          <div
            className={cn(
              "flex items-center gap-4 rounded-xl px-3 py-2",
              "bg-navy/3",
              "dark:bg-white/3",
            )}
          >
            <label className="flex items-center gap-2 text-[10px] font-black">
              <span className="text-navy/55 dark:text-wheat">پین</span>
              <Switch
                checked={banner.pinned}
                onCheckedChange={(value) => onUpdate({ pinned: value })}
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
                onCheckedChange={(value) => onUpdate({ active: value })}
              />
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <BannerField
            label="عنوان"
            value={banner.title}
            onChange={(value) => onUpdate({ title: value })}
          />
          <BannerField
            label="توضیح کوتاه"
            value={banner.subtitle}
            onChange={(value) => onUpdate({ subtitle: value })}
          />
          <BannerField
            label="متن دکمه"
            value={banner.cta}
            onChange={(value) => onUpdate({ cta: value })}
          />
          <BannerField
            label="لینک مقصد"
            value={banner.href}
            onChange={(value) => onUpdate({ href: value })}
          />
          <BannerField
            label="کد تخفیف"
            value={banner.coupon || ""}
            onChange={(value) => onUpdate({ coupon: value || undefined })}
          />
          <AdminFilterSelect
            label="تم بنر"
            value={banner.theme}
            onValueChange={(value) => onUpdate({ theme: value as FestiveTheme })}
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
  );
}
