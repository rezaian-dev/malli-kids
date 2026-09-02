"use client";

import type { ReactNode } from "react";
import { useAddToCart } from "@/hooks/use-add-to-cart";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
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
  const addToCart = useAddToCart();

  function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (out) {
      toast("به محض موجود شدن خبرتان می‌کنیم");
      return;
    }
    // 🔐 `addToCart` itself gates guests (opens the login dialog + its own
    // toast) — only announce success when it actually added the line.
    if (addToCart(id, size)) toast("به سبد اضافه شد");
  }

  return (
    <Button type="button" onClick={onClick} className={className}>
      {children}
    </Button>
  );
}
