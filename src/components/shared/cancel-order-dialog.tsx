"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { CircleAlert, PackageX, ShieldCheck, Wallet } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AppForm, Field, SubmitButton, useAppForm } from "@/components/form";
import {
  cancelOrderSchema,
  type CancelOrderValues,
} from "@/lib/shop/order-finance-schema";
import { canCancelBeforeShipping } from "@/lib/shop/order-status";
import { cancelMyOrderAction } from "@/app/(storefront)/profile/_lib/orders-actions";
import { announceProfileTab, profileTabHref } from "@/lib/profile-nav";
import { refreshWallet } from "@/hooks/use-wallet";
import { formatToman } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import type { ActionResult } from "@/lib/action-result";
import type { AdminOrder } from "@/types";

const formSchema = cancelOrderSchema.omit({ orderId: true });

export function CancelOrderDialog({
  order,
  onChanged,
  action = cancelMyOrderAction,
  admin = false,
}: {
  order: AdminOrder;
  onChanged: (order: AdminOrder) => void;
  action?: (values: CancelOrderValues) => Promise<ActionResult<AdminOrder>>;
  admin?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const locked = useRef(false);
  const form = useAppForm({ schema: formSchema, defaultValues: { reason: "" } });
  if (!canCancelBeforeShipping(order.status)) return null;
  if (
    (order.pay === "پرداخت‌شده" && !order.paymentVerified) ||
    order.pay === "بازگشت به کیف پول"
  ) {
    return (
      <p className="text-navy/70 dark:text-wheat text-[10px] leading-6">
        برای لغو این سفارش، پرداخت قبلی باید{" "}
        {admin ? "ابتدا تأیید شود." : "توسط پشتیبانی تأیید شود."}
      </p>
    );
  }
  const refund = order.paymentVerified ? (order.paidAmount ?? 0) : 0;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        if (!locked.current) {
          setOpen(value);
          if (value) form.reset({ reason: "" });
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-rose hover:bg-rose/6 h-9 gap-1.5 rounded-full text-[11px] font-bold"
        >
          <PackageX className="size-3.5" /> لغو سفارش
        </Button>
      </DialogTrigger>
      <DialogContent
        dir="rtl"
        className="border-gold/25 bg-paper text-navy max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-md sm:max-w-md overflow-y-auto rounded-[28px] border p-5 sm:p-6 dark:bg-dusk dark:text-ivory"
        onEscapeKeyDown={(event) => {
          if (locked.current) event.preventDefault();
        }}
        onInteractOutside={(event) => {
          if (locked.current) event.preventDefault();
        }}
      >
        <div
          aria-hidden
          className="grid size-12 place-items-center rounded-2xl border border-rose/15 bg-rose/6 text-rose"
        >
          <PackageX className="size-5" />
        </div>
        <div>
          <DialogTitle className="text-navy dark:text-ivory text-lg font-black">
            از لغو سفارش مطمئنید؟
          </DialogTitle>
          <DialogDescription className="text-navy/70 dark:text-wheat mt-2 text-xs leading-7">
            سفارش <bdi className="font-bold">{order.id}</bdi> هنوز ارسال نشده است. پس از
            لغو، ادامهٔ همین سفارش ممکن نیست.
          </DialogDescription>
        </div>
        <div
          className={
            refund
              ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4"
              : "rounded-2xl border border-gold/20 bg-gold/6 p-4"
          }
        >
          <div className="flex items-center gap-2 text-xs font-black">
            <Wallet className="size-4 text-gold-deep dark:text-gold" />{" "}
            {refund ? "بازگشت وجه به کیف پول" : "سفارش بدون پرداخت تأییدشده"}
          </div>
          {refund ? (
            <>
              <p className="mt-3 flex flex-wrap items-baseline gap-2 text-emerald-700 dark:text-emerald-300">
                <b className="text-2xl font-black">{formatToman(refund)}</b>
                <span className="text-[11px]">تومان</span>
              </p>
              <p className="text-navy/70 dark:text-wheat mt-2 text-[10px] leading-6">
                مبلغ نهایی پرداخت‌شده، شامل هزینه ارسال، به کیف پول برمی‌گردد؛ نه حساب
                بانکی.
              </p>
            </>
          ) : (
            <p className="text-navy/70 dark:text-wheat mt-2 text-xs leading-6">
              چون وجهی تأیید نشده، موجودی کیف پول با این لغو تغییر نمی‌کند.
            </p>
          )}
        </div>
        <AppForm
          form={form}
          ariaLabel={`لغو سفارش ${order.id}`}
          className="min-w-0 space-y-4 px-1"
          onSubmit={async (values) => {
            locked.current = true;
            try {
              const result = await action({ orderId: order.id, ...values });
              if (!result.ok) {
                form.setError("root.server", { message: result.error });
                return;
              }
              setOpen(false);
              onChanged(result.data);
              refreshWallet();
              toast.success("سفارش لغو شد", {
                description: result.data.refundedAmount
                  ? `${formatToman(result.data.refundedAmount)} تومان به کیف پول برگشت.`
                  : "وجهی برای بازگشت ثبت نشده بود.",
              });
            } finally {
              locked.current = false;
            }
          }}
        >
          <Field name="reason" noShell label="دلیل لغو" hint="اختیاری؛ حداکثر ۱۶۰ نویسه">
            {({ field, invalid, id, describedBy }) => (
              <textarea
                {...field}
                id={id}
                aria-invalid={invalid || undefined}
                aria-describedby={describedBy}
                maxLength={160}
                rows={2}
                placeholder="اگر دوست دارید، دلیل خود را بنویسید…"
                className="w-full resize-none rounded-xl border border-navy/15 bg-transparent p-3 text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 dark:border-gold/25 sm:text-sm"
              />
            )}
          </Field>
          <p className="text-navy/70 dark:text-wheat/70 inline-flex items-start gap-1.5 text-[10px] leading-6">
            <ShieldCheck className="mt-1 size-3 shrink-0" /> هر سفارش فقط یک‌بار اعتبار
            بازگشت وجه دریافت می‌کند.
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-11 rounded-xl border-navy/15 dark:border-gold/25"
              disabled={form.formState.isSubmitting}
              onClick={() => setOpen(false)}
            >
              نگه‌داشتن سفارش
            </Button>
            <SubmitButton
              className="h-11 rounded-xl bg-rose text-white hover:bg-rose/90"
              pendingLabel="در حال ثبت لغو…"
            >
              تأیید لغو
            </SubmitButton>
          </div>
        </AppForm>
        {!admin && refund > 0 ? (
          <p className="text-navy/70 dark:text-wheat/70 flex items-start gap-1.5 text-[10px] leading-6">
            <CircleAlert className="mt-1 size-3 shrink-0" /> شارژ آنلاین و استفاده از
            موجودی در خرید هنوز فعال نیستند.{" "}
            <Link
              className="underline underline-offset-4"
              href={profileTabHref("support")}
              onClick={() => announceProfileTab("support")}
            >
              پشتیبانی
            </Link>
          </p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
