"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  Eye,
  EyeOff,
  Lock,
  Mail,
  Percent,
  Phone,
  ScanFace,
  Sparkles,
  Star,
  User,
  X,
} from "lucide-react";
import { useStore } from "@/lib/store";
import { toEnDigits } from "@/lib/format";

const OTP_LEN = 5;

export function Modal() {
  const { authOpen, setAuthOpen, login, showToast } = useStore();
  const [tab, setTab] = useState<"login" | "register" | "otp">("login");
  const [show, setShow] = useState(false);
  const [err, setErr] = useState("");
  const [bad, setBad] = useState<string[]>([]);
  const [shake, setShake] = useState(0);
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(OTP_LEN).fill(""));
  const [sent, setSent] = useState(false);
  const [sec, setSec] = useState(0);
  const [regName, setRegName] = useState("");
  const boxes = useRef<(HTMLInputElement | null)[]>([]);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!authOpen) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setAuthOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    const raf = requestAnimationFrame(() => dialogRef.current?.querySelector<HTMLElement>("input")?.focus());
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      cancelAnimationFrame(raf);
      prevFocus?.focus?.();
    };
  }, [authOpen, setAuthOpen]);

  useEffect(() => {
    if (sec <= 0) return;
    const t = window.setTimeout(() => setSec((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [sec]);

  if (!authOpen) return null;

  function close() {
    setAuthOpen(false);
    setErr("");
    setBad([]);
    setSent(false);
    setOtp(Array(OTP_LEN).fill(""));
  }

  function normalizePhone(raw: string) {
    return toEnDigits(raw).replace(/\s/g, "");
  }

  function onLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "").trim();
    const pass = String(fd.get("password") || "");
    const f: string[] = [];
    if (!email || (!email.includes("@") && !/^09\d{9}$/.test(normalizePhone(email)))) f.push("email");
    if (pass.length < 6) f.push("password");
    if (f.length) {
      setBad(f);
      setShake((n) => n + 1);
      setErr("ایمیل/موبایل و رمز (حداقل ۶ حرف) را درست وارد کنید");
      return;
    }
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
    if (f.length) {
      setBad(f);
      setShake((n) => n + 1);
      setErr("نام و شمارهٔ موبایل را درست وارد کنید");
      return;
    }
    setBad([]);
    setErr("");
    setRegName(firstName);
    setPhone(mobile);
    // TODO: کد را از پنل پیامکی/سرور ارسال کنید. (این نسخه هنوز بک‌اندِ پیامک ندارد.)
    setSent(true);
    setSec(90);
    setOtp(Array(OTP_LEN).fill(""));
    showToast("کد ۵ رقمی به موبایل شما پیامک شد");
    requestAnimationFrame(() => boxes.current[0]?.focus());
  }

  function sendOtp() {
    const p = normalizePhone(phone);
    if (!/^09\d{9}$/.test(p)) {
      setBad(["otpPhone"]);
      setShake((n) => n + 1);
      setErr("شماره را به‌صورت 0912 345 6789 وارد کنید");
      return;
    }
    setBad([]);
    setErr("");
    setSent(true);
    setSec(90);
    setOtp(Array(OTP_LEN).fill(""));
    showToast("کد ۵ رقمی به شمارهٔ شما پیامک شد");
    requestAnimationFrame(() => boxes.current[0]?.focus());
  }

  function putOtp(i: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < OTP_LEN - 1) boxes.current[i + 1]?.focus();
  }

  function onOtpKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) boxes.current[i - 1]?.focus();
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    const code = otp.join("");
    if (code.length !== OTP_LEN) {
      setBad(["otp"]);
      setShake((n) => n + 1);
      setErr("۵ رقم کد را کامل وارد کنید");
      return;
    }
    // TODO: کد را برای اعتبارسنجی به پنل پیامکی/سرور بفرستید. (این نسخه هنوز بک‌اندِ پیامک ندارد.)
    setBad([]);
    const p = normalizePhone(phone);
    if (tab === "register") {
      login({ firstName: regName || "کاربر", email: `${p}@sms.mallikids.ir`, phone: p });
      showToast("حساب شما ساخته شد ✨");
    } else {
      login({ firstName: "کاربر", email: `${p}@sms.mallikids.ir`, phone: p });
      showToast("با پیامک وارد شدید");
    }
    setRegName("");
  }

  const otpFields = (submitLabel: string) => (
    <>
      <div>
        <p className="mb-2 text-xs font-bold text-navy dark:text-ivory">کد ۵ رقمی پیامک‌شده</p>
        <div key={shake} className={`flex justify-between gap-1.5 ${bad.includes("otp") ? "animate-shake" : ""}`} dir="ltr">
          {otp.map((d, i) => (
            <input
              key={i}
              ref={(el) => {
                boxes.current[i] = el;
              }}
              inputMode="numeric"
              maxLength={1}
              value={d}
              onChange={(e) => putOtp(i, e.target.value)}
              onKeyDown={(e) => onOtpKey(i, e)}
              className={`h-12 w-11 rounded-xl border bg-white text-center text-lg font-black text-navy outline-none dark:bg-dusk-mid dark:text-ivory ${bad.includes("otp") ? "border-rose" : "border-gold/40"}`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold">
        {sec > 0 ? (
          <span className="text-navy/50 dark:text-wheat">ارسال مجدد تا {sec} ثانیه</span>
        ) : (
          <button type="button" className="text-gold" onClick={sendOtp}>
            ارسال دوباره کد
          </button>
        )}
        <button type="button" className="text-navy/50 dark:text-wheat" onClick={() => { setSent(false); setOtp(Array(OTP_LEN).fill("")); }}>
          تغییر شماره
        </button>
      </div>
      <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy font-black text-ivory dark:bg-gold dark:text-navy-deep">
        {submitLabel}
      </button>
    </>
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
      <button type="button" className="absolute inset-0 bg-navy-deep/55 backdrop-blur-sm" aria-label="بستن" onClick={close} />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="authTitle"
        className="animate-user-menu relative z-10 flex max-h-[94dvh] w-full max-w-md overflow-hidden rounded-[28px] border border-gold/35 bg-paper text-navy shadow-[0_28px_80px_-20px_rgba(4,20,39,.55)] dark:border-gold/40 dark:bg-dusk dark:text-ivory lg:max-w-[54rem] lg:flex-row"
      >
        <aside className="relative hidden w-[46%] shrink-0 overflow-hidden bg-navy text-ivory lg:flex">
          <img src="/brand/hero-dress.jpg" alt="" className="absolute inset-0 size-full object-cover object-[center_18%]" />
          <div className="absolute inset-0 bg-linear-to-t from-navy-deep via-navy-deep/55 to-transparent" />
          <div className="absolute inset-3 rounded-[22px] border border-gold/45 pointer-events-none" />
          <div className="relative flex h-full min-h-0 flex-col justify-between p-7">
            <div className="flex items-center gap-3">
              <img src="/brand/logo-white.png" alt="" className="h-11 w-auto drop-shadow-md" />
              <div className="leading-none">
                <span className="font-display block text-sm font-bold tracking-[0.2em] text-white">MALLI</span>
                <span className="font-display mt-1 block text-[10px] tracking-[0.38em] text-gold-light">KIDS</span>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-black tracking-[0.22em] text-gold-light">ATELIER</p>
              <h2 id="authTitle" className="mt-2 text-[1.65rem] font-black leading-snug">
                دنیای شیکِ
                <br />
                <span className="text-gold-light">کوچولوها</span>
              </h2>
              <p className="mt-3 max-w-56 text-sm leading-7 text-ivory/90">عضویت یعنی ۱۰٪ تخفیف، پرو مجازی و سایز دقیق.</p>
              <ul className="mt-5 space-y-2">
                <Perk icon={<Percent className="size-4" />} t="۱۰٪ تخفیف اولین خرید" d="همان لحظهٔ عضویت" />
                <Perk icon={<Sparkles className="size-4" />} t="پرو مجازی با AI" d="لباس را روی تن ببینید" />
                <Perk icon={<ScanFace className="size-4" />} t="ورود با پیامک" d="ورود سریع بدون رمز عبور" />
              </ul>
              <p className="mt-5 inline-flex items-center gap-2 rounded-full bg-navy-deep/80 px-3.5 py-2 text-xs font-bold text-ivory ring-1 ring-gold/40">
                <Star className="size-3.5 fill-gold text-gold" />
                <span>
                  <span className="font-black text-gold-light">+۱۲٬۰۰۰ مادر</span> همراه ما
                </span>
              </p>
            </div>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-paper p-5 sm:p-7 dark:bg-dusk">
          <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-black tracking-[0.2em] text-gold">MALLI KIDS</p>
              <h3 className="mt-1 text-lg font-black">
                {tab === "register" ? "ساخت حساب" : tab === "otp" ? "ورود با پیامک" : "ورود به حساب"}
              </h3>
            </div>
            <button type="button" onClick={close} className="inline-flex size-9 items-center justify-center rounded-full text-navy hover:bg-sand dark:text-ivory dark:hover:bg-dusk-mid" aria-label="بستن">
              <X className="size-5" />
            </button>
          </div>

          <div className="grid shrink-0 grid-cols-3 gap-1 rounded-2xl bg-sand p-1 dark:bg-dusk-mid">
            {(
              [
                ["login", "ورود"],
                ["otp", "پیامک"],
                ["register", "ثبت‌نام"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTab(id);
                  setErr("");
                  setBad([]);
                  setSent(false);
                  setOtp(Array(OTP_LEN).fill(""));
                  setRegName("");
                }}
                className={`rounded-xl py-2 text-[13px] font-extrabold ${tab === id ? "bg-navy text-ivory shadow-sm dark:bg-gold dark:text-navy-deep" : "text-navy/55 dark:text-wheat"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {err ? <p className="mt-3 shrink-0 text-xs font-bold text-rose">{err}</p> : null}

          <div className="-mx-2 min-h-0 flex-1 overflow-y-auto overflow-x-clip px-2">
          {tab === "login" ? (
            <form onSubmit={onLogin} className="mt-5 space-y-3.5" noValidate>
              <Field label="ایمیل یا موبایل" icon={<Mail className="size-4" />} bad={bad.includes("email")} shake={shake}>
                <input name="email" dir="ltr" autoComplete="username" placeholder="0912 345 6789" className="field" />
              </Field>
              <Field
                label="رمز عبور"
                icon={<Lock className="size-4" />}
                bad={bad.includes("password")}
                shake={shake}
                extra={
                  <button type="button" className="px-2 text-gold" onClick={() => setShow((s) => !s)} aria-label="نمایش رمز">
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                }
              >
                <input name="password" type={show ? "text" : "password"} autoComplete="current-password" placeholder="••••••••" className="field" />
              </Field>
              <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-navy font-black text-ivory dark:bg-gold dark:text-navy-deep">
                ورود به حساب <ArrowLeft className="size-4" />
              </button>
              <button type="button" className="w-full text-center text-xs font-bold text-gold" onClick={() => setTab("otp")}>
                ورود بدون رمز، با پیامک
              </button>
            </form>
          ) : null}

          {tab === "otp" ? (
            <form onSubmit={sent ? verifyOtp : (e) => { e.preventDefault(); sendOtp(); }} className="mt-5 space-y-4" noValidate>
              {!sent ? (
              <Field label="شماره موبایل" icon={<Phone className="size-4" />} bad={bad.includes("otpPhone")} shake={shake}>
                <input
                  dir="ltr"
                  inputMode="tel"
                  placeholder="0912 345 6789"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="field"
                />
              </Field>
              ) : (
                <div className="rounded-2xl border border-gold/30 bg-sand/80 px-3 py-3 dark:bg-navy-mid">
                  <p className="text-[11px] font-black text-gold">شماره قفل‌شده</p>
                  <p className="mt-1 font-black tracking-wide text-navy dark:text-ivory" dir="ltr">
                    {phone}
                  </p>
                  <p className="mt-1 text-[11px] text-navy/45 dark:text-wheat">برای عوض کردن شماره، اول «تغییر شماره» را بزنید.</p>
                </div>
              )}

              {sent ? (
                otpFields("تأیید و ورود")
              ) : (
                <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-black text-navy-deep">
                  دریافت کد پیامک <ArrowLeft className="size-4" />
                </button>
              )}
            </form>
          ) : null}

          {tab === "register" ? (
            <form onSubmit={sent ? verifyOtp : startRegister} className="mt-4 space-y-3" autoComplete="off" noValidate>
              {!sent ? (
                <>
                  <Field label="نام و نام خانوادگی" icon={<User className="size-4" />} bad={bad.includes("firstName")} shake={shake}>
                    <input name="firstName" defaultValue={regName} placeholder="سارا محمدی" className="field" />
                  </Field>
                  <Field label="شماره موبایل" icon={<Phone className="size-4" />} bad={bad.includes("phone")} shake={shake}>
                    <input name="phone" type="tel" dir="ltr" defaultValue={phone} placeholder="0912 345 6789" className="field" />
                  </Field>
                  <p className="text-center text-[11px] font-bold text-navy/55 dark:text-wheat">یک کد ۵ رقمی برای تأیید به موبایل شما پیامک می‌شود.</p>
                  <button type="submit" className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-gold font-black text-navy-deep">
                    دریافت کد تأیید <ArrowLeft className="size-4" />
                  </button>
                </>
              ) : (
                <>
                  <div className="rounded-2xl border border-gold/30 bg-sand/80 px-3 py-3 dark:bg-navy-mid">
                    <p className="text-[11px] font-black text-gold">ساخت حساب برای</p>
                    <p className="mt-1 font-black text-navy dark:text-ivory">
                      {regName} <span className="font-bold text-navy/45 dark:text-wheat" dir="ltr">— {phone}</span>
                    </p>
                  </div>
                  {otpFields("تأیید و ساخت حساب")}
                </>
              )}
            </form>
          ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function Perk({ icon, t, d }: { icon: ReactNode; t: string; d: string }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-gold-light">{icon}</span>
      <div>
        <p className="text-sm font-bold text-white">{t}</p>
        <p className="mt-0.5 text-[11px] text-ivory/50">{d}</p>
      </div>
    </li>
  );
}

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
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-bold text-navy dark:text-ivory">{label}</span>
      <span
        key={`${label}-${shake}`}
        className={`flex h-11 items-center rounded-xl border bg-white dark:bg-dusk-mid ${bad ? "animate-shake border-rose" : "border-tan dark:border-gold/30"}`}
      >
        <span className="flex w-9 shrink-0 items-center justify-center text-gold">{icon}</span>
        {children}
        {extra}
      </span>
    </label>
  );
}
