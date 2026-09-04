"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Sparkles, User } from "lucide-react";

import { adminSignInAction } from "@/lib/auth/actions";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { adminGlassCard } from "@/lib/admin/admin-chrome";

type LoginValues = {
  user: string;
  pass: string;
};

type LoginErrors = Partial<Record<keyof LoginValues | "root", string>>;

const EMPTY_VALUES: LoginValues = {
  user: "",
  pass: "",
};

const FIELD_LABEL = "text-navy/70 dark:text-wheat text-xs font-black";
const FIELD_ICON =
  "text-navy/70 dark:text-wheat pointer-events-none absolute inset-y-0 inset-s-4 z-10 my-auto size-4";
const FIELD_INPUT =
  "border-navy/12 dark:border-gold/20 h-14 rounded-3xl bg-transparent ps-11 pe-4 text-sm";
const FIELD_ERROR = "text-rose text-xs font-bold";

export function AdminLoginLanding() {
  const router = useRouter();
  const [values, setValues] = useState<LoginValues>(EMPTY_VALUES);
  const [errors, setErrors] = useState<LoginErrors>({});
  const [pending, setPending] = useState(false);

  function updateValue(field: keyof LoginValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({
      ...current,
      [field]: undefined,
      root: undefined,
    }));
  }

  function validate(next: LoginValues): LoginErrors {
    const issues: LoginErrors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.user.trim())) {
      issues.user = "ایمیل معتبر وارد کنید";
    }

    if (next.pass.length < 1) {
      issues.pass = "رمز عبور را وارد کنید";
    }

    return issues;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validate(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setPending(true);
    const result = await adminSignInAction({
      email: values.user.trim(),
      password: values.pass,
    });
    setPending(false);

    if (!result.ok) {
      setErrors({ root: result.error });
      return;
    }

    setErrors({});
    router.replace("/admin");
  }

  return (
    <div
      className={cn(
        "grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(20rem,42%)]",
        "text-navy bg-fog bg-[radial-gradient(52%_38%_at_100%_0%,rgba(193,147,87,0.15),transparent_68%),radial-gradient(42%_34%_at_0%_100%,rgba(14,42,71,0.08),transparent_72%),linear-gradient(rgba(14,42,71,0.022)_1px,transparent_1px),linear-gradient(90deg,rgba(14,42,71,0.022)_1px,transparent_1px)] bg-size-[auto,auto,36px_36px,36px_36px]",
        "dark:text-ivory dark:bg-[#03111f] dark:bg-[radial-gradient(58%_44%_at_103%_-4%,rgba(193,147,87,0.18),transparent_68%),radial-gradient(45%_38%_at_-5%_105%,rgba(44,86,128,0.34),transparent_72%),linear-gradient(rgba(232,197,122,0.027)_1px,transparent_1px),linear-gradient(90deg,rgba(232,197,122,0.027)_1px,transparent_1px)] dark:bg-size-[auto,auto,42px_42px,42px_42px]",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "pointer-events-none fixed inset-0 z-0",
          "mask-[linear-gradient(to_bottom_left,#000,transparent_64%)] bg-size-[min(44vw,38rem)] bg-position-[calc(100%+45px)_-45px] bg-no-repeat opacity-[0.22] max-[639px]:bg-size-[20rem] max-[639px]:opacity-[0.14]",
          "dark:opacity-[0.52] dark:filter-[drop-shadow(0_0_22px_rgba(193,147,87,0.08))]",
        )}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='180' height='180' viewBox='0 0 180 180' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23c19357' stroke-opacity='.28'%3E%3Ccircle cx='90' cy='90' r='42'/%3E%3Ccircle cx='90' cy='90' r='28' stroke-dasharray='3 7'/%3E%3Cpath d='M90 34v112M34 90h112M50 50l80 80M130 50l-80 80' stroke-opacity='.15'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      {/* ♿ AdminShell renders its own `<main>` for every other admin route
          but bypasses its whole chrome here (see `admin-shell.tsx`'s
          `path === "/admin/login"` check) — this page needs its own main
          landmark since nothing upstream provides one. */}
      <main className="relative flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image
              src="/brand/logo-white.png"
              alt=""
              width={44}
              height={44}
              className="bg-navy size-11 rounded-2xl object-contain p-1.5 dark:bg-transparent dark:p-0"
            />
            <div className="leading-none">
              <p
                className={cn(
                  "font-display text-sm font-bold tracking-[0.2em]",
                  "text-navy",
                  "dark:text-ivory",
                )}
              >
                MALLI
              </p>
              <p className="text-gold mt-1 text-[10px] font-black tracking-[0.32em]">
                CONSOLE
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle
              className={cn(
                "size-10 rounded-full border bg-white",
                "border-navy/12 text-navy hover:border-gold/50",
                "dark:border-gold/25 dark:bg-navy-mid dark:text-gold-soft",
              )}
            />
            <Link
              href="/"
              className={cn(
                "inline-flex min-h-11 items-center text-xs font-black",
                "text-navy/70 hover:text-gold",
                "dark:text-ivory/70",
              )}
            >
              بازگشت به فروشگاه
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-md py-12 lg:mx-0">
          <p className="text-gold text-[11px] font-black tracking-[0.22em]">
            ATELIER ACCESS
          </p>
          <h1 className="text-navy dark:text-ivory mt-3 text-[clamp(1.7rem,4vw,2.6rem)] leading-tight font-black">
            ورود تیم
            <span className="text-gold"> گالری</span>
          </h1>
          <p className="text-navy/70 dark:text-wheat mt-3 text-sm leading-7">
            پنل سفارش، موجودی و مجله — فقط برای همکاران ملی‌کیدز.
          </p>

          <form onSubmit={onSubmit} noValidate className="mt-9 space-y-6">
            {errors.root ? (
              <p role="alert" className="text-rose text-sm font-bold">
                {errors.root}
              </p>
            ) : null}

            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor="admin-user">
                ایمیل
              </label>
              <div className="relative rounded-3xl bg-white/70 dark:bg-white/5">
                <User className={FIELD_ICON} />
                <Input
                  id="admin-user"
                  type="email"
                  value={values.user}
                  onChange={(event) => updateValue("user", event.target.value)}
                  placeholder="you@mallikids.ir"
                  autoComplete="email"
                  dir="ltr"
                  aria-invalid={Boolean(errors.user)}
                  className={FIELD_INPUT}
                  required
                />
              </div>
              {errors.user ? (
                <p role="alert" className={FIELD_ERROR}>
                  {errors.user}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label className={FIELD_LABEL} htmlFor="admin-pass">
                کلید دسترسی
              </label>
              <div className="relative rounded-3xl bg-white/70 dark:bg-white/5">
                <Lock className={FIELD_ICON} />
                <Input
                  id="admin-pass"
                  type="password"
                  value={values.pass}
                  onChange={(event) => updateValue("pass", event.target.value)}
                  placeholder="رمز اختصاصی پنل"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.pass)}
                  className={FIELD_INPUT}
                  required
                />
              </div>
              {errors.pass ? (
                <p role="alert" className={FIELD_ERROR}>
                  {errors.pass}
                </p>
              ) : null}
            </div>

            <button
              type="submit"
              disabled={pending}
              className={cn(
                "group flex h-14 w-full items-center justify-between rounded-full px-6 text-sm font-black transition",
                "bg-navy text-ivory hover:bg-navy-mid shadow-[0_16px_32px_-16px_rgba(14,42,71,.55)]",
                "dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light",
                "disabled:pointer-events-none disabled:opacity-60",
              )}
            >
              {pending ? "در حال ورود…" : "ورود به کنسول"}
              <span
                className={cn(
                  "grid size-9 place-items-center rounded-full transition-transform group-hover:-translate-x-1",
                  "bg-navy-deep text-gold",
                  "dark:bg-navy-deep/30 dark:text-navy-deep",
                )}
              >
                <ArrowLeft className="size-4" />
              </span>
            </button>
          </form>
        </div>

        <ul className="text-navy/70 dark:text-wheat grid max-w-md grid-cols-3 gap-3 text-[11px] font-bold">
          <li className={cn(adminGlassCard, "px-3 py-3")}>
            <ShieldCheck className="text-gold mb-1 size-4" /> دسترسی محدود
          </li>
          <li className={cn(adminGlassCard, "px-3 py-3")}>
            <Sparkles className="text-gold mb-1 size-4" /> سفارش لحظه‌ای
          </li>
          <li className={cn(adminGlassCard, "px-3 py-3")}>
            <Lock className="text-gold mb-1 size-4" /> نشست امن
          </li>
        </ul>
      </main>

      <aside className="bg-navy relative hidden min-h-72 overflow-hidden lg:block">
        <Image
          src="/brand/hero-dress.jpg"
          alt=""
          width={900}
          height={1200}
          priority
          className="absolute inset-0 size-full object-cover object-[center_15%]"
        />
        <div className="from-navy-deep via-navy-deep/35 absolute inset-0 bg-linear-to-t to-transparent" />
        <div className="border-gold/40 absolute inset-5 rounded-[28px] border" />
        <div className="text-ivory absolute inset-x-10 bottom-10">
          <p className="font-display text-gold-light text-xs tracking-[0.35em]">
            MALLI KIDS
          </p>
          <p className="mt-3 max-w-xs text-2xl leading-snug font-black">
            هر دوخت، یک سفارش دقیق در گالری.
          </p>
        </div>
      </aside>
    </div>
  );
}
