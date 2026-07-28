"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  PartyPopper,
  ShieldAlert,
} from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toast } from "@/lib/toast";
import { AppForm, InsetField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SUBMIT_NAVY } from "@/components/auth/auth-shared";
import { resetPasswordAction } from "@/lib/auth/actions";
import { resetPasswordSchema, type ResetPasswordValues } from "@/lib/auth/schemas";

const PAGE = "flex min-h-[70dvh] items-center justify-center px-4 py-14";
const CARD = cn(
  "bg-paper dark:bg-dusk mx-auto w-full max-w-md rounded-[28px] border p-7 sm:p-9",
  "border-gold/35 shadow-[0_28px_80px_-20px_rgba(4,20,39,.35)]",
  "dark:border-gold/40",
);
const BADGE = "mx-auto flex size-14 items-center justify-center rounded-full";

function Brand() {
  return (
    <p className="text-gold mb-4 text-center text-[11px] font-black tracking-[0.2em]">
      MALLI KIDS
    </p>
  );
}

// 💪 A tiny, dependency-free strength read — length + variety, nothing
// fancier is needed for a "does this look reasonable" nudge.
function strengthOf(value: string) {
  let score = 0;
  if (value.length >= 8) score++;
  if (/[A-Za-z]/.test(value) && /\d/.test(value)) score++;
  if (value.length >= 12 || /[^A-Za-z0-9]/.test(value)) score++;
  return score;
}

const STRENGTH = [
  { label: "خیلی ضعیف", tone: "bg-rose" },
  { label: "ضعیف", tone: "bg-rose" },
  { label: "متوسط", tone: "bg-gold" },
  { label: "قوی", tone: "bg-navy dark:bg-gold-light" },
] as const;

function StrengthMeter({ value }: { value: string }) {
  if (!value) return null;
  const score = strengthOf(value);
  const { label, tone } = STRENGTH[score];

  return (
    <div className="-mt-1.5 flex items-center gap-2">
      <div className="flex flex-1 gap-1">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              i < score ? tone : "bg-navy/10 dark:bg-white/10",
            )}
          />
        ))}
      </div>
      <span className="text-navy/70 dark:text-linen/70 text-[11px] font-bold">
        {label}
      </span>
    </div>
  );
}

function InvalidCard() {
  return (
    <div className={CARD}>
      <Brand />
      <div className="space-y-3 text-center">
        <span className={cn(BADGE, "bg-rose/10 text-rose")}>
          <ShieldAlert className="size-6" />
        </span>
        <h1 className="text-navy dark:text-ivory text-lg font-black">
          لینک نامعتبر است
        </h1>
        <p className="text-navy/70 dark:text-linen/70 text-sm leading-7">
          این لینکِ بازنشانی منقضی شده یا قبلاً استفاده شده. از صفحهٔ ورود، دوباره
          «فراموشیِ رمز عبور» را بزنید.
        </p>
        <Button variant="navy" size="pill" className="w-full" asChild>
          <Link href="/">بازگشت به فروشگاه</Link>
        </Button>
      </div>
    </div>
  );
}

function SuccessCard() {
  const { setAuthOpen } = useStore();
  const router = useRouter();

  return (
    <div className={CARD}>
      <Brand />
      <div className="space-y-3 text-center">
        <span className={cn(BADGE, "bg-gold/12 text-gold")}>
          <PartyPopper className="size-6" />
        </span>
        <h1 className="text-navy dark:text-ivory text-lg font-black">
          رمز عبور تغییر کرد
        </h1>
        <p className="text-navy/70 dark:text-linen/70 text-sm leading-7">
          می‌توانید با رمزِ جدید وارد حساب‌تان شوید.
        </p>
        <Button
          variant="navy"
          size="pill"
          className="w-full"
          onClick={() => {
            setAuthOpen(true);
            router.push("/");
          }}
        >
          ورود به حساب
        </Button>
      </div>
    </div>
  );
}

/** 🔑 Standalone page (opened from the reset-password email link, not the
 *  auth modal): new password → confirm → done. */
export function ResetPasswordView({
  token,
  invalid,
}: {
  token?: string;
  invalid: boolean;
}) {
  const [done, setDone] = useState(false);
  const [show, setShow] = useState(false);
  const form = useAppForm({
    schema: resetPasswordSchema,
    defaultValues: { password: "", confirmPassword: "", token: token ?? "" },
  });

  if (invalid || !token)
    return (
      <div className={PAGE}>
        <InvalidCard />
      </div>
    );

  if (done)
    return (
      <div className={PAGE}>
        <SuccessCard />
      </div>
    );

  async function onValid(values: ResetPasswordValues) {
    const result = await resetPasswordAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setDone(true);
  }

  return (
    <div className={PAGE}>
      <div className={CARD}>
        <Brand />
        <div className="mb-5 text-center">
          <span className={cn(BADGE, "bg-gold/12 text-gold mb-3")}>
            <KeyRound className="size-6" />
          </span>
          <h1 className="text-navy dark:text-ivory text-lg font-black">
            تعیینِ رمز جدید
          </h1>
          <p className="text-navy/70 dark:text-linen/70 mt-1 text-sm">
            رمزِ تازه‌ای برای حساب‌تان انتخاب کنید.
          </p>
        </div>

        <AppForm
          form={form}
          onSubmit={onValid}
          ariaLabel="بازنشانیِ رمز عبور"
          className="space-y-3.5"
          notify
        >
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
          <StrengthMeter value={form.watch("password")} />

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

          <Button type="submit" className={SUBMIT_NAVY}>
            تعیینِ رمز جدید <ArrowLeft className="size-4" />
          </Button>
        </AppForm>
      </div>
    </div>
  );
}
