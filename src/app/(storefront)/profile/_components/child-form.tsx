"use client";

import { toast } from "@/lib/toast";
import { useStore } from "@/providers/store-provider";
import {
  AppForm,
  SelectField,
  SubmitButton,
  TextField,
  useAppForm,
} from "@/components/form";
import type { User } from "@/types";
import { updateChildAction } from "../_lib/actions";
import {
  updateChildDefaults,
  updateChildSchema,
  type UpdateChildValues,
} from "../_lib/schemas";
import { PROFILE_CARD } from "./profile-shared";
import { SECTION_TITLE } from "../_lib/profile-form-styles";

function toValues(user: User): UpdateChildValues {
  return {
    childName: user.childName || "",
    childAge: user.childAge || "",
    childGender:
      user.childGender === "دختر" || user.childGender === "پسر"
        ? user.childGender
        : undefined,
    childHeightCm: user.childHeightCm || "",
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
          اختیاری است؛ اگر قد را پر کنید، روی صفحه هر محصول سایز پیشنهادی هم
          می‌بینید.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <TextField name="childName" label="نام کوچولو" placeholder="نیلو" />
        <TextField
          name="childAge"
          label="سن تقریبی"
          placeholder="۳ سال"
          hint="عدد + سال یا ماه کافی است."
        />
        <TextField
          name="childHeightCm"
          label="قد (سانتی‌متر)"
          placeholder="۱۰۴"
          inputMode="numeric"
          hint="برای پیشنهاد سایز خودکار."
        />
        <SelectField
          name="childGender"
          label="جنسیت"
          placeholder="انتخاب کنید"
          options={["دختر", "پسر"]}
        />
      </div>

      <SubmitButton variant="gold" className="h-11 px-7" pendingLabel="در حال ذخیره…">
        ذخیره اطلاعات کودک
      </SubmitButton>
    </AppForm>
  );
}
