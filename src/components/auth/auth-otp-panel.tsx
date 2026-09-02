"use client";

import { ArrowLeft, Phone } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { AppForm, InsetField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { TrustNote } from "./trust-note";
import {
  OTP_LEN,
  smsAccount,
  smsStartDefaults,
  smsStartSchema,
  type SmsCodeValues,
  type SmsStartValues,
} from "./schema";
import { digits, onlyDigits, SUBMIT_GOLD } from "./auth-shared";
import { useSmsFlow } from "./use-sms-flow";
import { CodeStep } from "./auth-code-step";
import { LockedCard } from "./auth-locked-card";

/** 📩 Passwordless sign-in-by-SMS tab. */
export function OtpPanel() {
  const { login, showToast } = useStore();
  const flow = useSmsFlow();
  const start = useAppForm({
    schema: smsStartSchema,
    defaultValues: smsStartDefaults,
  });

  function send(v: SmsStartValues) {
    flow.send(digits(v.phone));

    showToast("کد ۵ رقمی به شمارهٔ شما پیامک شد");
  }

  function verify(v: SmsCodeValues) {
    const code = onlyDigits(v.code);

    if (code.length !== OTP_LEN) return;
    login({ firstName: "کاربر", ...smsAccount(flow.phone) });
    showToast("با پیامک وارد شدید ✨");
    flow.back();
  }

  return (
    <div className="space-y-4">
      {flow.sent ? (
        <>
          <LockedCard title="شمارهٔ قفل‌شده">
            <p className="font-black tracking-wide" dir="ltr">
              {flow.phone}
            </p>
            <p className="text-navy/70 dark:text-linen/55 mt-1 text-[11px] font-bold">
              برای عوض کردنِ شماره، اول «تغییرِ شماره» را بزنید.
            </p>
          </LockedCard>
          <CodeStep flow={flow} submitLabel="تأیید و ورود" onVerify={verify} />
        </>
      ) : (
        <>
          <AppForm
            form={start}
            onSubmit={send}
            ariaLabel="درخواستِ کد پیامکی"
            className="space-y-4"
            notify
          >
            <InsetField
              name="phone"
              label="شمارهٔ موبایل"
              icon={<Phone className="size-4" />}
              dir="ltr"
              inputMode="tel"
              autoComplete="tel-national"
              placeholder="0912…"
              inputClassName="text-left"
              required
            />
            <Button type="submit" className={SUBMIT_GOLD}>
              دریافتِ کد پیامک <ArrowLeft className="size-4" />
            </Button>
          </AppForm>
          <p className="text-navy/70 dark:text-linen/60 text-center text-[11px] font-bold">
            یک کد ۵ رقمی برای شما پیامک می‌شود. بدونِ نیاز به رمز عبور.
          </p>
          <TrustNote />
        </>
      )}
    </div>
  );
}
