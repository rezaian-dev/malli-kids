import { z } from "zod";
import { toEnDigits } from "@/lib/locale/fa";

export const orderIdSchema = z.string().trim().min(1).max(40);
export const cancelOrderSchema = z.object({
  orderId: orderIdSchema,
  reason: z.string().trim().max(160, "دلیل لغو را کوتاه‌تر بنویسید.").optional(),
});
export const manualPaymentSchema = z.object({
  orderId: orderIdSchema,
  reference: z
    .string()
    .transform((value) => toEnDigits(value).replace(/\s+/g, "").toUpperCase())
    .pipe(
      z
        .string()
        .min(3, "شماره پیگیری یا رسید را وارد کنید.")
        .max(80, "شماره پیگیری طولانی است."),
    ),
  confirmed: z.boolean().refine((value) => value, "دریافت واقعی مبلغ را تأیید کنید."),
});

export type CancelOrderValues = z.infer<typeof cancelOrderSchema>;
export type ManualPaymentValues = z.infer<typeof manualPaymentSchema>;
