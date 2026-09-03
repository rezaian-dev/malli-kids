"use client";

import { toast } from "@/lib/toast";
import { useStore } from "@/providers/store-provider";
import { AppForm, SelectField, TextField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { updateChildAction } from "../_lib/actions";
import {
  updateChildDefaults,
  updateChildSchema,
  type UpdateChildValues,
} from "../_lib/schemas";
import { PROFILE_CARD } from "./profile-shared";
import { SECTION_TITLE } from "./profile-form-styles";

function toValues(user: User): UpdateChildValues {
  return {
    childName: user.childName || "",
    childAge: user.childAge || "",
    childGender:
      user.childGender === "دختر" || user.childGender === "پسر"
        ? user.childGender
        : undefined,
  };
}

/** 🧸 The optional "your kid" half of the profile info panel. */
export function ChildForm() {
  const { user, updateUser } = useStore();
  const form = useAppForm({
    schema: updateChildSchema,
    defaultValues: user ? toValues(user) : updateChildDefaults,
  });

  if (!user) return null;

  async function onValid(values: UpdateChildValues) {
    const result = await updateChildAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    updateUser(result.data);
    toast.success("اطلاعات کوچولو ذخیره شد ✅");
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
      ariaLabel="اطلاعات کوچولو"
      className={PROFILE_CARD}
      notify
    >
      <div>
        <h2 className={SECTION_TITLE}>اطلاعات کوچولو</h2>
        <p className="text-navy/70 dark:text-wheat mt-2 text-xs">
          اختیاری است؛ اگر پرش کنید، سایز دقیق‌تری پیشنهاد می‌دهیم.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <TextField name="childName" label="نام کوچولو" placeholder="نیلو" />
        <TextField
          name="childAge"
          label="سن تقریبی"
          placeholder="۳ سال"
          hint="عدد + سال یا ماه کافی است."
        />
        <SelectField
          name="childGender"
          label="جنسیت"
          placeholder="انتخاب کنید"
          options={["دختر", "پسر"]}
        />
      </div>

      <Button type="submit" variant="gold" className="h-11 px-7">
        ذخیره اطلاعات کودک
      </Button>
    </AppForm>
  );
}
