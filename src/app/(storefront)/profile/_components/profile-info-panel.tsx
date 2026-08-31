"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/providers/store-provider";
import { phoneDigits, toLatinDigits } from "@/lib/digits";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PROFILE_CARD } from "./profile-shared";

type AccountState = {
  firstName: string;
  lastName: string;
  nationalId: string;
  city: string;
  address: string;
  phone: string;
  email: string;
};

type ChildState = {
  childName: string;
  childAge: string;
  childGender: string;
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

const EMPTY_CHILD: ChildState = {
  childName: "",
  childAge: "",
  childGender: "",
};

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(value);
}

function isIranianNationalId(value: string) {
  const code = toLatinDigits(value).trim();
  if (!/^\d{10}$/.test(code) || /^(\d)\1{9}$/.test(code)) return false;
  const check = Number(code[9]);
  let sum = 0;
  for (let index = 0; index < 9; index += 1) {
    sum += Number(code[index]) * (10 - index);
  }
  const rest = sum % 11;
  return rest < 2 ? check === rest : check === 11 - rest;
}

function inputClass(error?: string) {
  return [
    "h-11 w-full rounded-2xl border bg-transparent px-4 text-sm text-navy outline-none transition-[color,box-shadow,border-color] duration-200 dark:text-ivory",
    error
      ? "border-rose"
      : "border-navy/12 focus:border-gold focus:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-gold/25 dark:focus:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]",
  ].join(" ");
}

function textAreaClass(error?: string) {
  return [
    "min-h-28 w-full rounded-2xl border bg-transparent px-4 py-3 text-sm text-navy outline-none transition-[color,box-shadow,border-color] duration-200 dark:text-ivory",
    error
      ? "border-rose"
      : "border-navy/12 focus:border-gold focus:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-gold/25 dark:focus:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]",
  ].join(" ");
}

// 👤 Native account forms keep profile settings light and reliable.
export function ProfileInfoPanel() {
  const { user, updateUser } = useStore();
  const [account, setAccount] = useState<AccountState>(EMPTY_ACCOUNT);
  const [child, setChild] = useState<ChildState>(EMPTY_CHILD);
  const [accountErrors, setAccountErrors] = useState<Partial<AccountState>>({});
  const [childErrors, setChildErrors] = useState<Partial<ChildState>>({});

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
    setChild({
      childName: user.childName || "",
      childAge: user.childAge || "",
      childGender:
        user.childGender === "دختر" || user.childGender === "پسر"
          ? user.childGender
          : "",
    });
  }, [user]);

  if (!user) return null;

  function validateAccountForm() {
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

    setAccountErrors(next);
    return Object.keys(next).length === 0;
  }

  function validateChildForm() {
    const next: Partial<ChildState> = {};
    const age = child.childAge.trim();
    const gender = child.childGender.trim();

    if (age && !/^[0-9۰-۹]{1,2}(\s*(?:سال|ساله|ماه))?$/.test(age)) {
      next.childAge = "سن را ساده بنویسید، مثل ۳ سال.";
    }
    if (gender && gender !== "دختر" && gender !== "پسر") {
      next.childGender = "فقط دختر یا پسر را انتخاب کنید.";
    }

    setChildErrors(next);
    return Object.keys(next).length === 0;
  }

  function saveAccount() {
    if (!validateAccountForm()) return;
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

  function saveChild() {
    if (!validateChildForm()) return;
    updateUser({
      childName: child.childName.trim() || undefined,
      childAge: child.childAge.trim() || undefined,
      childGender: child.childGender.trim() || undefined,
    });
    toast.success("اطلاعات کوچولو ذخیره شد ✅");
  }

  return (
    <>
      <section className={PROFILE_CARD}>
        <div>
          <h2 className="text-navy dark:text-linen text-lg font-black">
            ویرایش حساب
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              نام
            </span>
            <input
              value={account.firstName}
              onChange={(event) => {
                setAccount((current) => ({
                  ...current,
                  firstName: event.target.value,
                }));
                setAccountErrors((current) => ({
                  ...current,
                  firstName: undefined,
                }));
              }}
              maxLength={40}
              autoComplete="given-name"
              className={inputClass(accountErrors.firstName)}
            />
            {accountErrors.firstName ? (
              <p className="text-rose text-xs font-bold">
                {accountErrors.firstName}
              </p>
            ) : null}
          </label>

          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              نام خانوادگی
            </span>
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
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              کد ملی
            </span>
            <input
              dir="ltr"
              inputMode="numeric"
              value={account.nationalId}
              onChange={(event) => {
                setAccount((current) => ({
                  ...current,
                  nationalId: event.target.value,
                }));
                setAccountErrors((current) => ({
                  ...current,
                  nationalId: undefined,
                }));
              }}
              maxLength={10}
              placeholder="0123456789"
              className={inputClass(accountErrors.nationalId)}
            />
            {accountErrors.nationalId ? (
              <p className="text-rose text-xs font-bold">
                {accountErrors.nationalId}
              </p>
            ) : (
              <p className="text-navy/45 dark:text-wheat text-[11px] font-bold">
                ۱۰ رقم؛ سالم بودن رقم کنترل هم بررسی می‌شود.
              </p>
            )}
          </label>

          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              شهر
            </span>
            <input
              value={account.city}
              onChange={(event) => {
                setAccount((current) => ({
                  ...current,
                  city: event.target.value,
                }));
                setAccountErrors((current) => ({
                  ...current,
                  city: undefined,
                }));
              }}
              maxLength={40}
              autoComplete="address-level2"
              placeholder="تهران"
              className={inputClass(accountErrors.city)}
            />
            {accountErrors.city ? (
              <p className="text-rose text-xs font-bold">
                {accountErrors.city}
              </p>
            ) : null}
          </label>

          <label className="space-y-1.5 sm:col-span-2">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              آدرس
            </span>
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
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              شماره موبایل
            </span>
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
                setAccountErrors((current) => ({
                  ...current,
                  phone: undefined,
                }));
              }}
              placeholder="0912…"
              autoComplete="tel-national"
              className={inputClass(accountErrors.phone)}
            />
            {accountErrors.phone ? (
              <p className="text-rose text-xs font-bold">
                {accountErrors.phone}
              </p>
            ) : (
              <p className="text-navy/45 dark:text-wheat text-[11px] font-bold">
                فقط برای تماس در صورت نیاز.
              </p>
            )}
          </label>

          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              ایمیل
            </span>
            <input
              dir="ltr"
              type="email"
              value={account.email}
              onChange={(event) => {
                setAccount((current) => ({
                  ...current,
                  email: event.target.value,
                }));
                setAccountErrors((current) => ({
                  ...current,
                  email: undefined,
                }));
              }}
              autoComplete="email"
              className={inputClass(accountErrors.email)}
            />
            {accountErrors.email ? (
              <p className="text-rose text-xs font-bold">
                {accountErrors.email}
              </p>
            ) : null}
          </label>
        </div>

        <Button
          type="button"
          variant="navy"
          className="h-11 px-7"
          onClick={saveAccount}
        >
          ذخیره حساب
        </Button>
      </section>

      <section className={PROFILE_CARD}>
        <div>
          <h2 className="text-navy dark:text-linen text-lg font-black">
            اطلاعات کوچولو
          </h2>
          <p className="text-navy/50 dark:text-wheat mt-2 text-xs">
            اختیاری است؛ اگر پرش کنید، سایز دقیق‌تری پیشنهاد می‌دهیم.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              نام کوچولو
            </span>
            <input
              value={child.childName}
              onChange={(event) =>
                setChild((current) => ({
                  ...current,
                  childName: event.target.value,
                }))
              }
              maxLength={40}
              placeholder="نیلو"
              className={inputClass()}
            />
          </label>

          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              سن تقریبی
            </span>
            <input
              value={child.childAge}
              onChange={(event) => {
                setChild((current) => ({
                  ...current,
                  childAge: event.target.value,
                }));
                setChildErrors((current) => ({
                  ...current,
                  childAge: undefined,
                }));
              }}
              placeholder="۳ سال"
              className={inputClass(childErrors.childAge)}
            />
            {childErrors.childAge ? (
              <p className="text-rose text-xs font-bold">
                {childErrors.childAge}
              </p>
            ) : (
              <p className="text-navy/45 dark:text-wheat text-[11px] font-bold">
                عدد + سال یا ماه کافی است.
              </p>
            )}
          </label>

          <label className="space-y-1.5">
            <span className="text-navy/60 dark:text-wheat text-xs font-black">
              جنسیت
            </span>
            <Select
              value={child.childGender || undefined}
              onValueChange={(value) => {
                setChild((current) => ({
                  ...current,
                  childGender: value,
                }));
                setChildErrors((current) => ({
                  ...current,
                  childGender: undefined,
                }));
              }}
              dir="rtl"
            >
              <SelectTrigger
                aria-invalid={Boolean(childErrors.childGender) || undefined}
                className={
                  childErrors.childGender
                    ? "h-11 bg-transparent shadow-none"
                    : "border-navy/12 dark:border-gold/25 h-11 bg-transparent shadow-none"
                }
              >
                <SelectValue placeholder="انتخاب کنید" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="دختر">دختر</SelectItem>
                <SelectItem value="پسر">پسر</SelectItem>
              </SelectContent>
            </Select>
            {childErrors.childGender ? (
              <p className="text-rose text-xs font-bold">
                {childErrors.childGender}
              </p>
            ) : null}
          </label>
        </div>

        <Button
          type="button"
          variant="gold"
          className="h-11 px-7"
          onClick={saveChild}
        >
          ذخیره اطلاعات کودک
        </Button>
      </section>
    </>
  );
}
