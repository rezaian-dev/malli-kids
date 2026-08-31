import { z } from "zod";
import {
  emailOrMobile,
  fullName,
  mobile,
  otpCode,
  password,
} from "@/lib/forms";

export const loginSchema = z.object({
  identifier: emailOrMobile("ایمیل یا موبایل"),
  password: password(6),
});
export type LoginValues = z.infer<typeof loginSchema>;
export const loginDefaults: LoginValues = { identifier: "", password: "" };

export const smsStartSchema = z.object({
  name: fullName({ required: false }),
  phone: mobile("شمارهٔ موبایل"),
});
export type SmsStartValues = z.infer<typeof smsStartSchema>;
export const smsStartDefaults: SmsStartValues = { name: "", phone: "" };

export const registerSchema = z.object({
  name: fullName(),
  phone: mobile("شمارهٔ موبایل"),
});
export type RegisterValues = z.infer<typeof registerSchema>;
export const registerDefaults: RegisterValues = { name: "", phone: "" };

export const OTP_LEN = 5;
export const smsCodeSchema = z.object({ code: otpCode(OTP_LEN) });
export type SmsCodeValues = z.infer<typeof smsCodeSchema>;
export const smsCodeDefaults: SmsCodeValues = { code: "" };

export function smsAccount(phoneDigits: string) {
  return { email: `${phoneDigits}@sms.mallikids.ir`, phone: phoneDigits };
}
