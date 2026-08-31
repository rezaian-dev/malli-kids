"use client";

import { z } from "zod";
import { toast } from "sonner";
import {
  AppForm,
  SelectField,
  TextField,
  TextareaField,
  useAppForm,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { mobile, text, longText } from "@/lib/forms";
import { COLLAB_KINDS, submitCollab } from "@/lib/collab";

const schema = z.object({
  name: text("نام", 2, 60),
  phone: mobile("شمارهٔ موبایل"),
  kind: z.string().min(1, "نوع همکاری را انتخاب کنید"),
  text: longText("توضیح", 10, 600),
});
type Values = z.infer<typeof schema>;
const defaults: Values = { name: "", phone: "", kind: "", text: "" };

export function CollabForm() {
  const form = useAppForm({ schema, defaultValues: defaults });

  function onValid(v: Values) {
    submitCollab({
      name: v.name.trim(),
      phone: v.phone.trim(),
      kind: v.kind,
      text: v.text.trim(),
    });
    toast.success("درخواست همکاری ثبت شد؛ تیم ما با شما تماس می‌گیرد 🤝");
    form.reset(defaults);
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
      ariaLabel="فرم همکاری"
      className="mt-6 space-y-4"
      notify
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          label="نام و نام خانوادگی"
          skin="lux"
          maxLength={60}
          required
          placeholder="نام شما"
          autoComplete="name"
        />
        <TextField
          name="phone"
          label="شمارهٔ موبایل"
          skin="lux"
          dir="ltr"
          inputMode="tel"
          required
          placeholder="0912…"
          autoComplete="tel-national"
          hint="فقط برای تماس دربارهٔ همکاری؛ گفتگوی روزمره از طریق سایت."
        />
      </div>
      <SelectField
        name="kind"
        label="نوع همکاری"
        skin="lux"
        options={[...COLLAB_KINDS]}
        placeholder="انتخاب کنید…"
        required
      />
      <TextareaField
        name="text"
        label="چند خط دربارهٔ خودتان"
        skin="lux"
        min={10}
        maxLength={600}
        required
        placeholder="تجربه، پیج کاری یا نمونه‌کار…"
      />
      <Button type="submit" variant="navy" size="pill" className="w-full">
        ارسالِ درخواستِ همکاری
      </Button>
    </AppForm>
  );
}
