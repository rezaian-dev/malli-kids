"use client";

import { ArrowLeft, Phone, User } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { AppForm, InsetField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { TrustNote } from "./trust-note";
import {
  registerDefaults,
  registerSchema,
  smsAccount,
  type RegisterValues,
} from "./schema";
import { digits, SUBMIT_GOLD } from "./auth-shared";
import { useSmsFlow } from "./use-sms-flow";
import { CodeStep } from "./auth-code-step";
import { LockedCard } from "./auth-locked-card";

/** 🆕 Name + phone → SMS-verified account creation tab. */
export function RegisterPanel() {
  const { login, showToast } = useStore();
  const flow = useSmsFlow();
  const start = useAppForm({
    schema: registerSchema,
    defaultValues: registerDefaults,
  });

  function send(v: RegisterValues) {
    flow.send(digits(v.phone), v.name.trim());

    showToast("کد ۵ رقمی به موبایل شما پیامک شد");
  }

  function verify() {
    login({ firstName: flow.name || "کاربر", ...smsAccount(flow.phone) });
    showToast(`حسابِ «${flow.name || "کاربر"}» ساخته شد ✨`);
    flow.back();
    start.reset({ ...registerDefaults });
  }

  return (
    <div className="space-y-3">
      {flow.sent ? (
        <>
          <LockedCard title="ساختِ حساب برای">
            <p className="font-black">
              {flow.name}{" "}
              <span
                className="text-navy/70 dark:text-linen/55 font-bold"
                dir="ltr"
              >
                — {flow.phone}
              </span>
            </p>
          </LockedCard>
          <CodeStep
            flow={flow}
            submitLabel="تأیید و ساختِ حساب"
            onVerify={verify}
          />
        </>
      ) : (
        <>
          <AppForm
            form={start}
            onSubmit={send}
            ariaLabel="ثبت‌نام"
            className="space-y-3.5"
            notify
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
              دریافتِ کد تأیید <ArrowLeft className="size-4" />
            </Button>
          </AppForm>
          <p className="text-navy/70 dark:text-linen/60 text-center text-[11px] font-bold">
            یک کد ۵ رقمی برای تأیید به موبایل شما پیامک می‌شود.
          </p>
          <TrustNote />
        </>
      )}
    </div>
  );
}
