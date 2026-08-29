"use client";

import type { ReactNode } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";

/**
 * دکمهٔ افزودن به سبد روی کارت محصول.
 * فقط شمارندهٔ نمایشی را بالا می‌برد — منطق واقعی سبد در بک‌اند خواهد بود.
 */
export function AddToCart({
  out,
  id,
  size = "۹۸",
  className,
  children,
}: {
  out: boolean;
  id: number;
  size?: string;
  className?: string;
  children: ReactNode;
}) {
  const { addToCart, showToast } = useStore();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (out) {
      showToast("به محض موجود شدن خبرتان می‌کنیم");
      return;
    }
    addToCart(id, size);
    showToast("به سبد اضافه شد");
  }

  return (
    <Button type="button" onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
