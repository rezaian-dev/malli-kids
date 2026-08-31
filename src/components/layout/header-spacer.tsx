"use client";

import { useEffect, useRef } from "react";

/**
 * جایگیرِ پویا برای هدرِ ثابت.
 *
 * نوارِ مناسبتی (بنر) ارتفاعِ متغیری دارد (تیترِ یک یا دو خطی در عرض‌های مختلف)،
 * پس به‌جایِ وابستگیِ کامل به جاوااسکریپت — که باعث می‌شد محتوا در اولین رندر
 * «زیرِ هدر» بنشیند و بعد از هیدریشن بپرد — یک ارتفاعِ پیش‌فرضِ سمتِ سرور
 * (SSR-safe) نیز رزرو می‌کنیم:
 *
 *   - < 640px: بنر دو خط می‌شود ⇒ هدر ≈ ۱۵۳px ⇒ جایگیر = ۱۵۳ + ۲۸(تنفس) ≈ ۱۸۱px
 *   - ≥ 640px: بنر یک خط ⇒ هدر ≈ ۱۳۸px ⇒ جایگیر = ۱۳۸ + ۲۸ ≈ ۱۶۶px
 *
 * ResizeObserver بعداً مقدارِ دقیق را جایگزین می‌کند (تغییرِ اندازه/جشنواره)،
 * ولی چون کلاسِ اولیه همان مقدارِ نهایی است، هیچ پرشِ بصری رخ نمی‌دهد.
 */
const GAP = 28; // فاصلهٔ تنفسِ محتوا از هدر

export function HeaderSpacer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header || !ref.current) return;
    const update = () => {
      if (ref.current) {
        ref.current.style.height = `${header.getBoundingClientRect().height + GAP}px`;
      }
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  // ارتفاعِ پیش‌فرضِ رزروشده در سرور ⇒ محتوا از همان ابتدا جای درست خودش است.
  return <div ref={ref} aria-hidden className="h-[181px] sm:h-[166px]" />;
}
