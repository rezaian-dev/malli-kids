"use client";

import { useEffect } from "react";

/**
 * هدر ثابت است و ارتفاعش با نوارِ مناسبتی/جشنواره عوض می‌شود؛ این برگ
 * فاصلهٔ بالای main را همیشه برابرِ ارتفاعِ واقعیِ هدر نگه می‌دارد تا هیچ
 * محتوایی زیر هدر پنهان نشود (در هر عرض و هر حالتِ بنر).
 */
export function HeaderSpacer() {
  useEffect(() => {
    const header = document.querySelector("header");
    const main = document.querySelector("main");
    if (!header || !main) return;
    const GAP = 12; // نفسِ طراحی بین هدر و محتوا
    const update = () => {
      const h = Math.ceil(header.getBoundingClientRect().height);
      if (h > 0) main.style.paddingTop = `${h + GAP}px`;
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(header);
    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, []);
  return null;
}
