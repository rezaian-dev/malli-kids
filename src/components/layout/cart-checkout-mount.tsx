"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import type { CartCheckoutRow } from "./cart-checkout-dialog";

// 🧾 Lazy mount the cart checkout dialog only once it matters — same
// preload-on-idle pattern as `components/product/checkout-mount.tsx`.
const CartCheckoutDialog = dynamic(
  () => import("./cart-checkout-dialog").then((m) => m.CartCheckoutDialog),
  { ssr: false },
);

export function CartCheckoutMount({
  open,
  onOpenChange,
  rows,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rows: CartCheckoutRow[];
  onSuccess: () => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useEffect(() => {
    if (mounted) return;

    const preload = () => void import("./cart-checkout-dialog");
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
    <CartCheckoutDialog
      open={open}
      onOpenChange={onOpenChange}
      rows={rows}
      onSuccess={onSuccess}
    />
  ) : null;
}
