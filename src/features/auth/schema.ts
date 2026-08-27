import { z } from "zod";
import { emailOrMobile, fullName, mobile, otpCode, password } from "@/lib/forms";

/* ─────────── ورود با ایمیل/موبایل + رمز ─────────── */

export const loginSchema = z.object({
  identifier: emailOrMobile("ایمیل یا موبایل"),
  password: password(6),
});
export type LoginValues = z.infer<typeof loginSchema>;
export const loginDefaults: LoginValues = { identifier: "", password: "" };

/* ─────────── ورود/ثبت‌نام با پیامک (دو مرحله‌ای) ─────────── */

/** مرحلهٔ اولِ «ورود با پیامک»: فقط شماره (فیلدِ نام در این تب رندر نمی‌شود) */
export const smsStartSchema = z.object({
  name: fullName({ required: false }),
  phone: mobile("شمارهٔ موبایل"),
});
export type SmsStartValues = z.infer<typeof smsStartSchema>;
export const smsStartDefaults: SmsStartValues = { name: "", phone: "" };

/** مرحلهٔ اولِ «ثبت‌نام»: نام + شماره */
export const registerSchema = z.object({
  name: fullName(),
  phone: mobile("شمارهٔ موبایل"),
});
export type RegisterValues = z.infer<typeof registerSchema>;
export const registerDefaults: RegisterValues = { name: "", phone: "" };

/** مرحلهٔ دومِ مشترک: کد ۵ رقمی */
export const OTP_LEN = 5;
export const smsCodeSchema = z.object({ code: otpCode(OTP_LEN) });
export type SmsCodeValues = z.infer<typeof smsCodeSchema>;
export const smsCodeDefaults: SmsCodeValues = { code: "" };

/** شماره را برای لاگینِ پیامکی یکتا می‌کند: ۰۹۱۲… → ۰۹۱۲۳۴۵۶۷۸۹ */
export function smsAccount(phoneDigits: string) {
  return { email: `${phoneDigits}@sms.mallikids.ir`, phone: phoneDigits };
}
