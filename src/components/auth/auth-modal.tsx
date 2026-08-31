"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User, X } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { RE, phoneDigits, toLatinDigits } from "@/lib/forms";
import { AppForm, Field, InsetField, useAppForm } from "@/components/form";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { AuthAside } from "./auth-aside";
import { TrustNote } from "./trust-note";
import { OTP_LEN, loginDefaults, loginSchema, registerDefaults, registerSchema, smsAccount, smsCodeDefaults, smsCodeSchema, smsStartDefaults, smsStartSchema, type LoginValues, type RegisterValues, type SmsCodeValues, type SmsStartValues } from "./schema";

const TAB_TRIGGER = cn(
  "min-w-0 rounded-xl py-2.5 text-[13px] font-extrabold transition-colors",
  "text-navy/60 hover:text-navy dark:text-linen/70 dark:hover:text-ivory",
  "data-[state=active]:bg-navy data-[state=active]:text-ivory data-[state=active]:shadow-sm",
  "dark:data-[state=active]:bg-gold dark:data-[state=active]:text-navy-deep dark:data-[state=active]:shadow-[0_2px_10px_-2px] dark:data-[state=active]:shadow-gold/50",
);

const SUBMIT_NAVY =
  "h-12 w-full gap-2 rounded-full bg-navy font-black text-ivory shadow-[0_10px_24px_-12px] shadow-navy/60 transition-transform hover:bg-navy-mid active:scale-[0.99] dark:bg-gold dark:text-navy-deep dark:shadow-gold/40 dark:hover:bg-gold-light";
const SUBMIT_GOLD =
  "h-12 w-full gap-2 rounded-full bg-gold font-black text-navy-deep shadow-[0_10px_24px_-12px] shadow-gold/60 transition-transform hover:bg-gold-light active:scale-[0.99]";

const TITLES = { login: "ورود به حساب", otp: "ورود با پیامک", register: "ساخت حساب" } as const;
type Tab = keyof typeof TITLES;

const digits = (v: string) => phoneDigits(v);

const onlyDigits = (v: string) => toLatinDigits(v).replace(/\D/g, "");

function useCooldown() {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    if (sec <= 0) return;
    const t = window.setTimeout(() => setSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sec]);
  return { sec, restart: (n = 90) => setSec(n), stop: () => setSec(0) };
}

function useSmsFlow() {
  const code = useAppForm({ schema: smsCodeSchema, defaultValues: smsCodeDefaults });
  const cd = useCooldown();
  const [phone, setPhone] = useState("");
  const [name, setName] = useState("");

  return {
    code,
    cd,
    phone,
    name,
    sent: phone !== "",
    send(p: string, n = "") {
      setPhone(p);
      setName(n);
      cd.restart();
      code.reset({ ...smsCodeDefaults });
      code.setFocus("code");
    },
    back() {
      setPhone("");
      setName("");
      cd.stop();
      code.reset({ ...smsCodeDefaults });
    },
  };
}

type SmsFlow = ReturnType<typeof useSmsFlow>;

function CodeStep({ flow, submitLabel, onVerify }: { flow: SmsFlow; submitLabel: string; onVerify: (v: SmsCodeValues) => void }) {
  return (
    <AppForm form={flow.code} onSubmit={onVerify} ariaLabel="تأیید کد پیامکی" className="space-y-4" notify>
      <Field name="code" label={`کد ${OTP_LEN} رقمی پیامک‌شده`} skin="inset" noShell>
        {({ field, invalid }) => (
          <div className={cn("flex justify-center", invalid && "animate-shake")}>
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
                      "size-12 rounded-xl border bg-white text-lg font-black text-navy transition-[border-color,box-shadow] duration-200 first:rounded-s-xl last:rounded-e-xl",
                      "dark:bg-navy-deep/60 dark:text-ivory",
                      invalid
                        ? "border-rose data-[active=true]:border-rose data-[active=true]:ring-2 data-[active=true]:ring-rose/20 dark:border-rose"
                        : "border-tan dark:border-white/12 data-[active=true]:border-gold data-[active=true]:ring-2 data-[active=true]:ring-gold/25",
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
          <span className="text-navy/50 dark:text-linen/60">
            ارسالِ مجدد تا {flow.cd.sec} ثانیه
          </span>
        ) : (
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 text-[11px] font-bold text-gold"
            onClick={() => flow.cd.restart()}
          >
            ارسالِ دوبارهٔ کد
          </Button>
        )}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[11px] font-bold text-navy/50 dark:text-linen/60"
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

function LockedCard({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-gold/30 bg-sand/80 px-3.5 py-3 dark:border-gold/25 dark:bg-navy-deep/60">
      <p className="text-[11px] font-black text-gold">{title}</p>
      <div className="mt-1 text-sm font-black text-navy dark:text-ivory">{children}</div>
    </div>
  );
}

function LoginPanel({ onOtp }: { onOtp: () => void }) {
  const { login, showToast } = useStore();
  const [show, setShow] = useState(false);
  const form = useAppForm({ schema: loginSchema, defaultValues: loginDefaults });

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
    <AppForm form={form} onSubmit={onValid} ariaLabel="ورود با رمز عبور" className="space-y-3.5" notify>
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
            className="me-1 size-8 shrink-0 text-gold hover:bg-gold/10 hover:text-gold"
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

      <Button type="button" variant="link" className="w-full text-xs font-bold text-gold" onClick={onOtp}>
        ورود بدونِ رمز، با پیامک
      </Button>

      <TrustNote />
    </AppForm>
  );
}

function OtpPanel() {
  const { login, showToast } = useStore();
  const flow = useSmsFlow();
  const start = useAppForm({ schema: smsStartSchema, defaultValues: smsStartDefaults });

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
            <p className="mt-1 text-[11px] font-bold text-navy/45 dark:text-linen/55">
              برای عوض کردنِ شماره، اول «تغییرِ شماره» را بزنید.
            </p>
          </LockedCard>
          <CodeStep flow={flow} submitLabel="تأیید و ورود" onVerify={verify} />
        </>
      ) : (
        <>
          <AppForm form={start} onSubmit={send} ariaLabel="درخواستِ کد پیامکی" className="space-y-4" notify>
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
          <p className="text-center text-[11px] font-bold text-navy/50 dark:text-linen/60">
            یک کد ۵ رقمی برای شما پیامک می‌شود. بدونِ نیاز به رمز عبور.
          </p>
          <TrustNote />
        </>
      )}
    </div>
  );
}

function RegisterPanel() {
  const { login, showToast } = useStore();
  const flow = useSmsFlow();
  const start = useAppForm({ schema: registerSchema, defaultValues: registerDefaults });

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
              <span className="font-bold text-navy/45 dark:text-linen/55" dir="ltr">
                — {flow.phone}
              </span>
            </p>
          </LockedCard>
          <CodeStep flow={flow} submitLabel="تأیید و ساختِ حساب" onVerify={verify} />
        </>
      ) : (
        <>
          <AppForm form={start} onSubmit={send} ariaLabel="ثبت‌نام" className="space-y-3.5" notify>
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
          <p className="text-center text-[11px] font-bold text-navy/50 dark:text-linen/60">
            یک کد ۵ رقمی برای تأیید به موبایل شما پیامک می‌شود.
          </p>
          <TrustNote />
        </>
      )}
    </div>
  );
}

// 🔐 Auth dialog with clear tab-based flows.
export function AuthModal() {
  const { authOpen, setAuthOpen } = useStore();
  const [tab, setTab] = useState<Tab>("login");

  return (
    <Dialog open={authOpen} onOpenChange={setAuthOpen}>
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className={cn(
          
          "z-[100] block max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-[26rem] gap-0 overflow-y-auto overflow-x-hidden overscroll-contain p-0 sm:max-w-[26rem]",
          "rounded-[28px] bg-paper text-navy ring-0",
          "border border-gold/35 shadow-[0_28px_80px_-20px_rgba(4,20,39,.55)]",
          "dark:border-gold/40 dark:bg-dusk dark:text-ivory",
          "lg:flex lg:max-w-[54rem] lg:flex-row-reverse",
        )}
      >
        {}
        <DialogClose
          className={cn(
            "absolute top-4 inset-s-4 z-20 inline-flex size-9 items-center justify-center rounded-full",
            "text-navy/60 transition-colors hover:bg-sand hover:text-navy",
            "focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none",
            "dark:text-ivory/70 dark:hover:bg-dusk-mid dark:hover:text-ivory",
          )}
        >
          <X className="size-5" />
          <span className="sr-only">بستن</span>
        </DialogClose>

        <AuthAside />

        <div className="flex max-h-[94dvh] min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-paper p-5 pt-14 sm:p-7 sm:pt-14 dark:bg-dusk">
          <div className="mb-4 shrink-0">
            <p className="text-[11px] font-black tracking-[0.2em] text-gold">MALLI KIDS</p>
            <DialogTitle className="mt-1 text-lg font-black">{TITLES[tab]}</DialogTitle>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)} dir="rtl" className="min-h-0 flex-1 gap-0">
            <TabsList className="grid h-auto w-full min-w-0 shrink-0 grid-cols-3 gap-1 rounded-2xl bg-sand p-1 ring-1 ring-navy/5 dark:bg-navy-deep/70 dark:ring-white/10">
              <TabsTrigger value="login" className={TAB_TRIGGER}>
                ورود
              </TabsTrigger>
              <TabsTrigger value="otp" className={TAB_TRIGGER}>
                پیامک
              </TabsTrigger>
              <TabsTrigger value="register" className={TAB_TRIGGER}>
                ثبت‌نام
              </TabsTrigger>
            </TabsList>

            <div className="auth-fields -mx-2 min-h-0 flex-1 overflow-y-auto overflow-x-clip overscroll-contain px-2 [scrollbar-width:thin]">
              <TabsContent value="login" className="mt-5">
                <LoginPanel onOtp={() => setTab("otp")} />
              </TabsContent>
              <TabsContent value="otp" className="mt-5">
                <OtpPanel />
              </TabsContent>
              <TabsContent value="register" className="mt-4">
                <RegisterPanel />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
