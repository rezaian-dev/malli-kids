"use client";

import { useState } from "react";
import { KeyRound, Smartphone } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast";
import {
  AppForm,
  Field,
  InsetField,
  SubmitButton,
  useAppForm,
} from "@/components/form";
import {
  requestRecoveryPhoneAction,
  verifyRecoveryPhoneAction,
} from "@/lib/auth/actions";
import {
  otpRequestDefaults,
  otpRequestSchema,
  otpVerifyDefaults,
  otpVerifySchema,
  type OtpRequestValues,
  type OtpVerifyValues,
} from "@/lib/auth/schemas";
import { OtpBoxes } from "@/components/auth/auth-code-input";
import { CodeStepActions } from "@/components/auth/auth-code-actions";
import { reportAuthError, useCooldown } from "@/components/auth/auth-shared";
import { PROFILE_CARD } from "./profile-shared";
import { SECTION_TITLE } from "../_lib/profile-form-styles";

export function RecoveryPhoneForm() {
  const { user, updateUser } = useAuth();
  const [phone, setPhone] = useState("");
  const [shakeSignal, setShakeSignal] = useState(0);
  const [resending, setResending] = useState(false);
  const cd = useCooldown();
  const phoneForm = useAppForm({
    schema: otpRequestSchema,
    defaultValues: otpRequestDefaults,
  });
  const codeForm = useAppForm({
    schema: otpVerifySchema,
    defaultValues: otpVerifyDefaults,
  });

  async function send(values: OtpRequestValues) {
    const result = await requestRecoveryPhoneAction(values);
    if (!result.ok) {
      reportAuthError(phoneForm, result);
      setShakeSignal((n) => n + 1);
      if (result.retryAfterSec) cd.restart(result.retryAfterSec);
      return;
    }
    codeForm.reset();
    setPhone(values.phone);
    cd.restart();
  }

  async function verify(values: OtpVerifyValues) {
    const result = await verifyRecoveryPhoneAction({ ...values, phone });
    if (!result.ok) {
      reportAuthError(codeForm, result);
      setShakeSignal((n) => n + 1);
      return;
    }
    updateUser(result.data);
    setPhone("");
    codeForm.reset();
    phoneForm.reset();
    toast.success("شمارهٔ بازیابی حساب تأیید شد.");
  }

  if (!user) return null;

  if (phone)
    return (
      <AppForm
        form={codeForm}
        onSubmit={verify}
        ariaLabel="تأیید شمارهٔ بازیابی"
        className={PROFILE_CARD}
        shakeSignal={shakeSignal}
        busy={resending}
      >
        <h2 className={SECTION_TITLE}>تأیید شمارهٔ بازیابی</h2>
        <p className="text-sm leading-7">
          کد پیامک‌شده به <bdi dir="ltr">{phone}</bdi> را وارد کنید. تا پایان
          تأیید، شمارهٔ قبلی تغییر نمی‌کند.
        </p>
        <Field name="code" label="کد تأیید شمارهٔ بازیابی" required noShell>
          {({ field, invalid, id, describedBy }) => (
            <OtpBoxes
              id={id}
              name={field.name}
              inputRef={field.ref}
              onBlur={field.onBlur}
              describedBy={describedBy}
              value={String(field.value ?? "")}
              onChange={field.onChange}
              invalid={invalid}
              disabled={resending || codeForm.formState.isSubmitting}
            />
          )}
        </Field>
        <SubmitButton
          variant="navy"
          className="h-11 px-7"
          disabled={resending}
          pendingLabel="در حال تأیید…"
        >
          تأیید شماره <KeyRound className="size-4" />
        </SubmitButton>
        <CodeStepActions
          cooldown={cd}
          onResend={() => requestRecoveryPhoneAction({ phone })}
          onPendingChange={setResending}
          onSent={() => codeForm.reset()}
          onBack={() => {
            setPhone("");
            codeForm.reset();
          }}
        />
      </AppForm>
    );

  return (
    <AppForm
      form={phoneForm}
      onSubmit={send}
      ariaLabel="امنیت و بازیابی حساب"
      className={PROFILE_CARD}
      shakeSignal={shakeSignal}
    >
      <h2 className={SECTION_TITLE}>امنیت و بازیابی حساب</h2>
      <p className="text-sm leading-7">
        {user.recoveryPhone ? (
          <>
            شمارهٔ تأییدشده:{" "}
            <bdi dir="ltr" className="font-bold">
              {user.recoveryPhone}
            </bdi>
            ؛ کد ورود و بازیابی رمز به این شماره ارسال می‌شود.
          </>
        ) : (
          "هنوز شمارهٔ بازیابی تأییدشده ندارید. برای استفاده از فراموشی رمز پیامکی، شمارهٔ خود را تأیید کنید."
        )}
      </p>
      <InsetField
        name="phone"
        label={
          user.recoveryPhone
            ? "شمارهٔ جدید بازیابی"
            : "شمارهٔ موبایل برای بازیابی"
        }
        icon={<Smartphone className="size-4" />}
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        dir="ltr"
        placeholder="09123456789"
        inputClassName="text-left"
        required
        hint="شمارهٔ تماس سفارش‌ها، شمارهٔ بازیابی حساب را تغییر نمی‌دهد."
      />
      <SubmitButton
        variant="navy"
        className="h-11 px-7"
        pendingLabel="در حال ارسال…"
      >
        دریافت کد تأیید
      </SubmitButton>
    </AppForm>
  );
}
