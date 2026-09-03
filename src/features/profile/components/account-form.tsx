"use client";

import { toast } from "@/lib/toast";
import { useStore } from "@/providers/store-provider";
import { AppForm, TextareaField, TextField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import type { User } from "@/types";
import { updateAccountAction } from "../actions";
import {
  updateAccountDefaults,
  updateAccountSchema,
  type UpdateAccountValues,
} from "../schemas";
import { PROFILE_CARD } from "./profile-shared";
import { SECTION_TITLE } from "./profile-form-styles";

function toValues(user: User): UpdateAccountValues {
  return {
    name: [user.firstName, user.lastName].filter(Boolean).join(" "),
    phone: user.phone || "",
    nationalId: user.nationalId || "",
    city: user.city || "",
    address: user.address || "",
  };
}

/** 👤 The account-details half of the profile info panel. Seeded straight
 *  from `user` via react-hook-form's `defaultValues` (not a post-mount
 *  `useEffect`) so it's never blank-then-filled on the first render. */
export function AccountForm() {
  const { user, updateUser } = useStore();
  const form = useAppForm({
    schema: updateAccountSchema,
    defaultValues: user ? toValues(user) : updateAccountDefaults,
  });

  if (!user) return null;

  async function onValid(values: UpdateAccountValues) {
    const result = await updateAccountAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    updateUser(result.data);
    toast.success("اطلاعات حساب ذخیره شد ✅");
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
      ariaLabel="ویرایش حساب"
      className={PROFILE_CARD}
      notify
    >
      <h2 className={SECTION_TITLE}>ویرایش حساب</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <TextField
          name="name"
          label="نام و نام خانوادگی"
          className="sm:col-span-2"
          autoComplete="name"
          required
        />

        <TextField
          name="nationalId"
          label="کد ملی"
          dir="ltr"
          inputMode="numeric"
          inputClassName="text-left"
          placeholder="0123456789"
          maxLength={10}
          hint="۱۰ رقم؛ رقم کنترل هم بررسی می‌شود."
        />

        <TextField
          name="city"
          label="شهر"
          autoComplete="address-level2"
          placeholder="تهران"
        />

        <TextareaField
          name="address"
          label="آدرس"
          className="sm:col-span-2"
          autoComplete="street-address"
          maxLength={160}
        />

        <TextField
          name="phone"
          label="شماره موبایل"
          dir="ltr"
          type="tel"
          inputMode="tel"
          inputClassName="text-left"
          autoComplete="tel-national"
          placeholder="0912…"
          hint="فقط برای تماس در صورت نیاز."
        />
      </div>

      <Button type="submit" variant="navy" className="h-11 px-7">
        ذخیره حساب
      </Button>
    </AppForm>
  );
}
