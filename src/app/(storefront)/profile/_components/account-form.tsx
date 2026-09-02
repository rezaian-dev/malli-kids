"use client";

import { useEffect, useState } from "react";
import { toast } from "@/lib/toast";
import { useStore } from "@/providers/store-provider";
import { phoneDigits } from "@/lib/digits";
import { Button } from "@/components/ui/button";
import { PROFILE_CARD } from "./profile-shared";
import {
  FIELD_ERROR,
  FIELD_HINT,
  FIELD_LABEL,
  SECTION_TITLE,
  inputClass,
  isEmail,
  isIranianNationalId,
  textAreaClass,
} from "./profile-form-styles";

type AccountState = {
  firstName: string;
  lastName: string;
  nationalId: string;
  city: string;
  address: string;
  phone: string;
  email: string;
};

const EMPTY_ACCOUNT: AccountState = {
  firstName: "",
  lastName: "",
  nationalId: "",
  city: "",
  address: "",
  phone: "",
  email: "",
};

/** 👤 The account-details half of the profile info panel. */
export function AccountForm() {
  const { user, updateUser } = useStore();
  const [account, setAccount] = useState<AccountState>(EMPTY_ACCOUNT);
  const [errors, setErrors] = useState<Partial<AccountState>>({});

  useEffect(() => {
    if (!user) return;
    setAccount({
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      nationalId: user.nationalId || "",
      city: user.city || "",
      address: user.address || "",
      phone: user.phone || "",
      email: user.email || "",
    });
  }, [user]);

  if (!user) return null;

  function validate() {
    const next: Partial<AccountState> = {};
    const firstName = account.firstName.trim();
    const email = account.email.trim();
    const mobile = phoneDigits(account.phone);
    const nationalId = account.nationalId.trim();
    const city = account.city.trim();
    const address = account.address.trim();

    if (firstName.length < 2) next.firstName = "نام باید حداقل ۲ حرف باشد.";
    if (!email || !isEmail(email)) next.email = "ایمیل را کامل وارد کنید.";
    if (mobile && !/^09\d{9}$/.test(mobile)) {
      next.phone = "شماره موبایل باید با ۰۹ شروع شود.";
    }
    if (nationalId && !isIranianNationalId(nationalId)) {
      next.nationalId = "کد ملی معتبر نیست.";
    }
    if (address && !city) next.city = "با آدرس، شهر را هم بنویسید.";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function save() {
    if (!validate()) return;
    updateUser({
      firstName: account.firstName.trim(),
      lastName: account.lastName.trim() || undefined,
      nationalId: account.nationalId.trim() || undefined,
      city: account.city.trim() || undefined,
      address: account.address.trim() || undefined,
      phone: phoneDigits(account.phone).trim() || undefined,
      email: account.email.trim(),
    });
    toast.success("اطلاعات حساب ذخیره شد ✅");
  }

  return (
    <section className={PROFILE_CARD}>
      <div>
        <h2 className={SECTION_TITLE}>ویرایش حساب</h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>نام</span>
          <input
            value={account.firstName}
            onChange={(event) => {
              setAccount((current) => ({
                ...current,
                firstName: event.target.value,
              }));
              setErrors((current) => ({ ...current, firstName: undefined }));
            }}
            maxLength={40}
            autoComplete="given-name"
            className={inputClass(errors.firstName)}
          />
          {errors.firstName ? (
            <p className={FIELD_ERROR}>{errors.firstName}</p>
          ) : null}
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>نام خانوادگی</span>
          <input
            value={account.lastName}
            onChange={(event) =>
              setAccount((current) => ({
                ...current,
                lastName: event.target.value,
              }))
            }
            maxLength={40}
            autoComplete="family-name"
            className={inputClass()}
          />
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>کد ملی</span>
          <input
            dir="ltr"
            inputMode="numeric"
            value={account.nationalId}
            onChange={(event) => {
              setAccount((current) => ({
                ...current,
                nationalId: event.target.value,
              }));
              setErrors((current) => ({ ...current, nationalId: undefined }));
            }}
            maxLength={10}
            placeholder="0123456789"
            className={inputClass(errors.nationalId)}
          />
          {errors.nationalId ? (
            <p className={FIELD_ERROR}>{errors.nationalId}</p>
          ) : (
            <p className={FIELD_HINT}>
              ۱۰ رقم؛ سالم بودن رقم کنترل هم بررسی می‌شود.
            </p>
          )}
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>شهر</span>
          <input
            value={account.city}
            onChange={(event) => {
              setAccount((current) => ({
                ...current,
                city: event.target.value,
              }));
              setErrors((current) => ({ ...current, city: undefined }));
            }}
            maxLength={40}
            autoComplete="address-level2"
            placeholder="تهران"
            className={inputClass(errors.city)}
          />
          {errors.city ? <p className={FIELD_ERROR}>{errors.city}</p> : null}
        </label>

        <label className="space-y-1.5 sm:col-span-2">
          <span className={FIELD_LABEL}>آدرس</span>
          <textarea
            value={account.address}
            onChange={(event) =>
              setAccount((current) => ({
                ...current,
                address: event.target.value,
              }))
            }
            maxLength={160}
            autoComplete="street-address"
            className={textAreaClass()}
          />
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>شماره موبایل</span>
          <input
            dir="ltr"
            type="tel"
            inputMode="tel"
            value={account.phone}
            onChange={(event) => {
              setAccount((current) => ({
                ...current,
                phone: event.target.value,
              }));
              setErrors((current) => ({ ...current, phone: undefined }));
            }}
            placeholder="0912…"
            autoComplete="tel-national"
            className={inputClass(errors.phone)}
          />
          {errors.phone ? (
            <p className={FIELD_ERROR}>{errors.phone}</p>
          ) : (
            <p className={FIELD_HINT}>فقط برای تماس در صورت نیاز.</p>
          )}
        </label>

        <label className="space-y-1.5">
          <span className={FIELD_LABEL}>ایمیل</span>
          <input
            dir="ltr"
            type="email"
            value={account.email}
            onChange={(event) => {
              setAccount((current) => ({
                ...current,
                email: event.target.value,
              }));
              setErrors((current) => ({ ...current, email: undefined }));
            }}
            autoComplete="email"
            className={inputClass(errors.email)}
          />
          {errors.email ? <p className={FIELD_ERROR}>{errors.email}</p> : null}
        </label>
      </div>

      <Button type="button" variant="navy" className="h-11 px-7" onClick={save}>
        ذخیره حساب
      </Button>
    </section>
  );
}
