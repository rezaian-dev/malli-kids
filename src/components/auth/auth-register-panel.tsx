"use client";

import { useState } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toast } from "@/lib/toast";
import { AppForm, InsetField, SubmitButton, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TrustNote } from "./trust-note";
import { signUpAction } from "@/lib/auth/actions";
import {
  signUpDefaults,
  signUpSchema,
  type SignUpValues,
} from "@/lib/auth/schemas";
import { SUBMIT_GOLD } from "./auth-shared";

/** 🆕 Name + email + password → account-creation tab. */
export function RegisterPanel() {
  const { login, showToast } = useStore();
  const [show, setShow] = useState(false);
  const form = useAppForm({ schema: signUpSchema, defaultValues: signUpDefaults });

  async function onValid(values: SignUpValues) {
    const result = await signUpAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    login(result.data);
    showToast(`حسابِ «${result.data.firstName}» ساخته شد ✨`);
    form.reset();
  }

  return (
    <AppForm
      form={form}
      onSubmit={onValid}
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
        autoComplete="new-password"
        inputClassName="text-left"
        required
        hint="حداقل ۸ نویسه، شاملِ حرف و عدد"
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

      <SubmitButton className={SUBMIT_GOLD} pendingLabel="در حال ساختِ حساب…">
        ساختِ حساب <ArrowLeft className="size-4" />
      </SubmitButton>

      <TrustNote />
    </AppForm>
  );
}
