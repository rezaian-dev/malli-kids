"use client";

import Image from "next/image";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Lock, ShieldCheck, Sparkles, User } from "lucide-react";
import { useAdmin } from "@/features/admin";
import { ModeToggle } from "@/components/shared/mode-toggle";
import { AppForm, TextField, useAppForm } from "@/components/form";
import { adminLoginDefaults, adminLoginSchema, type AdminLoginValues } from "./schema";

export default function AdminLogin() {
  const { login } = useAdmin();
  const router = useRouter();
  const [shake, setShake] = useState(0);
  const form = useAppForm({ schema: adminLoginSchema, defaultValues: adminLoginDefaults });
  const err = form.formState.errors.root?.message;

  function onSubmit({ user, pass }: AdminLoginValues) {
    if (!login(user.trim(), pass)) {
      // خطایِ سمتِ سرور: رویِ ریشهٔ فرم می‌نشیند و فرم را می‌لرزاند
      form.setError("root", { message: "نام کاربری یا رمز نادرست است" });
      setShake((n) => n + 1);
      return;
    }
    form.clearErrors("root");
    router.replace("/admin");
  }

  return (
    <div className="admin-root grid min-h-dvh lg:grid-cols-[minmax(0,1fr)_minmax(20rem,42%)]">
      <section className="relative flex flex-col justify-between px-6 py-8 sm:px-10 lg:px-16 lg:py-12">
        <header className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Image src="/brand/logo-white.png" alt="" width={44} height={44} className="size-11 rounded-2xl bg-navy p-1.5 object-contain dark:bg-transparent dark:p-0" />
            <div className="leading-none">
              <p className="font-display text-sm font-bold tracking-[0.2em] text-navy dark:text-ivory">MALLI</p>
              <p className="mt-1 text-[10px] font-black tracking-[0.32em] text-gold">CONSOLE</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <ModeToggle className="size-10 rounded-full border border-navy/12 bg-white text-navy hover:border-gold/50 dark:border-gold/25 dark:bg-navy-mid dark:text-gold-soft" />
            <Link href="/" className="inline-flex min-h-11 items-center text-xs font-black text-navy/50 hover:text-gold dark:text-ivory/45">
              بازگشت به فروشگاه
            </Link>
          </div>
        </header>

        <div className="mx-auto w-full max-w-md py-12 lg:mx-0">
          <p className="lux-kicker">ATELIER ACCESS</p>
          <h1 className="mt-3 text-[clamp(1.7rem,4vw,2.6rem)] font-black leading-tight text-navy dark:text-ivory">
            ورود تیم
            <span className="text-gold"> گالری</span>
          </h1>
          <p className="mt-3 text-sm leading-7 text-navy/55 dark:text-wheat">
            پنل سفارش، موجودی و مجله — فقط برای همکاران ملی‌کیدز.
          </p>

          <AppForm
            form={form}
            onSubmit={onSubmit}
            ariaLabel="ورود به پنل مدیریت"
            shakeSignal={shake}
            className="mt-9 space-y-6"
          >
            {err ? (
              <p role="alert" className="text-sm font-bold text-rose">
                {err}
              </p>
            ) : null}

            <TextField
              name="user"
              label="شناسه"
              icon={<User className="size-4" />}
              placeholder="شناسه همکار"
              autoComplete="username"
              skin="bare"
              required
            />
            <TextField
              name="pass"
              label="کلید دسترسی"
              icon={<Lock className="size-4" />}
              type="password"
              placeholder="رمز اختصاصی پنل"
              autoComplete="current-password"
              skin="bare"
              required
            />

            <button type="submit" className="group flex h-14 w-full items-center justify-between rounded-full bg-navy px-6 text-sm font-black text-ivory shadow-[0_16px_32px_-16px_rgba(14,42,71,.55)] transition hover:bg-navy-mid dark:bg-gold dark:text-navy-deep dark:hover:bg-gold-light">
              ورود به کنسول
              <span className="grid size-9 place-items-center rounded-full bg-navy-deep text-gold transition-transform group-hover:-translate-x-1 dark:bg-navy-deep/30 dark:text-navy-deep">
                <ArrowLeft className="size-4" />
              </span>
            </button>
          </AppForm>
        </div>

        <ul className="grid max-w-md grid-cols-3 gap-3 text-[11px] font-bold text-navy/60 dark:text-wheat">
          <li className="admin-card px-3 py-3">
            <ShieldCheck className="mb-1 size-4 text-gold" /> دسترسی محدود
          </li>
          <li className="admin-card px-3 py-3">
            <Sparkles className="mb-1 size-4 text-gold" /> سفارش لحظه‌ای
          </li>
          <li className="admin-card px-3 py-3">
            <Lock className="mb-1 size-4 text-gold" /> نشست امن
          </li>
        </ul>
      </section>

      {/* Image panel — intentionally rich in both themes */}
      <aside className="relative hidden min-h-[18rem] overflow-hidden bg-navy lg:block">
        <Image src="/brand/hero-dress.jpg" alt="" width={900} height={1200} className="absolute inset-0 size-full object-cover object-[center_15%]" />
        <div className="absolute inset-0 bg-linear-to-t from-navy-deep via-navy-deep/35 to-transparent" />
        <div className="absolute inset-5 rounded-[28px] border border-gold/40" />
        <div className="absolute inset-x-10 bottom-10 text-ivory">
          <p className="font-display text-xs tracking-[0.35em] text-gold-light">MALLI KIDS</p>
          <p className="mt-3 max-w-xs text-2xl font-black leading-snug">هر دوخت، یک سفارش دقیق در گالری.</p>
        </div>
      </aside>
    </div>
  );
}
