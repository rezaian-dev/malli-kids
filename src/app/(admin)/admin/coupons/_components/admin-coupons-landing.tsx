"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { AdminPageHeader } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { toast } from "@/lib/toast";
import type { AdminCoupon } from "@/types";
import { createCouponAction } from "../_lib/actions";
import { CouponList } from "./coupon-list";
import { NewCouponDialog } from "./new-coupon-dialog";

export function AdminCouponsLanding({ coupons }: { coupons: AdminCoupon[] }) {
  const [open, setOpen] = useState(false);
  const [, startTransition] = useTransition();

  return (
    <div>
      <AdminPageHeader
        kicker="PROMOTIONS"
        title="کدهای تخفیف"
        description="طراحی، فعال‌سازی و تحلیل کمپین‌های تخفیفی و میزان استفاده مشتریان."
        action={
          <Button
            type="button"
            variant="navy"
            className="h-11 rounded-xl"
            onClick={() => setOpen(true)}
          >
            <Plus className="size-4" /> کد جدید
          </Button>
        }
      />

      <CouponList coupons={coupons} />

      <NewCouponDialog
        open={open}
        existingCodes={coupons.map((c) => c.code)}
        onClose={() => setOpen(false)}
        onCreate={(coupon) => {
          startTransition(async () => {
            const result = await createCouponAction({
              code: coupon.code,
              title: coupon.title,
              rate: coupon.rate,
              cap: coupon.cap,
              min: coupon.min,
              until: coupon.until,
            });
            if (result.ok) toast.success("کد تخفیف ذخیره شد", { description: coupon.code });
            else toast.error(result.error);
          });
        }}
      />
    </div>
  );
}
