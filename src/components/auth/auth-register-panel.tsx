"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Smartphone,
  User,
} from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast";
import {
  AppForm,
  Field,
  InsetField,
  SubmitButton,
  useAppForm,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { TrustNote } from "./trust-note";
import { requestSignUpOtpAction, signUpAction } from "@/lib/auth/actions";
import {
  signUpDefaults,
  signUpSchema,
  otpVerifyDefaults,
  otpVerifySchema,
  type SignUpValues,
  type OtpVerifyValues,
} from "@/lib/auth/schemas";
import { reportAuthError, SUBMIT_GOLD, useCooldown } from "./auth-shared";
import { OtpBoxes } from "./auth-code-input";
import { CodeStepActions } from "./auth-code-actions";

export function RegisterPanel() {
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [details, setDetails] = useState<SignUpValues | null>(null);
  const [shakeSignal, setShakeSignal] = useState(0);
  const [resending, setResending] = useState(false);
  const cd = useCooldown();
  const form = useAppForm({
    schema: signUpSchema,
    defaultValues: signUpDefaults,
  });
  const codeForm = useAppForm({
    schema: otpVerifySchema,
    defaultValues: otpVerifyDefaults,
  });

  async function sendCode(values: SignUpValues) {
    const result = await requestSignUpOtpAction(values);
    if (!result.ok) {
      reportAuthError(form, result);
      setShakeSignal((n) => n + 1);
      if (result.retryAfterSec) cd.restart(result.retryAfterSec);
      return;
    }
    // Password remains in component memory only, never URL/sessionStorage/localStorage.
    setDetails(values);
    codeForm.reset();
    cd.restart();
    toast.success("کد تأیید شمارهٔ موبایل ارسال شد.");
  }

  async function complete(values: OtpVerifyValues) {
    if (!details) return;
    const result = await signUpAction({ ...details, code: values.code });
    if (!result.ok) {
      reportAuthError(codeForm, result);
      setShakeSignal((n) => n + 1);
      return;
    }
    form.reset();
    codeForm.reset();
    setDetails(null);
    login(result.data);
    toast.success(`حسابِ «${result.data.firstName}» ساخته شد ✨`);
  }

  if (details)
    return (
      <AppForm
        form={codeForm}
        onSubmit={complete}
        ariaLabel="تأیید موبایل و ثبت‌نام"
        className="space-y-4"
        shakeSignal={shakeSignal}
        busy={resending}
      >
        <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-7">
          کد پیامک‌شده به{" "}
          <bdi dir="ltr" className="text-gold font-bold">
            {details.phone}
          </bdi>{" "}
          را وارد کنید. حساب تنها بعد از تأیید شماره ساخته می‌شود. اعتبار کد ۵
          دقیقه است.
        </p>
        <Field name="code" label="کد تأیید موبایل" required noShell>
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
          className={SUBMIT_GOLD}
          disabled={resending}
          pendingLabel="در حال ساخت حساب…"
        >
          تأیید و ساخت حساب <ArrowLeft className="size-4" />
        </SubmitButton>
        <CodeStepActions
          cooldown={cd}
          onResend={() => requestSignUpOtpAction(details)}
          onSent={() => codeForm.reset()}
          onPendingChange={setResending}
          backLabel="ویرایش اطلاعات"
          onBack={() => {
            setDetails(null);
            codeForm.reset();
          }}
        />
        <TrustNote />
      </AppForm>
    );

  return (
    <AppForm
      form={form}
      onSubmit={sendCode}
      ariaLabel="ثبت‌نام"
      className="space-y-3.5"
      shakeSignal={shakeSignal}
    >
      <InsetField
        name="name"
        label="نام و نام خانوادگی"
        icon={<User className="size-4" />}
        autoComplete="name"
        placeholder="سارا محمدی"
        required
      />
      <InsetField
        name="email"
        label="ایمیل"
        icon={<Mail className="size-4" />}
        type="email"
        dir="ltr"
        autoComplete="email"
        placeholder="you@mail.com"
        inputClassName="text-left"
        required
      />
      <InsetField
        name="phone"
        label="شمارهٔ موبایل"
        icon={<Smartphone className="size-4" />}
        type="tel"
        dir="ltr"
        inputMode="tel"
        autoComplete="tel"
        placeholder="09123456789"
        inputClassName="text-left"
        required
        hint="برای ورود و بازیابی رمز؛ مالکیت شماره با پیامک تأیید می‌شود."
      />
      <InsetField
        name="password"
        label="رمز عبور"
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
            className="text-gold hover:bg-gold/10 hover:text-gold size-9 shrink-0"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        }
      />
      <SubmitButton className={SUBMIT_GOLD} pendingLabel="در حال ارسال کد…">
        دریافت کد و ادامه <ArrowLeft className="size-4" />
      </SubmitButton>
      <TrustNote />
    </AppForm>
  );
}
