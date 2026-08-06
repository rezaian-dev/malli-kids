"use client";

import { useEffect, useState, useTransition } from "react";
import { Save } from "lucide-react";

import { AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { adminGlassCard } from "@/lib/admin/admin-chrome";
import { toast } from "@/lib/toast";
import { cn } from "@/lib/utils";
import type {
  SettingsCampaign,
  SettingsSupportHours,
} from "@/lib/db/models/settings";
import { updateSettingsAction } from "../_lib/actions";

const FIELD_LABEL = "text-navy/70 dark:text-wheat block text-xs font-black";
const FIELD_INPUT =
  "border-navy/12 dark:border-gold/20 h-11 rounded-2xl bg-transparent px-4 text-sm";

export function AdminSettingsLanding({
  campaign,
  support,
}: {
  campaign: SettingsCampaign;
  support: SettingsSupportHours;
}) {
  const [active, setActive] = useState(campaign.active);
  const [percent, setPercent] = useState(String(campaign.percent));
  const [title, setTitle] = useState(campaign.title);
  const [supportStart, setSupportStart] = useState(String(support.startHour));
  const [supportEnd, setSupportEnd] = useState(String(support.endHour));
  const [supportLabel, setSupportLabel] = useState(support.label);
  const [pending, startTransition] = useTransition();

  // 🔁 `useState(campaign...)` only ever reads its initial value once — a
  // later render carrying a *changed* `campaign` prop (this page re-rendered
  // after a navigation, or after this same save's own automatic refresh)
  // would otherwise leave the form frozen on whatever it showed at first
  // mount instead of the real current value. Only a real prop change fires
  // this, so it doesn't fight in-progress typing between renders.
  useEffect(() => {
    setActive(campaign.active);
    setPercent(String(campaign.percent));
    setTitle(campaign.title);
    setSupportStart(String(support.startHour));
    setSupportEnd(String(support.endHour));
    setSupportLabel(support.label);
  }, [
    campaign.active,
    campaign.percent,
    campaign.title,
    support.startHour,
    support.endHour,
    support.label,
  ]);

  function save() {
    const parsedPercent = Number(percent);
    if (!Number.isInteger(parsedPercent) || parsedPercent < 1 || parsedPercent > 90) {
      toast.error("درصد باید عددی بین ۱ تا ۹۰ باشد");
      return;
    }
    if (title.trim().length < 2) {
      toast.error("عنوان جشنواره را وارد کنید");
      return;
    }
    const start = Number(supportStart);
    const end = Number(supportEnd);
    if (!Number.isInteger(start) || start < 0 || start > 23) {
      toast.error("ساعت شروع پشتیبانی باید بین ۰ تا ۲۳ باشد");
      return;
    }
    if (!Number.isInteger(end) || end < 0 || end > 23) {
      toast.error("ساعت پایان پشتیبانی باید بین ۰ تا ۲۳ باشد");
      return;
    }
    if (supportLabel.trim().length < 2) {
      toast.error("عنوان ساعات پشتیبانی را وارد کنید");
      return;
    }

    startTransition(async () => {
      const result = await updateSettingsAction({
        active,
        percent: parsedPercent,
        title: title.trim(),
        supportStart: start,
        supportEnd: end,
        supportLabel: supportLabel.trim(),
      });
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success("تنظیمات ذخیره شد");
    });
  }

  return (
    <div>
      <AdminPageHeader
        kicker="SETTINGS"
        title="تنظیمات فروشگاه"
        description="کمپین تخفیف سراسری سایت — روی همه محصولات نمایشی اعمال می‌شود."
      />

      <div className={cn(adminGlassCard, "max-w-xl space-y-5 p-5 sm:p-6")}>
        <label className="flex items-center justify-between gap-3">
          <span className="space-y-1">
            <span className="block text-sm font-black">فعال بودن جشنواره</span>
            <span className="text-navy/70 dark:text-wheat block text-[11px] font-bold">
              وقتی فعال باشد، بنر تخفیف سراسری در فروشگاه نمایش داده می‌شود.
            </span>
          </span>
          <Switch checked={active} onCheckedChange={setActive} />
        </label>

        <div className="flex flex-col gap-2">
          <label htmlFor="campaign-title" className={FIELD_LABEL}>
            عنوان جشنواره
          </label>
          <Input
            id="campaign-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={60}
            className={FIELD_INPUT}
          />
        </div>

        <div className="flex flex-col gap-2">
          <label htmlFor="campaign-percent" className={FIELD_LABEL}>
            درصد تخفیف
          </label>
          <Input
            id="campaign-percent"
            value={percent}
            onChange={(event) => setPercent(event.target.value)}
            inputMode="numeric"
            className={FIELD_INPUT}
          />
        </div>

        <div className="border-navy/8 dark:border-gold/16 border-t pt-5">
          <p className="text-sm font-black">ساعات پاسخگویی گفتگوی زنده</p>
          <p className="text-navy/70 dark:text-wheat mt-1 text-[11px] leading-5 font-bold">
            خارج از این ساعت‌ها، پنجره چت به مشتری اطلاع می‌دهد که پاسخ در ساعات
            کاری می‌رسد. ساعت‌ها به وقت تهران و ۲۴ساعته‌اند.
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="support-start" className={FIELD_LABEL}>
                ساعت شروع
              </label>
              <Input
                id="support-start"
                value={supportStart}
                onChange={(event) => setSupportStart(event.target.value)}
                inputMode="numeric"
                className={FIELD_INPUT}
              />
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="support-end" className={FIELD_LABEL}>
                ساعت پایان
              </label>
              <Input
                id="support-end"
                value={supportEnd}
                onChange={(event) => setSupportEnd(event.target.value)}
                inputMode="numeric"
                className={FIELD_INPUT}
              />
            </div>
          </div>
          <div className="mt-3 space-y-1.5">
            <label htmlFor="support-label" className={FIELD_LABEL}>
              عنوان نمایشی ساعات
            </label>
            <Input
              id="support-label"
              value={supportLabel}
              onChange={(event) => setSupportLabel(event.target.value)}
              maxLength={80}
              className={FIELD_INPUT}
            />
          </div>
        </div>

        <Button
          type="button"
          variant="navy"
          className="h-11 rounded-2xl px-6"
          disabled={pending}
          onClick={save}
        >
          <Save className="size-4" /> {pending ? "در حال ذخیره…" : "ذخیره تنظیمات"}
        </Button>
      </div>
    </div>
  );
}
