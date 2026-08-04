"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toast } from "@/lib/toast";
import { AppForm, InsetField, SubmitButton, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrustNote } from "./trust-note";
import { OtpLoginPanel } from "./auth-otp-panel";
import { signInAction } from "@/lib/auth/actions";
import {
  signInDefaults,
  signInSchema,
  type SignInValues,
} from "@/lib/auth/schemas";
import { SUBMIT_NAVY } from "./auth-shared";

const METHOD_BTN = cn(
  "inline-flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[12px] font-extrabold transition-colors",
  "text-navy/70 hover:text-navy dark:text-linen/70 dark:hover:text-ivory",
);
const METHOD_BTN_ON = cn(
  "bg-navy text-ivory shadow-sm",
  "dark:bg-gold dark:text-navy-deep dark:shadow-gold/40",
);

/** 🔑 Email + password *or* phone OTP — a small segmented switch on top of
 *  the login tab decides which; both end at the same `login()` call. */
export function LoginPanel({ onForgot }: { onForgot: () => void }) {
  const [method, setMethod] = useState<"password" | "otp">("password");

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "grid grid-cols-2 gap-1 rounded-2xl p-1",
          "bg-sand ring-navy/5 ring-1",
          "dark:bg-navy-deep/70 dark:ring-white/10",
        )}
        role="tablist"
        aria-label="روش ورود"
      >
        <button
          type="button"
          role="tab"
          aria-selected={method === "password"}
          onClick={() => setMethod("password")}
          className={cn(METHOD_BTN, method === "password" && METHOD_BTN_ON)}
        >
          <Lock className="size-3.5" /> رمز عبور
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={method === "otp"}
          onClick={() => setMethod("otp")}
          className={cn(METHOD_BTN, method === "otp" && METHOD_BTN_ON)}
        >
          <KeyRound className="size-3.5" /> کدِ پیامکی
        </button>
      </div>

      {method === "password" ? (
        <PasswordLoginPanel onForgot={onForgot} />
      ) : (
        <OtpLoginPanel />
      )}
    </div>
  );
}

/** 🔑 Email + password sign-in — the original login form, unchanged. */
function PasswordLoginPanel({ onForgot }: { onForgot: () => void }) {
  const { login, showToast } = useStore();
  const [show, setShow] = useState(false);
  const form = useAppForm({ schema: signInSchema, defaultValues: signInDefaults });

  async function onValid(values: SignInValues) {
    const result = await signInAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    login(result.data);
    showToast(`خوش آمدید، ${result.data.firstName} ✨`);
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

      <InsetField
        name="password"
        label="رمز عبور"
        icon={<Lock className="size-4" />}
        type={show ? "text" : "password"}
        dir="ltr"
        autoComplete="current-password"
        inputClassName="text-left"
        required
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

      <Button
        type="button"
        variant="link"
        className="text-gold -mt-1.5 h-auto w-full justify-end p-0 text-xs font-bold"
        onClick={onForgot}
      >
        فراموشیِ رمز عبور؟
      </Button>

      <SubmitButton className={SUBMIT_NAVY} pendingLabel="در حال ورود…">
        ورود به حساب <ArrowLeft className="size-4" />
      </SubmitButton>

      <TrustNote />
    </AppForm>
  );
}
