"use client";

import dynamic from "next/dynamic";
import type { Product } from "@/types";
import { useIdlePreloadMount } from "@/hooks/use-idle-preload-mount";

const loadCheckoutDialog = () => import("./checkout-dialog");

// 🧾 Lazy mount the checkout dialog only once it matters. ✨
const CheckoutDialog = dynamic(
  () => loadCheckoutDialog().then((m) => m.CheckoutDialog),
  { ssr: false },
);

export function CheckoutMount({
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
  const mounted = useIdlePreloadMount(open, loadCheckoutDialog);

  return mounted ? (
    <CheckoutDialog
      open={open}
      onOpenChange={onOpenChange}
      product={product}
      size={size}
      qty={qty}
      unit={unit}
    />
  ) : null;
}
