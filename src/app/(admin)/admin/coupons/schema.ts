import { z } from "zod";
import { amount, isJalaliFuture, jalaliDate, optAmount, percent, promoCode, text } from "@/lib/forms";

/** کد تخفیفِ جدیدِ پنل */
export const couponSchema = z
  .object({
    code: promoCode(),
    title: text("عنوان", 3, 60),
    rate: percent(1, 90),
    cap: amount("سقف استفاده", { min: 1, max: 100_000 }),
    min: optAmount({ min: 0, max: 500_000_000 }),
    until: jalaliDate("تاریخِ انقضا"),
  })
  .superRefine((v, ctx) => {
    if (!isJalaliFuture(v.until)) {
      ctx.addIssue({ code: "custom", path: ["until"], message: "انقضا باید بعد ازِ امروز باشد" });
    }
  });

export type CouponValues = z.infer<typeof couponSchema>;

export const couponDefaults: CouponValues = {
  code: "",
  title: "",
  rate: "10",
  cap: "200",
  min: "0",
  until: "",
};
