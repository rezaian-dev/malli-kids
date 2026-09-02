import { AppForm, Field } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { OTP_LEN, type SmsCodeValues } from "./schema";
import { SUBMIT_NAVY } from "./auth-shared";
import type { SmsFlow } from "./use-sms-flow";

/** 🔢 The shared "type the OTP" step for both the sign-in-by-SMS and
 *  register flows. */
export function CodeStep({
  flow,
  submitLabel,
  onVerify,
}: {
  flow: SmsFlow;
  submitLabel: string;
  onVerify: (v: SmsCodeValues) => void;
}) {
  return (
    <AppForm
      form={flow.code}
      onSubmit={onVerify}
      ariaLabel="تأیید کد پیامکی"
      className="space-y-4"
      notify
    >
      <Field
        name="code"
        label={`کد ${OTP_LEN} رقمی پیامک‌شده`}
        skin="inset"
        noShell
      >
        {({ field, invalid }) => (
          <div
            className={cn("flex justify-center", invalid && "animate-shake")}
          >
            <InputOTP
              maxLength={OTP_LEN}
              value={String(field.value ?? "")}
              onChange={(v) => field.onChange(v)}
              containerClassName="gap-1.5"
              autoFocus
            >
              {}
              <InputOTPGroup className="gap-1.5" dir="ltr">
                {Array.from({ length: OTP_LEN }, (_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className={cn(
                      "text-navy size-12 rounded-xl border bg-white text-lg font-black transition-[border-color,box-shadow] duration-200 first:rounded-s-xl last:rounded-e-xl",
                      "dark:bg-navy-deep/60 dark:text-ivory",
                      invalid
                        ? "border-rose data-[active=true]:border-rose data-[active=true]:shadow-[0_18px_50px_-14px_rgba(225,29,72,0.28),0_0_0_4px_rgba(225,29,72,0.14)]"
                        : "border-tan data-[active=true]:border-gold data-[active=true]:shadow-[0_18px_50px_-14px_rgba(193,147,87,0.48),0_0_0_4px_rgba(193,147,87,0.16)] dark:border-white/12 dark:data-[active=true]:shadow-[0_18px_50px_-14px_rgba(232,197,122,0.32),0_0_0_4px_rgba(232,197,122,0.16)]",
                    )}
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          </div>
        )}
      </Field>

      <div className="flex items-center justify-between text-[11px] font-bold">
        {flow.cd.sec > 0 ? (
          <span className="text-navy/70 dark:text-linen/60">
            ارسالِ مجدد تا {flow.cd.sec} ثانیه
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            className="text-gold h-auto p-0 text-[11px] font-bold"
            onClick={() => flow.cd.restart()}
          >
            ارسالِ دوبارهٔ کد
          </Button>
        )}
        <Button
          type="button"
          variant="link"
          className="text-navy/70 dark:text-linen/60 h-auto p-0 text-[11px] font-bold"
          onClick={flow.back}
        >
          تغییرِ شماره
        </Button>
      </div>

      <Button type="submit" className={SUBMIT_NAVY}>
        {submitLabel}
      </Button>
    </AppForm>
  );
}
