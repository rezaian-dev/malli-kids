"use client";

import { useEffect, useRef } from "react";

/**
 * جایگیرِ پویا برای هدرِ ثابت.
 *
 * نوارِ مناسبتی (بنر) ارتفاعِ متغیری دارد (تیترِ یک یا دو خطی در عرض‌های مختلف)،
 * پس یک padding استاتیک در <main> نمی‌تواند فضای دقیق را رزرو کند و محتوا زیرِ
 * هدر می‌رود یا به آن می‌چسبد. این کامپوننت ارتفاعِ واقعیِ <header> را با
 * ResizeObserver می‌گیرد و همان اندازه + فاصلهٔ تنفس را جای می‌دهد تا هیچ
 * هم‌پوشانی‌ای رخ ندهد — بدونِ استایلِ اینلاینِ دستی.
 */
export function HeaderSpacer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const header = document.querySelector("header");
    if (!header || !ref.current) return;
    const GAP = 28; // فاصلهٔ تنفسِ محتوا از هدر
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

  return <div ref={ref} aria-hidden />;
}
