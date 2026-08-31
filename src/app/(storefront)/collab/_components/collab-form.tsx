"use client";

import { toast } from "@/lib/toast";
import {
  AppForm,
  SelectField,
  TextField,
  TextareaField,
  useAppForm,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { COLLAB_KINDS } from "@/lib/constants";
import { submitCollabAction } from "../_lib/actions";
import {
  collabDefaults,
  collabSchema,
  type CollabValues,
} from "../_lib/collab-schema";

export function CollabForm() {
  const form = useAppForm({
    schema: collabSchema,
    defaultValues: collabDefaults,
  });

  async function onValid(v: CollabValues) {
    const result = await submitCollabAction(v);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success("درخواست همکاری ثبت شد؛ تیم ما با شما تماس می‌گیرد 🤝");
    form.reset(collabDefaults);
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
