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
import type { SettingsCampaign } from "@/lib/db/models/settings";
import { updateSettingsAction } from "../_lib/actions";

const FIELD_LABEL = "text-navy/70 dark:text-wheat text-xs font-black";
const FIELD_INPUT =
  "border-navy/12 dark:border-gold/20 h-11 rounded-2xl bg-transparent px-4 text-sm";

export function AdminSettingsLanding({ campaign }: { campaign: SettingsCampaign }) {
  const [active, setActive] = useState(campaign.active);
  const [percent, setPercent] = useState(String(campaign.percent));
  const [title, setTitle] = useState(campaign.title);
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
  }, [campaign.active, campaign.percent, campaign.title]);

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

    startTransition(async () => {
      const result = await updateSettingsAction({
        active,
        percent: parsedPercent,
        title: title.trim(),
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

        <div className="space-y-1.5">
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

        <div className="space-y-1.5">
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
