"use client";

import dynamic from "next/dynamic";
import type { CartCheckoutRow } from "./cart-checkout-dialog";
import { useIdlePreloadMount } from "@/hooks/use-idle-preload-mount";

const loadCartCheckoutDialog = () => import("./cart-checkout-dialog");

const CartCheckoutDialog = dynamic(
  () => loadCartCheckoutDialog().then((m) => m.CartCheckoutDialog),
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
  const mounted = useIdlePreloadMount(open, loadCartCheckoutDialog);

  return mounted ? (
    <CartCheckoutDialog
      open={open}
      onOpenChange={onOpenChange}
      rows={rows}
      onSuccess={onSuccess}
    />
  ) : null;
}
