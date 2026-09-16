"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ForgotPasswordPanel } from "@/components/auth/auth-forgot-password-panel";
import { LoginPanel } from "@/components/auth/auth-login-panel";
import { RegisterPanel } from "@/components/auth/auth-register-panel";
import { cn } from "@/lib/utils";

type View = "login" | "register" | "forgot";

const TITLES: Record<View, string> = {
  login: "ورود به حساب",
  register: "ساخت حساب",
  forgot: "بازیابی رمز عبور",
};

const TAB =
  "min-h-11 flex-1 rounded-xl px-3 text-[13px] font-extrabold transition-colors focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none";

export function AuthPage({ initialView }: { initialView: "login" | "register" }) {
  const [view, setView] = useState<View>(initialView);

  return (
    <section
      dir="rtl"
      className="bg-paper text-navy flex min-w-0 flex-col px-5 py-6 sm:px-10 sm:py-9 lg:px-12 lg:py-10 dark:bg-dusk dark:text-ivory"
    >
      <header className="flex items-center justify-between gap-4">
        <Link
          href="/"
          className="group flex min-w-0 items-center gap-2 rounded-full px-1 py-1 focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          aria-label="بازگشت به صفحه اصلی ملی‌کیدز"
        >
          <span className="font-display leading-none">
            <span className="block text-sm font-bold tracking-[0.2em]">MALLI</span>
            <span className="text-gold-deep dark:text-gold-light mt-1 block text-[10px] tracking-[0.38em]">
              KIDS
            </span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-navy/65 dark:text-linen/70 inline-flex min-h-10 items-center gap-1 rounded-full px-2 text-xs font-bold transition-colors hover:text-gold-deep focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
        >
          بازگشت به فروشگاه
          <ArrowRight className="size-3.5" />
        </Link>
      </header>

      <div className="mx-auto w-full max-w-md flex-1 pt-9 sm:pt-12 lg:pt-14">
        <p className="text-gold-deep dark:text-gold-light text-[11px] font-black tracking-[0.22em]">
          MALLI KIDS / ATELIER ACCOUNT
        </p>
        <h1 className="mt-3 text-[clamp(1.65rem,4vw,2.35rem)] leading-tight font-black">
          {TITLES[view]}
        </h1>
        <p className="text-navy/70 dark:text-linen/70 mt-3 max-w-md text-sm leading-7">
          ورود، ساخت حساب یا بازیابی رمز با شمارهٔ موبایل تأییدشده.
        </p>

        {view === "forgot" ? (
          <button
            type="button"
            onClick={() => setView("login")}
            className="text-gold-deep dark:text-gold-light mt-5 inline-flex min-h-10 items-center gap-1 rounded-full px-1 text-xs font-bold focus-visible:ring-2 focus-visible:ring-gold focus-visible:outline-none"
          >
            <ArrowRight className="size-3.5" /> بازگشت به ورود
          </button>
        ) : (
          <div
            className="bg-sand ring-navy/5 dark:bg-navy-deep/70 mt-7 grid grid-cols-2 gap-1 rounded-2xl p-1 ring-1 dark:ring-white/10"
            role="tablist"
            aria-label="نوع حساب"
          >
            <button
              id="login-tab"
              type="button"
              role="tab"
              aria-selected={view === "login"}
              aria-controls="login-panel"
              onClick={() => setView("login")}
              className={cn(
                TAB,
                view === "login"
                  ? "bg-navy text-ivory shadow-sm dark:bg-gold dark:text-navy-deep"
                  : "text-navy/70 hover:text-navy dark:text-linen/70 dark:hover:text-ivory",
              )}
            >
              ورود
            </button>
            <button
              id="register-tab"
              type="button"
              role="tab"
              aria-selected={view === "register"}
              aria-controls="register-panel"
              onClick={() => setView("register")}
              className={cn(
                TAB,
                view === "register"
                  ? "bg-navy text-ivory shadow-sm dark:bg-gold dark:text-navy-deep"
                  : "text-navy/70 hover:text-navy dark:text-linen/70 dark:hover:text-ivory",
              )}
            >
              ثبت‌نام
            </button>
          </div>
        )}

        <div className={cn("min-w-0", view === "forgot" ? "mt-5" : "mt-7")}>
          <section
            id="login-panel"
            role="tabpanel"
            aria-labelledby="login-tab"
            hidden={view !== "login"}
          >
            <LoginPanel onForgot={() => setView("forgot")} />
          </section>
          <section
            id="register-panel"
            role="tabpanel"
            aria-labelledby="register-tab"
            hidden={view !== "register"}
          >
            <RegisterPanel />
          </section>
          <section
            id="forgot-panel"
            role="tabpanel"
            aria-label="بازیابی رمز عبور"
            hidden={view !== "forgot"}
          >
            <ForgotPasswordPanel onBack={() => setView("login")} />
          </section>
        </div>
      </div>

      <p className="text-navy/55 dark:text-linen/55 mx-auto mt-8 w-full max-w-md text-center text-[10px] leading-5 sm:mt-10">
        با ادامه، شرایط استفاده و حریم خصوصی ملی‌کیدز را می‌پذیرید.
      </p>
    </section>
  );
}
