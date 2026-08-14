"use client";

import { useTransition } from "react";
import { Bell, BellRing } from "lucide-react";
import { useStore } from "@/providers/store-provider";
import { toast } from "@/lib/toast";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { pdpCtaButton } from "../_lib/product-chrome";
import { requestBackInStockAction } from "../_lib/back-in-stock-actions";

/** 🔔 Replaces the old "به محض موجود شدن خبرتان می‌کنیم" toast — that
 *  promise was never actually kept anywhere. This one really subscribes:
 *  `notifyBackInStock` (`@/lib/shop/back-in-stock`) fires a real in-app
 *  notification once an admin (or a return) puts stock back on this exact
 *  size. `sizeKey` is `""` for a legacy/unsized product — the whole
 *  product, not one variant. */
export function BackInStockButton({
  productId,
  sizeKey,
  subscribed,
  onSubscribed,
}: {
  productId: number;
  sizeKey: string;
  subscribed: boolean;
  onSubscribed: () => void;
}) {
  const { user, setAuthOpen } = useStore();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    if (!user) {
      setAuthOpen(true);
      toast.error("برای دریافت اطلاع‌رسانی، اول وارد حساب‌تان شوید");
      return;
    }

    startTransition(async () => {
      const result = await requestBackInStockAction(
        productId,
        sizeKey || undefined,
      );
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      onSubscribed();
      toast.success("باشه! به‌محض موجود شدن این مورد، خبرتان می‌کنیم");
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending || subscribed}
      onClick={handleClick}
      className={cn(
        pdpCtaButton,
        "border-2",
        subscribed
          ? "border-emerald-500/50 text-emerald-700 dark:text-emerald-300"
          : "border-gold text-gold hover:bg-gold hover:text-navy-deep",
      )}
    >
      {subscribed ? (
        <BellRing className="size-4" />
      ) : (
        <Bell className="size-4" />
      )}
      {subscribed
        ? "به شما خبر می‌دهیم 🔔"
        : pending
          ? "در حال ثبت…"
          : "خبرم کن وقتی موجود شد"}
    </Button>
  );
}
