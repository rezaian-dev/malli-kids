"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  PartyPopper,
  Smartphone,
} from "lucide-react";
import {
  AppForm,
  Field,
  InsetField,
  SubmitButton,
  useAppForm,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction, resetPasswordAction } from "@/lib/auth/actions";
import {
  forgotPasswordDefaults,
  forgotPasswordSchema,
  resetPasswordDefaults,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/auth/schemas";
import { OtpBoxes } from "./auth-code-input";
import { CodeStepActions } from "./auth-code-actions";
import { reportAuthError, SUBMIT_GOLD, useCooldown } from "./auth-shared";

export function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"phone" | "reset" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [show, setShow] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);
  const [resending, setResending] = useState(false);
  const cd = useCooldown();
  const phoneForm = useAppForm({
    schema: forgotPasswordSchema,
    defaultValues: forgotPasswordDefaults,
  });
  const resetForm = useAppForm({
    schema: resetPasswordSchema,
    defaultValues: resetPasswordDefaults,
  });

  async function sendCode(values: ForgotPasswordValues) {
    const result = await forgotPasswordAction(values);
    if (!result.ok) {
      reportAuthError(phoneForm, result);
      setShakeSignal((n) => n + 1);
      if (result.retryAfterSec) cd.restart(result.retryAfterSec);
      return;
    }
    setPhone(values.phone);
    resetForm.reset();
    cd.restart();
    setStep("reset");
    // Do not claim delivery to a number that might not belong to any account.
  }

  async function submitReset(values: ResetPasswordValues) {
    const result = await resetPasswordAction({ ...values, phone });
    if (!result.ok) {
      reportAuthError(resetForm, result);
      setShakeSignal((n) => n + 1);
      return;
    }
    resetForm.reset();
    setShow(false);
    setStep("done");
  }

  if (step === "done")
    return (
      <div className="space-y-4">
        <div
          role="status"
          className="border-gold/30 bg-sand/80 dark:bg-navy-deep/60 flex flex-col items-center gap-3 rounded-2xl border px-5 py-6 text-center"
        >
          <PartyPopper aria-hidden="true" className="text-gold size-10" />
          <p className="font-black">رمز عبور تغییر کرد</p>
          <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-7">
            با رمز جدید وارد شوید. نشست‌های قبلی حساب لغو شدند.
          </p>
        </div>
        <Button variant="navy" size="pill" className="w-full" onClick={onBack}>
          ورود به حساب
        </Button>
      </div>
    );

  if (step === "phone")
    return (
      <AppForm
        form={phoneForm}
        onSubmit={sendCode}
        ariaLabel="فراموشی رمز عبور"
        className="space-y-4"
        shakeSignal={shakeSignal}
      >
        <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-7">
          شمارهٔ موبایل تأییدشدهٔ حساب‌تان را وارد کنید. کد یک‌بارمصرف برای
          تعیین رمز جدید پیامک می‌شود؛ رمز فعلی هرگز ارسال نمی‌شود.
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
        <SubmitButton className={SUBMIT_GOLD} pendingLabel="در حال ارسال…">
          ارسال کد بازیابی <ArrowLeft className="size-4" />
        </SubmitButton>
        <p className="text-navy/70 dark:text-linen/70 text-xs leading-6">
          اگر قبلاً شمارهٔ حساب‌تان را تأیید نکرده‌اید یا به آن دسترسی ندارید،
          با پشتیبانی تماس بگیرید.
        </p>
        <Button
          type="button"
          variant="ghost"
          className="w-full text-xs font-bold"
          onClick={onBack}
          disabled={phoneForm.formState.isSubmitting}
        >
          بازگشت به ورود
        </Button>
      </AppForm>
    );

  return (
    <AppForm
      form={resetForm}
      onSubmit={submitReset}
      ariaLabel="تعیین رمز جدید"
      className="space-y-4"
      shakeSignal={shakeSignal}
      busy={resending}
    >
      <p
        className="text-navy/70 dark:text-linen/70 text-[13px] leading-7"
        role="status"
      >
        اگر{" "}
        <bdi dir="ltr" className="text-gold font-bold">
          {phone}
        </bdi>{" "}
        شمارهٔ تأییدشدهٔ یک حساب باشد، کد بازیابی برایش ارسال می‌شود. کد تا ۵
        دقیقه معتبر است.
      </p>
      <Field name="code" label="کد بازیابی" required noShell>
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
            disabled={resending || resetForm.formState.isSubmitting}
          />
        )}
      </Field>
      <InsetField
        name="password"
        label="رمز عبور جدید"
        icon={<Lock className="size-4" />}
        type={show ? "text" : "password"}
        dir="ltr"
        autoComplete="new-password"
        inputClassName="text-left"
        required
        hint="حداقل ۸ نویسه، شامل حرف انگلیسی و عدد"
        trailing={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="text-gold hover:bg-gold/10 size-9 shrink-0"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        }
      />
      <InsetField
        name="confirmPassword"
        label="تکرار رمز عبور"
        icon={<Lock className="size-4" />}
        type={show ? "text" : "password"}
        dir="ltr"
        autoComplete="new-password"
        inputClassName="text-left"
        required
      />
      <SubmitButton
        className={SUBMIT_GOLD}
        disabled={resending}
        pendingLabel="در حال ثبت…"
      >
        تعیین رمز جدید <KeyRound className="size-4" />
      </SubmitButton>
      <CodeStepActions
        cooldown={cd}
        onResend={() => forgotPasswordAction({ phone })}
        onPendingChange={setResending}
        onSent={() => {
          resetForm.resetField("code");
          resetForm.clearErrors();
        }}
        onBack={() => {
          resetForm.reset();
          setStep("phone");
        }}
        sentMessage="اگر شماره به حساب متصل باشد، کد جدید ارسال می‌شود."
      />
    </AppForm>
  );
}
