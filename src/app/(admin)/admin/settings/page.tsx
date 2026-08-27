"use client";

import { useEffect } from "react";
import { useAdmin } from "@/features/admin";
import { formatToman } from "@/lib/format";
import { parseFaNumber, toLatinDigits } from "@/lib/forms";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { PageHead } from "@/features/admin";
import { AppForm, MoneyField, TextField, useAppForm } from "@/components/form";
import { settingsSchema, type SettingsValues } from "./schema";

export default function AdminSettings() {
  const { db, saveSettings, resetDb } = useAdmin();
  const s = db.settings;
  const form = useAppForm({ schema: settingsSchema });

  // مقدارهایِ فعلیِ پنل داخلِ فرم می‌نشینند (به‌ازایِ هر تغییرِ تنظیمات)
  useEffect(() => {
    form.reset({
      freeShipFrom: String(s.freeShipFrom),
      phoneFa: toLatinDigits(s.phoneFa),
      address: s.address,
    });
  }, [s.freeShipFrom, s.phoneFa, s.address, form]);

  function onSave(v: SettingsValues) {
    saveSettings({
      ...s,
      freeShipFrom: parseFaNumber(v.freeShipFrom),
      phoneFa: v.phoneFa,
      address: v.address.trim(),
    });
    // ذخیرهٔ واقعی با اَپِ بک‌اند فعال می‌شود (خودِ useAdmin پیامش را می‌دهد)
  }

  return (
    <div>
      <PageHead kicker="STORE" title="تنظیمات فروشگاه" />
      <AppForm form={form} onSubmit={onSave} ariaLabel="تنظیمات فروشگاه" className="lux-card max-w-xl space-y-4 p-5 sm:p-6" notify>
        <label className="flex items-center justify-between rounded-2xl border border-navy/8 px-3 py-3 dark:border-gold/20">
          <span className="text-sm font-black">فروشگاه باز است</span>
          <Switch checked={s.storeOpen} onCheckedChange={(v) => saveSettings({ ...s, storeOpen: v })} />
        </label>
        <MoneyField
          name="freeShipFrom"
          label="آستانه ارسال رایگان (تومان)"
          hint={`فعلی: ${formatToman(s.freeShipFrom)} تومان — ارقامِ فارسی هم قبول است`}
        />
        <TextField name="phoneFa" label="تلفن گالری" dir="ltr" inputMode="tel" placeholder="02164023456" hint="با پیش‌شماره؛ برای پشتیبانیِ سایت نمایش داده می‌شود" />
        <TextField name="address" label="آدرس" maxLength={160} placeholder="تهران، خیابان ولیعصر، گالری ملی‌کیدز" required />
        <Button type="submit" variant="navy" className="h-11 w-full rounded-2xl">
          ذخیره تنظیمات
        </Button>
      </AppForm>
      <div className="mt-6 max-w-xl rounded-3xl border border-rose/20 bg-rose-pale/50 p-5 dark:border-rose/25 dark:bg-rose/10">
        <p className="font-black text-rose">بازنشانی دادهٔ نمونه</p>
        <p className="mt-1 text-sm text-navy/60 dark:text-wheat">سفارش‌ها، موجودی و کدها به حالت اولیه برمی‌گردند.</p>
        <Button type="button" variant="destructive" className="mt-3 rounded-full" onClick={resetDb}>
          بازنشانی
        </Button>
      </div>
    </div>
  );
}
