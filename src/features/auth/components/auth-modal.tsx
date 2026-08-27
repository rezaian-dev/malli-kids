"use client";

import { useEffect, useState, type ReactNode } from "react";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, Phone, User, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { toEnDigits } from "@/lib/format";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { cn } from "@/lib/utils";
import { AuthAside } from "./auth-aside";
import { TrustNote } from "./trust-note";

const OTP_LEN = 5;

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

function normalizePhone(raw: string) {
  return toEnDigits(raw).replace(/\s/g, "");
}

/** فیلد فرم با آیکون — Input و Label از shadcn. */
function Field({
  label,
  icon,
  extra,
  children,
  bad = false,
  shake = 0,
}: {
  label: string;
  icon: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  bad?: boolean;
  shake?: number;
}) {
  return (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-xs font-bold text-navy/80 dark:text-linen">{label}</Label>
      <div
        key={`${label}-${shake}`}
        className={cn(
          "flex h-12 items-center rounded-xl border bg-white transition-colors",
          "focus-within:border-gold focus-within:ring-2 focus-within:ring-gold/25",
          "dark:bg-navy-deep/60",
          bad ? "animate-shake border-rose dark:border-rose" : "border-tan dark:border-white/12",
        )}
      >
        <span className="flex w-10 shrink-0 items-center justify-center text-gold dark:text-gold-light">{icon}</span>
        {children}
        {extra}
      </div>
    </div>
  );
}

const FIELD_INPUT =
  "h-full flex-1 border-0 bg-transparent px-0 pe-3 shadow-none focus-visible:ring-0 dark:bg-transparent";

/**
 * دیالوگ ورود / ثبت‌نام.
 *
 * ساختار مودال، فوکوس‌تراپ، Escape و قفل اسکرول همه با Dialog shadcn است؛
 * تب‌ها با Tabs و کد یکبارمصرف با InputOTP. state باقی‌مانده فقط منطق فرم است.
 */
export function Modal() {
  const { authOpen, setAuthOpen, login, showToast } = useStore();

  const [tab, setTab] = useState<Tab>("login");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [bad, setBad] = useState<string[]>([]);
  const [shake, setShake] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [sent, setSent] = useState(false);
  const [sec, setSec] = useState(0);
  const [regName, setRegName] = useState("");

  useEffect(() => {
    if (sec <= 0) return;
    const t = window.setTimeout(() => setSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sec]);

  function reset() {
    setErr("");
    setBad([]);
    setSent(false);
    setOtp("");
  }

  function fail(fields: string[], message: string) {
    setBad(fields);
    setShake((n) => n + 1);
    setErr(message);
  }

  function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const pass = String(fd.get("password") || "");
    const f: string[] = [];
    if (!email || (!email.includes("@") && !/^09\d{9}$/.test(normalizePhone(email)))) f.push("email");
    if (pass.length < 6) f.push("password");
    if (f.length) return fail(f, "ایمیل/موبایل و رمز (حداقل ۶ حرف) را درست وارد کنید");

    setBad([]);
    login({ firstName: email.split("@")[0] || "کاربر", email, phone: email.startsWith("09") ? email : undefined });
    showToast("خوش آمدید");
  }

  function startRegister(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const firstName = String(fd.get("firstName") || "").trim();
    const mobile = normalizePhone(String(fd.get("phone") || ""));
    const f: string[] = [];
    if (firstName.length < 3) f.push("firstName");
    if (!/^09\d{9}$/.test(mobile)) f.push("phone");
    if (f.length) return fail(f, "نام و شمارهٔ موبایل را درست وارد کنید");

    setBad([]);
    setErr("");
    setRegName(firstName);
    setPhone(mobile);
    // TODO: کد را از پنل پیامکی/سرور ارسال کنید.
    setSent(true);
    setSec(90);
    setOtp("");
    showToast("کد ۵ رقمی به موبایل شما پیامک شد");
  }

  function sendOtp() {
    const p = normalizePhone(phone);
    if (!/^09\d{9}$/.test(p)) return fail(["otpPhone"], "شماره را به‌صورت 0912 345 6789 وارد کنید");

    setBad([]);
    setErr("");
    setSent(true);
    setSec(90);
    setOtp("");
    showToast("کد ۵ رقمی به شمارهٔ شما پیامک شد");
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (otp.length !== OTP_LEN) return fail(["otp"], "۵ رقم کد را کامل وارد کنید");

    // TODO: کد را برای اعتبارسنجی به پنل پیامکی/سرور بفرستید.
    setBad([]);
    const p = normalizePhone(phone);
    login({ firstName: tab === "register" ? regName || "کاربر" : "کاربر", email: `${p}@sms.mallikids.ir`, phone: p });
    showToast(tab === "register" ? "حساب شما ساخته شد ✨" : "با پیامک وارد شدید");
    setRegName("");
  }

  /** بلوک کد یکبارمصرف — مشترک بین تب پیامک و ثبت‌نام. */
  const otpBlock = (submitLabel: string) => (
    <>
      <div>
        <p className="mb-2 text-xs font-bold text-navy dark:text-ivory">کد ۵ رقمی پیامک‌شده</p>
        <div key={shake} className={cn("flex justify-center", bad.includes("otp") && "animate-shake")}>
          <InputOTP maxLength={OTP_LEN} value={otp} onChange={setOtp} containerClassName="gap-1.5" autoFocus>
            <InputOTPGroup className="gap-1.5">
              {Array.from({ length: OTP_LEN }, (_, i) => (
                <InputOTPSlot
                  key={i}
                  index={i}
                  className={cn(
                    "size-12 rounded-xl border bg-white text-lg font-black text-navy transition-colors first:rounded-s-xl last:rounded-e-xl",
                    "data-[active=true]:border-gold data-[active=true]:ring-2 data-[active=true]:ring-gold/25",
                    "dark:bg-navy-deep/60 dark:text-ivory",
                    bad.includes("otp") ? "border-rose" : "border-tan dark:border-white/12",
                  )}
                />
              ))}
            </InputOTPGroup>
          </InputOTP>
        </div>
      </div>

      <div className="flex items-center justify-between text-[11px] font-bold">
        {sec > 0 ? (
          <span className="text-navy/50 dark:text-linen/60">ارسال مجدد تا {sec} ثانیه</span>
        ) : (
          <Button type="button" variant="link" className="h-auto p-0 text-[11px] font-bold text-gold" onClick={sendOtp}>
            ارسال دوباره کد
          </Button>
        )}
        <Button
          type="button"
          variant="link"
          className="h-auto p-0 text-[11px] font-bold text-navy/50 dark:text-linen/60"
          onClick={() => {
            setSent(false);
            setOtp("");
          }}
        >
          تغییر شماره
        </Button>
      </div>

      <Button type="submit" className={SUBMIT_NAVY}>
        {submitLabel}
      </Button>
    </>
  );

  return (
    <Dialog
      open={authOpen}
      onOpenChange={(v) => {
        setAuthOpen(v);
        if (!v) reset();
      }}
    >
      <DialogContent
        dir="rtl"
        showCloseButton={false}
        className={cn(
          // DialogContent پایه grid و rounded-xl و p-4 دارد؛ همه را صریح بازنویسی می‌کنیم
          "z-[100] block max-h-[94dvh] w-[calc(100%-1.5rem)] max-w-[26rem] gap-0 overflow-y-auto overflow-x-hidden p-0 sm:max-w-[26rem]",
          "rounded-[28px] bg-paper text-navy ring-0",
          "border border-gold/35 shadow-[0_28px_80px_-20px_rgba(4,20,39,.55)]",
          "dark:border-gold/40 dark:bg-dusk dark:text-ivory",
          "lg:flex lg:max-w-[54rem] lg:flex-row-reverse",
        )}
      >
        {/* دکمهٔ بستن — همیشه در گوشهٔ شروع (چپ در RTL) */}
        <DialogClose
          className={cn(
            "absolute top-4 start-4 z-20 inline-flex size-9 items-center justify-center rounded-full",
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

          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as Tab);
              reset();
              setRegName("");
            }}
            dir="rtl"
            className="min-h-0 flex-1 gap-0"
          >
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

            {err ? <p className="mt-3 shrink-0 text-xs font-bold text-rose">{err}</p> : null}

            <div className="-mx-2 min-h-0 flex-1 overflow-y-auto overflow-x-clip px-2 [scrollbar-width:thin]">
              {/* ─── ورود با رمز ─── */}
              <TabsContent value="login">
                <form onSubmit={onLogin} className="mt-5 space-y-3.5" noValidate>
                  <Field label="ایمیل یا موبایل" icon={<Mail className="size-4" />} bad={bad.includes("email")} shake={shake}>
                    <Input name="email" dir="ltr" autoComplete="username" placeholder="0912 345 6789" className={FIELD_INPUT} />
                  </Field>

                  <Field
                    label="رمز عبور"
                    icon={<Lock className="size-4" />}
                    bad={bad.includes("password")}
                    shake={shake}
                    extra={
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="me-1 size-8 shrink-0 text-gold hover:bg-gold/10 hover:text-gold"
                        onClick={() => setShow((s) => !s)}
                        aria-label="نمایش رمز"
                      >
                        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      </Button>
                    }
                  >
                    <Input
                      name="password"
                      type={show ? "text" : "password"}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      className={FIELD_INPUT}
                    />
                  </Field>

                  <Button type="submit" className={SUBMIT_NAVY}>
                    ورود به حساب <ArrowLeft className="size-4" />
                  </Button>

                  <Button
                    type="button"
                    variant="link"
                    className="w-full text-xs font-bold text-gold"
                    onClick={() => {
                      setTab("otp");
                      reset();
                    }}
                  >
                    ورود بدون رمز، با پیامک
                  </Button>

                  <TrustNote />
                </form>
              </TabsContent>

              {/* ─── ورود با پیامک ─── */}
              <TabsContent value="otp">
                <form
                  onSubmit={
                    sent
                      ? verifyOtp
                      : (e) => {
                          e.preventDefault();
                          sendOtp();
                        }
                  }
                  className="mt-5 space-y-4"
                  noValidate
                >
                  {!sent ? (
                    <Field label="شماره موبایل" icon={<Phone className="size-4" />} bad={bad.includes("otpPhone")} shake={shake}>
                      <Input
                        dir="ltr"
                        inputMode="tel"
                        placeholder="0912 345 6789"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className={FIELD_INPUT}
                      />
                    </Field>
                  ) : (
                    <div className="rounded-2xl border border-gold/30 bg-sand/80 px-3.5 py-3 dark:border-gold/25 dark:bg-navy-deep/60">
                      <p className="text-[11px] font-black text-gold">شماره قفل‌شده</p>
                      <p className="mt-1 font-black tracking-wide text-navy dark:text-ivory" dir="ltr">
                        {phone}
                      </p>
                      <p className="mt-1 text-[11px] text-navy/45 dark:text-linen/55">
                        برای عوض کردن شماره، اول «تغییر شماره» را بزنید.
                      </p>
                    </div>
                  )}

                  {sent ? (
                    otpBlock("تأیید و ورود")
                  ) : (
                    <>
                      <Button type="submit" className={SUBMIT_GOLD}>
                        دریافت کد پیامک <ArrowLeft className="size-4" />
                      </Button>
                      <p className="text-center text-[11px] font-bold text-navy/50 dark:text-linen/60">
                        یک کد ۵ رقمی برای شما پیامک می‌شود. بدون نیاز به رمز عبور.
                      </p>
                      <TrustNote />
                    </>
                  )}
                </form>
              </TabsContent>

              {/* ─── ثبت‌نام ─── */}
              <TabsContent value="register">
                <form onSubmit={sent ? verifyOtp : startRegister} className="mt-4 space-y-3" autoComplete="off" noValidate>
                  {!sent ? (
                    <>
                      <Field label="نام و نام خانوادگی" icon={<User className="size-4" />} bad={bad.includes("firstName")} shake={shake}>
                        <Input name="firstName" defaultValue={regName} placeholder="سارا محمدی" className={FIELD_INPUT} />
                      </Field>

                      <Field label="شماره موبایل" icon={<Phone className="size-4" />} bad={bad.includes("phone")} shake={shake}>
                        <Input name="phone" type="tel" dir="ltr" defaultValue={phone} placeholder="0912 345 6789" className={FIELD_INPUT} />
                      </Field>

                      <Button type="submit" className={SUBMIT_GOLD}>
                        دریافت کد تأیید <ArrowLeft className="size-4" />
                      </Button>

                      <p className="text-center text-[11px] font-bold text-navy/50 dark:text-linen/60">
                        یک کد ۵ رقمی برای تأیید به موبایل شما پیامک می‌شود.
                      </p>

                      <TrustNote />
                    </>
                  ) : (
                    <>
                      <div className="rounded-2xl border border-gold/30 bg-sand/80 px-3.5 py-3 dark:border-gold/25 dark:bg-navy-deep/60">
                        <p className="text-[11px] font-black text-gold">ساخت حساب برای</p>
                        <p className="mt-1 font-black text-navy dark:text-ivory">
                          {regName}{" "}
                          <span className="font-bold text-navy/45 dark:text-linen/55" dir="ltr">
                            — {phone}
                          </span>
                        </p>
                      </div>
                      {otpBlock("تأیید و ساخت حساب")}
                    </>
                  )}
                </form>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
