import type * as React from "react";

// 🪶 Zero-JS reveal helpers — plain `<div>`s with NO `"use client"` and NO
// `motion/react` import, so server components that only need the (inert)
// `Reveal`/`FadeIn`/`Stagger` API ship zero hydration JavaScript for them.
// Import interactive springs (`TiltCard`, `MagneticGlow`, `MotionProvider`)
// from `@/components/motion` (→ `./primitives`) instead.
//
// ⚡ انیمیشن‌های «ورود» (fades/slideهای گِیت‌شده با هایدریشن و اسکرول) عمداً
// حذف شده‌اند: چون استایلِ اولیه‌ی `opacity: 0` داخل HTML سرور هم رندر
// می‌شد، با هر رفرش/ناوبری صفحه اول خالی/کم‌رنگ دیده می‌شد و بعد محتوا
// تکه‌تکه «پاپ» می‌کرد (فلش و پرش). این کامپوننت‌ها فقط یک div ساده‌اند
// تا همه‌چیز از همان اولِ پینت کامل و بی‌درنگ دیده شود و ناوبری حسِ SPA
// داشته باشد.
type StaticProps = React.HTMLAttributes<HTMLDivElement> & {
  /** نگه‌داشته شده برای سازگاری با فراخوانی‌های قبلی — نادیده گرفته می‌شود. */
  delay?: number;
  /** نگه‌داشته شده برای سازگاری با فراخوانی‌های قبلی — نادیده گرفته می‌شود. */
  y?: number;
};

/** 🪶 رندرِ بی‌درنگِ محتوا (قبلاً: ورودِ «محو + بالا آمدن» هنگام اسکرول). */
export function Reveal({
  children,
  className,
  delay,
  y,
  ...rest
}: StaticProps) {
  void delay;
  void y;
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

/** 👁️ رندرِ بی‌درنگِ محتوا (قبلاً: محو شدن هنگام رسیدن به دید کاربر). */
export function FadeIn({ children, className, delay, ...rest }: StaticProps) {
  void delay;
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

/** 🎼 آبشاری (stagger): پدر با `Stagger` و هر فرزند با `StaggerItem` بسته می‌شود. */
export function Stagger({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

export function StaggerItem({
  children,
  className,
  ...rest
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={className} {...rest}>
      {children}
    </div>
  );
}

/** 🧭 رندرِ بی‌درنگِ محتوای هر صفحه — بدون فیدِ route-change تا تعویض مسیر
 *  فلش نزند و حسِ SPA حفظ شود (قبلاً کل صفحه با `key={pathname}` ری‌ماونت و
 *  از `opacity: 0` فید می‌شد). */
export function PageReveal({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}

/** 🧢 سربرگ بی‌درنگ و کامل رندر می‌شود (قبلاً هنگام بارگذاری از بالا سُر
 *  می‌خورد پایین و با PageReveal ترکیب می‌شد تا کل صفحه چشمک بزند). */
export function HeaderEnter({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={className}>{children}</div>;
}
