"use client";

import { useState } from "react";
import { ArrowLeft, KeyRound, Smartphone } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast";
import {
  AppForm,
  Field,
  InsetField,
  SubmitButton,
  useAppForm,
} from "@/components/form";
import { requestOtpAction, verifyOtpAction } from "@/lib/auth/actions";
import {
  otpRequestDefaults,
  otpRequestSchema,
  otpVerifyDefaults,
  otpVerifySchema,
  type OtpRequestValues,
  type OtpVerifyValues,
} from "@/lib/auth/schemas";
import { reportAuthError, SUBMIT_NAVY, useCooldown } from "./auth-shared";
import { OtpBoxes } from "./auth-code-input";
import { CodeStepActions } from "./auth-code-actions";

export function OtpLoginPanel() {
  const { login } = useAuth();
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

  async function sendCode(values: OtpRequestValues) {
    const result = await requestOtpAction(values);
    if (!result.ok) {
      reportAuthError(phoneForm, result);
      setShakeSignal((n) => n + 1);
      if (result.retryAfterSec) cd.restart(result.retryAfterSec);
      return;
    }
    setPhone(values.phone);
    codeForm.reset();
    cd.restart();
    toast.success("کد یک‌بارمصرف ارسال شد.");
  }

  async function verify(values: OtpVerifyValues) {
    const result = await verifyOtpAction({ ...values, phone });
    if (!result.ok) {
      reportAuthError(codeForm, result);
      setShakeSignal((n) => n + 1);
      return;
    }
    login(result.data);
    toast.success(`خوش آمدید، ${result.data.firstName} ✨`);
  }

  if (!phone)
    return (
      <AppForm
        form={phoneForm}
        onSubmit={sendCode}
        ariaLabel="ورود با کد پیامکی"
        className="space-y-3.5"
        shakeSignal={shakeSignal}
      >
        <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-6">
          شمارهٔ موبایل‌تان را وارد کنید تا کد یک‌بارمصرف پیامک شود. اگر حساب
          ندارید، بعد از تأیید شماره حساب ساخته می‌شود.
        </p>
        <InsetField
          name="phone"
          label="شمارهٔ موبایل"
          icon={<Smartphone className="size-4" />}
          type="tel"
          inputMode="tel"
          dir="ltr"
          autoComplete="tel"
          placeholder="09123456789"
          inputClassName="text-left"
          required
        />
        <SubmitButton className={SUBMIT_NAVY} pendingLabel="در حال ارسال…">
          ارسال کد پیامکی <ArrowLeft className="size-4" />
        </SubmitButton>
      </AppForm>
    );

  return (
    <AppForm
      form={codeForm}
      onSubmit={verify}
      ariaLabel="تأیید کد پیامکی"
      className="space-y-4"
      shakeSignal={shakeSignal}
      busy={resending}
    >
      <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-7">
        کد ارسال‌شده به{" "}
        <bdi dir="ltr" className="text-gold font-bold">
          {phone}
        </bdi>{" "}
        را وارد کنید. اعتبار کد ۵ دقیقه است.
      </p>
      <Field name="code" label="کد تأیید" required noShell>
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
        className={SUBMIT_NAVY}
        disabled={resending}
        pendingLabel="در حال بررسی کد…"
      >
        تأیید و ورود <KeyRound className="size-4" />
      </SubmitButton>
      <CodeStepActions
        cooldown={cd}
        onResend={() => requestOtpAction({ phone })}
        onSent={() => codeForm.reset()}
        onPendingChange={setResending}
        onBack={() => {
          setPhone("");
          codeForm.reset();
        }}
      />
    </AppForm>
  );
}
