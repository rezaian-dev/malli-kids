"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type ClipboardEvent,
} from "react";
import {
  ArrowLeft,
  ArrowRight,
  KeyRound,
  RotateCcw,
  Smartphone,
  Sparkles,
} from "lucide-react";
import { toast } from "@/lib/toast";
import { toFaDigits } from "@/lib/locale/fa";
import { useCooldown } from "@/hooks/use-cooldown";
import {
  AppForm,
  Field,
  InsetField,
  SubmitButton,
  useAppForm,
} from "@/components/form";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { requestOtpAction, verifyOtpAction } from "@/lib/auth/actions";
import {
  OTP_LEN,
  otpRequestDefaults,
  otpRequestSchema,
  otpVerifyDefaults,
  otpVerifySchema,
  type OtpRequestValues,
  type OtpVerifyValues,
} from "@/lib/auth/schemas";
import { onlyDigits, SUBMIT_NAVY } from "./auth-shared";

/** 🔢 Five separate digit boxes standing in for one `code` field — its own
 *  local array so a mid-typed value (box 3 filled, box 2 still empty) never
 *  has to be reconstructed from a single concatenated string. `onChange`
 *  still receives the joined digits, which is all the surrounding
 *  react-hook-form field and its zod schema ever see. */
function OtpBoxes({
  value,
  onChange,
  invalid,
  onComplete,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid: boolean;
  onComplete?: () => void;
}) {
  const [digits, setDigits] = useState<string[]>(() =>
    Array.from({ length: OTP_LEN }, (_, i) => value[i] ?? ""),
  );
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  function commit(next: string[]) {
    setDigits(next);
    onChange(next.join(""));
    if (next.every(Boolean)) onComplete?.();
  }

  function setAt(i: number, raw: string) {
    const d = onlyDigits(raw).slice(-1);
    const next = [...digits];
    next[i] = d;
    commit(next);
    if (d && i < OTP_LEN - 1) refs.current[i + 1]?.focus();
  }

  function onKeyDown(i: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      refs.current[i - 1]?.focus();
      const next = [...digits];
      next[i - 1] = "";
      commit(next);
    } else if (e.key === "ArrowLeft" && i < OTP_LEN - 1) {
      refs.current[i + 1]?.focus();
    } else if (e.key === "ArrowRight" && i > 0) {
      refs.current[i - 1]?.focus();
    }
  }

  function onPaste(e: ClipboardEvent<HTMLInputElement>) {
    const text = onlyDigits(e.clipboardData.getData("text")).slice(0, OTP_LEN);
    if (!text) return;
    e.preventDefault();
    commit(Array.from({ length: OTP_LEN }, (_, i) => text[i] ?? ""));
    refs.current[Math.min(text.length, OTP_LEN - 1)]?.focus();
  }

  return (
    <div
      dir="ltr"
      role="group"
      aria-label="کدِ تأیید"
      className="flex justify-center gap-2"
    >
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          onChange={(e) => setAt(i, e.target.value)}
          onKeyDown={(e) => onKeyDown(i, e)}
          onPaste={onPaste}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`رقمِ ${toFaDigits(i + 1)}`}
          className={cn(
            "h-13 w-11 rounded-2xl border-2 text-center text-lg font-black transition-all duration-200 outline-none motion-safe:focus:-translate-y-0.5",
            "text-navy bg-white focus:shadow-lg",
            invalid
              ? "border-rose focus:border-rose"
              : "border-navy/15 focus:border-gold focus:shadow-gold/20",
            "dark:bg-dusk-alt dark:text-ivory dark:border-gold/25 dark:focus:border-gold",
            d && !invalid && "border-gold/70 bg-gold/5",
          )}
        />
      ))}
    </div>
  );
}

/** 📱 "ورود با کدِ پیامکی" — phone number → 5-digit code, same rhythm as
 *  `ForgotPasswordPanel`'s resend cooldown. No SMS panel is purchased yet
 *  (`requestOtpAction`/`verifyOtpAction` are honest stubs — see their
 *  comments), so this always runs as a clearly-labeled preview and never
 *  pretends to actually sign anyone in. Swapping in a real provider later
 *  only touches those two server actions. */
export function OtpLoginPanel() {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [demo, setDemo] = useState(false);
  const [shakeSignal, setShakeSignal] = useState(0);
  const cd = useCooldown();

  const phoneForm = useAppForm({
    schema: otpRequestSchema,
    defaultValues: otpRequestDefaults,
  });
  const codeForm = useAppForm({
    schema: otpVerifySchema,
    defaultValues: otpVerifyDefaults,
  });

  async function sendCode(values: OtpRequestValues) {
    const result = await requestOtpAction(values);
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    setPhone(values.phone);
    setDemo(result.data.demo);
    cd.restart();
    setStep("code");
    toast[result.data.demo ? "info" : "success"](
      result.data.demo
        ? "کدِ نمایشی آماده شد — پیامکِ واقعی هنوز وصل نیست"
        : `کد به ${values.phone} پیامک شد`,
    );
  }

  async function resend() {
    const result = await requestOtpAction({ phone });
    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    cd.restart();
    toast.info("کد دوباره ارسال شد");
  }

  async function verify(values: OtpVerifyValues) {
    const result = await verifyOtpAction(values);
    if (!result.ok) {
      toast.warning(result.error);
      setShakeSignal((n) => n + 1);
    }
    // ✅ Once a real SMS provider is wired up, `verifyOtpAction` starts
    // returning `{ ok: true, data: user }` and this becomes the login call
    // — nothing above this line needs to change.
  }

  if (step === "phone") {
    return (
      <AppForm
        form={phoneForm}
        onSubmit={sendCode}
        ariaLabel="ورود با کدِ پیامکی"
        className="space-y-3.5"
        notify
      >
        <p className="text-navy/70 dark:text-linen/70 -mt-1 text-[13px] leading-6">
          شمارهٔ موبایل‌تان را وارد کنید تا کدِ یکبارمصرف برایتان پیامک شود.
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

        <SubmitButton className={SUBMIT_NAVY} pendingLabel="در حال ارسال…">
          ارسالِ کدِ پیامکی <ArrowLeft className="size-4" />
        </SubmitButton>
      </AppForm>
    );
  }

  return (
    // 🩹 `animate-fade-up` enters with a `translateY` — transforms count
    // toward the *ancestor's* scrollable overflow while they're in flight,
    // and this panel lives inside the auth modal's `overflow-y-auto` body.
    // Left alone, that 18px of travel briefly makes the modal "taller",
    // popping a vertical scrollbar in for the animation's ~0.55s then
    // yanking it back out. This wrapper isn't itself transformed, so it
    // keeps its rest-state (post-animation) size and clips the transformed
    // child locally — the overflow never reaches the modal's scroll body.
    <div className="overflow-hidden">
      <AppForm
        form={codeForm}
        onSubmit={verify}
        ariaLabel="تأییدِ کدِ پیامکی"
        className="animate-fade-up space-y-4"
        shakeSignal={shakeSignal}
      >
        {demo ? (
          <p
            className={cn(
              "inline-flex w-fit items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold",
              "bg-gold/12 text-gold-deep",
              "dark:text-gold-light",
            )}
          >
            <Sparkles className="size-3.5" /> نسخهٔ نمایشی — پیامکِ واقعی
            به‌زودی وصل می‌شود
          </p>
        ) : null}

        <p className="text-navy/70 dark:text-linen/70 text-[13px] leading-6">
          کدِ {toFaDigits(OTP_LEN)} رقمیِ ارسال‌شده به{" "}
          <span dir="ltr" className="text-gold font-black">
            {phone}
          </span>{" "}
          را وارد کنید.
        </p>

        <Field name="code" label="کدِ تأیید" required noShell>
          {({ field, invalid }) => (
            <OtpBoxes
              value={String(field.value ?? "")}
              onChange={field.onChange}
              invalid={invalid}
              onComplete={() => codeForm.handleSubmit(verify)()}
            />
          )}
        </Field>

        <SubmitButton className={SUBMIT_NAVY} pendingLabel="در حال بررسیِ کد…">
          تأیید و ورود <KeyRound className="size-4" />
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
