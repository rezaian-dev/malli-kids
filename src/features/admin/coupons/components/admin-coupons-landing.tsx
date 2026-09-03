"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { AdminPageHeader, useAdmin } from "@/components/admin";
import { Button } from "@/components/ui/button";
import { CouponList } from "./coupon-list";
import { NewCouponDialog } from "./new-coupon-dialog";

export function AdminCouponsLanding() {
  const { db, saveCoupons } = useAdmin();
  const [open, setOpen] = useState(false);

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

      <CouponList />

      <NewCouponDialog
        open={open}
        existingCodes={db.coupons.map((c) => c.code)}
        onClose={() => setOpen(false)}
        onCreate={(coupon) => saveCoupons([coupon, ...db.coupons])}
      />
    </div>
  );
}
