"use client";

import { useAdmin } from "@/features/admin";
import { formatToman } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHead } from "@/features/admin";

export default function AdminSettings() {
  const { db, saveSettings, resetDb } = useAdmin();
  const s = db.settings;

  function onSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    saveSettings({
      ...s,
      freeShipFrom: Number(fd.get("free") || s.freeShipFrom),
      phoneFa: String(fd.get("phone") || s.phoneFa),
      address: String(fd.get("address") || s.address),
    });
  }

  return (
    <div>
      <PageHead kicker="STORE" title="تنظیمات فروشگاه" />
      <form onSubmit={onSave} className="lux-card max-w-xl space-y-4 p-5 sm:p-6">
        <label className="flex items-center justify-between rounded-2xl border border-navy/8 px-3 py-3 dark:border-gold/20">
          <span className="text-sm font-black">فروشگاه باز است</span>
          <Switch checked={s.storeOpen} onCheckedChange={(v) => saveSettings({ ...s, storeOpen: v })} />
        </label>
        <div>
          <Label className="text-xs font-black">آستانه ارسال رایگان (تومان)</Label>
          <Input name="free" type="number" defaultValue={s.freeShipFrom} className="mt-1.5 h-11 rounded-2xl" />
          <p className="mt-1 text-[11px] text-navy/40 dark:text-wheat">فعلی: {formatToman(s.freeShipFrom)} تومان</p>
        </div>
        <div>
          <Label className="text-xs font-black">تلفن گالری</Label>
          <Input name="phone" dir="ltr" defaultValue={s.phoneFa} className="mt-1.5 h-11 rounded-2xl" />
        </div>
        <div>
          <Label className="text-xs font-black">آدرس</Label>
          <Input name="address" defaultValue={s.address} className="mt-1.5 h-11 rounded-2xl" />
        </div>
        <Button type="submit" variant="navy" className="h-11 w-full rounded-2xl">
          ذخیره تنظیمات
        </Button>
      </form>
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
