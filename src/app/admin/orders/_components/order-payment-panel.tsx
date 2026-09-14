"use client";

import { useRef, useState } from "react";
import { Banknote, CheckCircle2, CircleAlert, ReceiptText, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AppForm, Field, SubmitButton, useAppForm } from "@/components/form";
import { manualPaymentSchema } from "@/lib/shop/order-finance-schema";
import { formatToman } from "@/lib/locale/fa";
import { toast } from "@/lib/toast";
import { refreshWallet } from "@/hooks/use-wallet";
import type { AdminOrder } from "@/types";
import { confirmOrderPaymentAction } from "../_lib/actions";

const schema = manualPaymentSchema.omit({ orderId: true });

export function OrderPaymentPanel({
  order,
  onChanged,
}: {
  order: AdminOrder;
  onChanged: (order: AdminOrder) => void;
}) {
  const [open, setOpen] = useState(false);
  const locked = useRef(false);
  const form = useAppForm({ schema, defaultValues: { reference: "", confirmed: false } });
  const cancelled = order.status === "لغوشده";

  return (
    <div className="mx-4 rounded-2xl border border-gold/20 bg-gold/5 p-4">
      <p className="text-navy dark:text-ivory flex items-center gap-2 text-xs font-black">
        <ReceiptText className="text-gold-deep dark:text-gold size-4" /> وضعیت دریافت وجه
      </p>
      {order.paymentVerified ? (
        <div className="mt-3 space-y-2">
          <p className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300">
            <CheckCircle2 className="size-3.5" /> {formatToman(order.paidAmount ?? 0)}{" "}
            تومان دریافت شده
          </p>
          <p className="text-navy/70 dark:text-wheat text-[10px] leading-6">
            شماره پیگیری: <bdi className="break-all">{order.paymentReference}</bdi>
          </p>
          {order.paidAt ? (
            <p className="text-navy/70 dark:text-wheat/70 text-[10px]">{order.paidAt}</p>
          ) : null}
          {(order.refundedAmount ?? 0) > 0 ? (
            <p className="text-emerald-700 dark:text-emerald-300 flex items-start gap-1.5 border-t border-emerald-500/15 pt-2 text-[10px] leading-6">
              <Wallet className="mt-1 size-3.5 shrink-0" /> مبلغ این سفارش به کیف پول
              مشتری بازگشته است.
            </p>
          ) : null}
        </div>
      ) : (
        <>
          <p className="text-navy/70 dark:text-wheat mt-2 text-[11px] leading-7">
            {order.pay === "پرداخت‌شده"
              ? "این سفارش فقط برچسب قدیمی پرداخت دارد. پیش از بازگشت وجه، دریافت واقعی مبلغ را بررسی و تأیید کنید."
              : "تا زمان دریافت واقعی وجه و تأیید شما، این سفارش پرداخت‌شده محسوب نمی‌شود."}
          </p>
          {order.status !== "مرجوعی" ? (
            <Dialog
              open={open}
              onOpenChange={(value) => {
                if (!locked.current) {
                  setOpen(value);
                  if (value) form.reset({ reference: "", confirmed: false });
                }
              }}
            >
              <DialogTrigger asChild>
                <Button
                  type="button"
                  variant="gold"
                  className="mt-3 h-10 w-full rounded-xl text-xs"
                >
                  <Banknote className="size-4" />{" "}
                  {cancelled ? "ثبت وجه دریافتی پس از لغو" : "تأیید دریافت وجه"}
                </Button>
              </DialogTrigger>
              <DialogContent
                dir="rtl"
                className="border-gold/25 bg-paper text-navy max-h-[90dvh] w-[calc(100%-1.5rem)] max-w-md sm:max-w-md overflow-y-auto rounded-[28px] border p-5 sm:p-6 dark:bg-dusk dark:text-ivory"
                onInteractOutside={(event) => {
                  if (locked.current) event.preventDefault();
                }}
                onEscapeKeyDown={(event) => {
                  if (locked.current) event.preventDefault();
                }}
              >
                <div className="bg-gold/12 text-gold-deep dark:text-gold grid size-12 place-items-center rounded-2xl">
                  <Banknote className="size-5" />
                </div>
                <DialogTitle className="text-navy dark:text-ivory text-lg font-black">
                  تأیید دریافت واقعی وجه
                </DialogTitle>
                <DialogDescription className="text-navy/70 dark:text-wheat text-xs leading-7">
                  این گزینه جای درگاه پرداخت نیست. فقط وقتی مبلغ سفارش واقعاً دریافت شده،
                  آن را تأیید کنید.
                </DialogDescription>
                <div className="rounded-2xl bg-navy p-4 text-ivory">
                  <span className="text-[10px] text-gold-soft">
                    سفارش <bdi>{order.id}</bdi>
                  </span>
                  <p className="mt-2 flex flex-wrap items-baseline gap-2">
                    <b className="text-2xl font-black">{formatToman(order.total)}</b>
                    <span className="text-xs">تومان</span>
                  </p>
                </div>
                {cancelled ? (
                  <p
                    role="note"
                    className="flex items-start gap-2 rounded-xl bg-emerald-500/6 p-3 text-xs leading-7 text-emerald-700 dark:text-emerald-300"
                  >
                    <Wallet className="mt-1 size-4 shrink-0" /> سفارش قبلاً لغو شده است؛
                    مبلغ تأییدشده بلافاصله به کیف پول مشتری افزوده می‌شود و سفارش دوباره
                    فعال نخواهد شد.
                  </p>
                ) : null}
                <AppForm
                  form={form}
                  ariaLabel={`تأیید پرداخت ${order.id}`}
                  className="space-y-4 px-1"
                  onSubmit={async (values) => {
                    locked.current = true;
                    try {
                      const result = await confirmOrderPaymentAction({
                        orderId: order.id,
                        ...values,
                      });
                      if (!result.ok) {
                        form.setError(
                          result.field === "reference" ? "reference" : "root.server",
                          { message: result.error },
                        );
                        return;
                      }
                      setOpen(false);
                      onChanged(result.data);
                      refreshWallet();
                      toast.success("دریافت وجه ثبت شد", {
                        description: result.data.refundedAmount
                          ? "وجه سفارش لغوشده به کیف پول مشتری برگشت."
                          : "تأیید پرداخت در سابقه سفارش ثبت شد.",
                      });
                    } finally {
                      locked.current = false;
                    }
                  }}
                >
                  <Field
                    name="reference"
                    noShell
                    label="شماره پیگیری یا رسید"
                    required
                    hint="شماره کارت و اطلاعات حساس را وارد نکنید."
                  >
                    {({ field, invalid, id, describedBy }) => (
                      <input
                        {...field}
                        id={id}
                        aria-invalid={invalid || undefined}
                        aria-describedby={describedBy}
                        maxLength={80}
                        autoComplete="off"
                        placeholder="شماره رسید دریافت وجه"
                        className="w-full rounded-xl border border-navy/15 bg-transparent p-3 text-base outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 dark:border-gold/25 sm:text-sm"
                      />
                    )}
                  </Field>
                  <Field name="confirmed" noShell>
                    {({ field, invalid, id, describedBy }) => (
                      <label
                        className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-navy/10 p-3 text-xs leading-7 dark:border-gold/20"
                        htmlFor={id}
                      >
                        <input
                          ref={field.ref}
                          name={field.name}
                          id={id}
                          type="checkbox"
                          checked={field.value}
                          onChange={(event) => field.onChange(event.target.checked)}
                          onBlur={field.onBlur}
                          aria-invalid={invalid || undefined}
                          aria-describedby={describedBy}
                          className="mt-1.5 size-4 shrink-0 accent-[#b8893f]"
                        />
                        <span>
                          تأیید می‌کنم مبلغ <b>{formatToman(order.total)} تومان</b> واقعاً
                          دریافت شده است.
                        </span>
                      </label>
                    )}
                  </Field>
                  <p className="text-navy/70 dark:text-wheat/70 flex items-start gap-1.5 text-[10px] leading-6">
                    <CircleAlert className="mt-1 size-3 shrink-0" /> این تأیید ثبت مالی
                    است؛ مبلغ از اطلاعات سفارش خوانده می‌شود و قابل تغییر نیست.
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-xl"
                      disabled={form.formState.isSubmitting}
                      onClick={() => setOpen(false)}
                    >
                      بازگشت
                    </Button>
                    <SubmitButton
                      className="h-11 rounded-xl bg-navy text-ivory dark:bg-gold dark:text-navy"
                      pendingLabel="در حال ثبت…"
                    >
                      ثبت تأیید پرداخت
                    </SubmitButton>
                  </div>
                </AppForm>
              </DialogContent>
            </Dialog>
          ) : null}
        </>
      )}
    </div>
  );
}
