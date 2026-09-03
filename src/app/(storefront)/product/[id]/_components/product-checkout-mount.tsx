"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { Product } from "@/types";

// 🧾 Lazy mount the checkout dialog only once it matters. ✨
const ProductCheckoutDialog = dynamic(
  () =>
    import("./product-checkout-dialog").then((m) => m.ProductCheckoutDialog),
  { ssr: false },
);

export function ProductCheckoutMount({
  open,
  onOpenChange,
  product,
  size,
  qty,
  unit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product;
  size: string;
  qty: number;
  unit: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (mounted) return;

    const preload = () => void import("./product-checkout-dialog");
    const hasIdle = typeof window.requestIdleCallback === "function";
    const id = hasIdle
      ? window.requestIdleCallback(preload, { timeout: 4000 })
      : window.setTimeout(preload, 2500);

    return () => {
      if (hasIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [mounted]);

  return mounted ? (
    <ProductCheckoutDialog
      open={open}
      onOpenChange={onOpenChange}
      product={product}
      size={size}
      qty={qty}
      unit={unit}
    />
  ) : null;
}
