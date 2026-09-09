"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  PartyPopper,
  RotateCcw,
  Smartphone,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { toFaDigits } from "@/lib/locale/fa";
import { AppForm, Field, InsetField, SubmitButton, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction, resetPasswordAction } from "@/lib/auth/actions";
import {
  forgotPasswordDefaults,
  forgotPasswordSchema,
  OTP_LEN,
  resetPasswordDefaults,
  resetPasswordSchema,
  type ForgotPasswordValues,
  type ResetPasswordValues,
} from "@/lib/auth/schemas";
import { OtpBoxes } from "./auth-otp-panel";
import { SUBMIT_GOLD, useCooldown } from "./auth-shared";

/** 🎉 Same "done" shape as elsewhere in the modal — one highlighted result card. */
function SuccessCard() {
  return (
    <div className="mx-auto flex flex-col items-center gap-3 rounded-2xl border px-5 py-6 text-center border-gold/30 bg-sand/80 dark:border-gold/25 dark:bg-navy-deep/60">
      <span className="bg-gold/12 text-gold flex size-14 items-center justify-center rounded-full">
        <PartyPopper className="size-6" />
      </span>
      <div>
        <p className="text-navy dark:text-ivory font-black">رمز عبور تغییر کرد</p>
        <p className="text-navy/70 dark:text-linen/70 mt-1.5 text-[13px] leading-6">
          می‌توانید با رمزِ جدید وارد حساب‌تان شوید.
        </p>
      </div>
    </div>
  );
}

// 🔁 Forgot-password step, all inline (no email link anymore): phone → OTP +
// new password → done. Same two-step shape as `OtpLoginPanel`, sharing its
// `OtpBoxes`, just ending in a password instead of a session.
export function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const [step, setStep] = useState<"phone" | "reset" | "done">("phone");
  const [phone, setPhone] = useState("");
  const [show, setShow] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);
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
      toast.error(result.error);
      return;
    }
    setPhone(values.phone);
    cd.restart();
    setStep("reset");
    toast.success(`کد به ${values.phone} پیامک شد`);
  }

  async function resend() {
    const result = await forgotPasswordAction({ phone });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    cd.restart();
    toast.info("کد دوباره ارسال شد");
  }

  async function submitReset(values: ResetPasswordValues) {
    const result = await resetPasswordAction({ ...values, phone });
    if (!result.ok) {
      toast.error(result.error);
      setShakeSignal((n) => n + 1);
      return;
    }
    setStep("done");
  }

  if (step === "done") {
    return (
      <div className="space-y-4">
        <SuccessCard />
        <Button variant="navy" size="pill" className="w-full" onClick={onBack}>
          ورود به حساب
        </Button>
      </div>
    );
  }

  if (step === "phone") {
    return (
      <AppForm
        form={phoneForm}
        onSubmit={sendCode}
        ariaLabel="فراموشیِ رمز عبور"
        className="space-y-4"
        notify
      >
        <p className="text-navy/70 dark:text-linen/70 -mt-1 text-[13px] leading-6">
          شمارهٔ موبایلِ حساب‌تان را وارد کنید تا کدِ بازنشانیِ رمز برایتان پیامک شود.
        </p>

        <InsetField
          name="phone"
          label="شمارهٔ موبایل"
          icon={<Smartphone className="size-4" />}
          type="tel"
          inputMode="numeric"
          dir="ltr"
          autoComplete="tel"
          placeholder="0912xxxxxxx"
          inputClassName="text-left"
          required
        />

        <SubmitButton className={SUBMIT_GOLD} pendingLabel="در حال ارسال…">
          ارسالِ کدِ پیامکی <ArrowLeft className="size-4" />
        </SubmitButton>

        <Button
          type="button"
          variant="ghost"
          className="text-navy/70 dark:text-linen/70 w-full text-xs font-bold"
          onClick={onBack}
        >
          بازگشت به ورود
        </Button>
      </AppForm>
    );
  }

  return (
    // 🩹 Same clipping fix as the OTP-login code step — no scrollbar pop mid-animation.
    <div className="overflow-hidden">
      <AppForm
        form={resetForm}
        onSubmit={submitReset}
        ariaLabel="تعیینِ رمزِ جدید"
        className="animate-fade-up space-y-4"
        shakeSignal={shakeSignal}
      >
        <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-6">
          کدِ {toFaDigits(OTP_LEN)} رقمیِ ارسال‌شده به{" "}
          <span dir="ltr" className="text-gold font-black">
            {phone}
          </span>{" "}
          را وارد کنید و رمزِ جدید را انتخاب کنید.
        </p>

        <Field name="code" label="کدِ تأیید" required noShell>
          {({ field, invalid }) => (
            <OtpBoxes
              value={String(field.value ?? "")}
              onChange={field.onChange}
              invalid={invalid}
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
          trailing={
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8 shrink-0 text-gold hover:bg-gold/10 hover:text-gold"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? "پنهان کردنِ رمز" : "نمایشِ رمز"}
            >
              {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </Button>
          }
        />

        <InsetField
          name="confirmPassword"
          label="تکرارِ رمز عبور"
          icon={<Lock className="size-4" />}
          type={show ? "text" : "password"}
          dir="ltr"
          autoComplete="new-password"
          inputClassName="text-left"
          required
        />

        <SubmitButton className={SUBMIT_GOLD} pendingLabel="در حال ثبت…">
          تعیینِ رمز جدید <KeyRound className="size-4" />
        </SubmitButton>

        <div className="flex items-center justify-between text-[11px] font-bold">
          {cd.sec > 0 ? (
            <span className="text-navy/70 dark:text-linen/70">
              ارسالِ دوباره تا {toFaDigits(cd.sec)} ثانیه
            </span>
          ) : (
            <Button
              type="button"
              variant="link"
              className="text-gold h-auto gap-1 p-0 text-[11px] font-bold"
              onClick={resend}
            >
              <RotateCcw className="size-3.5" /> ارسالِ دوبارهٔ کد
            </Button>
          )}
          <Button
            type="button"
            variant="link"
            className="text-navy/70 dark:text-linen/70 h-auto p-0 text-[11px] font-bold"
            onClick={() => setStep("phone")}
          >
            بازگشت <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </AppForm>
    </div>
  );
}
