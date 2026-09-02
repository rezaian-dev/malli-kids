"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { RE } from "@/lib/forms";
import { AppForm, InsetField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrustNote } from "./trust-note";
import {
  loginDefaults,
  loginSchema,
  smsAccount,
  type LoginValues,
} from "./schema";
import { digits, SUBMIT_NAVY } from "./auth-shared";

/** 🔑 Email/phone + password sign-in tab. */
export function LoginPanel({ onOtp }: { onOtp: () => void }) {
  const { login, showToast } = useStore();
  const [show, setShow] = useState(false);
  const form = useAppForm({
    schema: loginSchema,
    defaultValues: loginDefaults,
  });

  function onValid({ identifier }: LoginValues) {
    const id = identifier.trim();
    const tel = digits(id);
    const isMobile = RE.mobile.test(tel);
    login({
      firstName: isMobile ? "کاربر" : id.split("@")[0],
      email: isMobile ? smsAccount(tel).email : id,
      phone: isMobile ? tel : undefined,
    });
    showToast("خوش آمدید ✨");
    form.reset();
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
      ariaLabel="ورود با رمز عبور"
      className="space-y-3.5"
      notify
    >
      <InsetField
        name="identifier"
        label="ایمیل یا موبایل"
        icon={<Mail className="size-4" />}
        dir="ltr"
        autoComplete="username"
        placeholder="you@mail.com"
        inputClassName="text-left"
        required
      />

      <InsetField
        name="password"
        label="رمز عبور"
        icon={<Lock className="size-4" />}
        type={show ? "text" : "password"}
        dir="ltr"
        autoComplete="current-password"
        inputClassName="text-left"
        required
        hint="حداقل ۶ نویسه"
        trailing={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn(
              "size-8 shrink-0",
              "text-gold hover:bg-gold/10 hover:text-gold",
            )}
            onClick={() => setShow((s) => !s)}
            aria-label={show ? "پنهان کردنِ رمز" : "نمایشِ رمز"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        }
      />

      <Button type="submit" className={SUBMIT_NAVY}>
        ورود به حساب <ArrowLeft className="size-4" />
      </Button>

      <Button
        type="button"
        variant="link"
        className="text-gold w-full text-xs font-bold"
        onClick={onOtp}
      >
        ورود بدونِ رمز، با پیامک
      </Button>

      <TrustNote />
    </AppForm>
  );
}
