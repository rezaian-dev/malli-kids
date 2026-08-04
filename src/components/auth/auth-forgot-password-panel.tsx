"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Mail, MailCheck } from "lucide-react";
import { useCooldown } from "@/hooks/use-cooldown";
import { AppForm, InsetField, SubmitButton, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { forgotPasswordAction } from "@/lib/auth/actions";
import {
  forgotPasswordDefaults,
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/auth/schemas";
import { SUBMIT_GOLD } from "./auth-shared";

/** 📮 "Sent!" state — same shape everywhere a card needs to call out one
 *  highlighted line, e.g. the address a link was just sent to. */
function SentCard({ email }: { email: string }) {
  return (
    <div
      className={cn(
        "mx-auto flex flex-col items-center gap-3 rounded-2xl border px-5 py-6 text-center",
        "border-gold/30 bg-sand/80",
        "dark:border-gold/25 dark:bg-navy-deep/60",
      )}
    >
      <span className="bg-gold/12 text-gold flex size-14 items-center justify-center rounded-full">
        <MailCheck className="size-6" />
      </span>
      <div>
        <p className="text-navy dark:text-ivory font-black">ایمیل را بررسی کنید</p>
        <p className="text-navy/70 dark:text-linen/70 mt-1.5 text-[13px] leading-6">
          اگر حسابی با این نشانی وجود داشته باشد، لینکِ بازنشانیِ رمز برایش ارسال شد:
        </p>
        <p className="text-gold mt-1.5 text-sm font-black" dir="ltr">
          {email}
        </p>
      </div>
    </div>
  );
}

/** 🔁 Forgot-password step, swapped into the modal in place of the login
 *  tab: email → "check your inbox" with a resend cooldown, same rhythm as
 *  the rest of the auth flows. */
export function ForgotPasswordPanel({ onBack }: { onBack: () => void }) {
  const [sentTo, setSentTo] = useState("");
  const cd = useCooldown();
  const form = useAppForm({
    schema: forgotPasswordSchema,
    defaultValues: forgotPasswordDefaults,
  });

  async function send(v: ForgotPasswordValues) {
    await forgotPasswordAction(v);
    setSentTo(v.email);
    cd.restart();
  }

  async function resend() {
    await forgotPasswordAction({ email: sentTo });
    cd.restart();
  }

  if (sentTo) {
    return (
      <div className="space-y-4">
        <SentCard email={sentTo} />

        <div className="flex items-center justify-between text-[11px] font-bold">
          {cd.sec > 0 ? (
            <span className="text-navy/70 dark:text-linen/70">
              ارسالِ دوباره تا {cd.sec} ثانیه
            </span>
          ) : (
            <Button
              type="button"
              variant="link"
              className="text-gold h-auto p-0 text-[11px] font-bold"
              onClick={resend}
            >
              ارسالِ دوبارهٔ لینک
            </Button>
          )}
          <Button
            type="button"
            variant="link"
            className="text-navy/70 dark:text-linen/70 h-auto p-0 text-[11px] font-bold"
            onClick={onBack}
          >
            بازگشت به ورود <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <AppForm
      form={form}
      onSubmit={send}
      ariaLabel="فراموشیِ رمز عبور"
      className="space-y-4"
      notify
    >
      <p className="text-navy/70 dark:text-linen/70 -mt-1 text-[13px] leading-6">
        ایمیلِ حساب‌تان را وارد کنید تا لینکِ بازنشانیِ رمز برایتان ارسال شود.
      </p>

      <InsetField
        name="email"
        label="ایمیل"
        icon={<Mail className="size-4" />}
        type="email"
        dir="ltr"
        autoComplete="username"
        placeholder="you@mail.com"
        inputClassName="text-left"
        required
      />

      <SubmitButton className={SUBMIT_GOLD} pendingLabel="در حال ارسال…">
        ارسالِ لینکِ بازنشانی <ArrowLeft className="size-4" />
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
