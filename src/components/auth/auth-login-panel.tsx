"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, KeyRound, Lock, Mail } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import { toast } from "@/lib/toast";
import {
  AppForm,
  InsetField,
  SubmitButton,
  useAppForm,
} from "@/components/form";
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
import { reportAuthError, SUBMIT_NAVY } from "./auth-shared";

const METHOD_BTN =
  "inline-flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-xl px-2 text-[12px] font-extrabold transition-colors text-navy/70 hover:text-navy dark:text-linen/70 dark:hover:text-ivory";
const METHOD_BTN_ON =
  "bg-navy text-ivory shadow-sm dark:bg-gold dark:text-navy-deep dark:shadow-gold/40";

export function LoginPanel({ onForgot }: { onForgot: () => void }) {
  const [method, setMethod] = useState<"password" | "otp">("password");

  return (
    <div className="space-y-4">
      <div
        className="bg-sand ring-navy/5 dark:bg-navy-deep/70 grid grid-cols-2 gap-1 rounded-2xl p-1 ring-1 dark:ring-white/10"
        role="group"
        aria-label="روش ورود"
      >
        <button
          type="button"
          aria-pressed={method === "password"}
          onClick={() => setMethod("password")}
          className={cn(METHOD_BTN, method === "password" && METHOD_BTN_ON)}
        >
          <Lock className="size-3.5" /> رمز عبور
        </button>
        <button
          type="button"
          aria-pressed={method === "otp"}
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

/** Email + password sign-in — the original login form, unchanged. */
function PasswordLoginPanel({ onForgot }: { onForgot: () => void }) {
  const { login } = useAuth();
  const [show, setShow] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);
  const form = useAppForm({
    schema: signInSchema,
    defaultValues: signInDefaults,
  });

  async function onValid(values: SignInValues) {
    const result = await signInAction(values);
    if (!result.ok) {
      reportAuthError(form, result);
      setShakeSignal((n) => n + 1);
      return;
    }
    login(result.data);
    toast(`خوش آمدید، ${result.data.firstName} ✨`);
    form.reset();
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
      ariaLabel="ورود با رمز عبور"
      className="space-y-3.5"
      shakeSignal={shakeSignal}
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
            className="text-gold hover:bg-gold/10 hover:text-gold size-9 shrink-0"
            onClick={() => setShow((s) => !s)}
            aria-pressed={show}
            aria-label={show ? "پنهان کردنِ رمز" : "نمایشِ رمز"}
          >
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </Button>
        }
      />

      <Button
        type="button"
        variant="link"
        className="text-gold -mt-1.5 min-h-10 w-full justify-end p-0 text-xs font-bold"
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
