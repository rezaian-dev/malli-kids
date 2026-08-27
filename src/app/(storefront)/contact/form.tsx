"use client";

import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AppForm, FormHead, TextField, TextareaField, useAppForm } from "@/components/form";
import { contactDefaults, contactSchema } from "./schema";

/**
 * فرم «پیام بگذارید» — react-hook-form + zod.
 * اعتبارسنجی: نام ۲ تا ۶۰ حرف، موبایل ایران (اختیاری)، پیام ۱۰ تا ۰۰ حرف.
 */
export function Form() {
  const form = useAppForm({ schema: contactSchema, defaultValues: contactDefaults });

  function onValid({ name }: typeof contactDefaults) {
    toast.success(`${name} عزیز، پیام‌تان ثبت شد — معمولاً همان روز پاسخ می‌دهیم`);
    form.reset(contactDefaults);
  }

  return (
    <AppForm form={form} onSubmit={onValid} ariaLabel="فرم تماس" className="lux-card space-y-4 p-6 sm:p-8" notify resetOnSubmit={false}>
      <FormHead title="پیام بگذارید" desc="معمولاً همان روز پاسخ می‌دهیم." />

      <TextField name="name" label="نام" skin="lux" placeholder="مثلاً سارا محمدی" maxLength={60} required />
      <TextField name="phone" label="موبایل" skin="lux" dir="ltr" placeholder="0912…" inputMode="tel" hint="برای پاسخِ سریع‌تر اختیاری است، ولی اگر نوشتید باید ۱۱ رقم باشد." />
      <TextareaField name="msg" label="پیام" skin="lux" placeholder="سؤال سایز، سفارش یا بازدید از گالری…" min={10} maxLength={600} required />

      <Button type="submit" variant="navy" size="pill" className="w-full">
        ارسال پیام
        <ArrowLeft className="size-4" />
      </Button>
    </AppForm>
  );
}
