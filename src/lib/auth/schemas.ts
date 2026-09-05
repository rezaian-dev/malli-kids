import { z } from "zod";
import { email, fa, fullName, mobile, otpCode, strongPassword } from "@/lib/forms";

export const signInSchema = z.object({
  email: email(),
  password: z.string().min(1, fa.required("رمز عبور")),
});
export type SignInValues = z.infer<typeof signInSchema>;
export const signInDefaults: SignInValues = { email: "", password: "" };

export const signUpSchema = z.object({
  name: fullName(),
  email: email(),
  password: strongPassword(),
});
export type SignUpValues = z.infer<typeof signUpSchema>;
export const signUpDefaults: SignUpValues = { name: "", email: "", password: "" };

export const forgotPasswordSchema = z.object({ email: email() });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export const forgotPasswordDefaults: ForgotPasswordValues = { email: "" };

// 📱 SMS provider isn't wired up yet, but the shapes are real for UI validation.
export const otpRequestSchema = z.object({ phone: mobile() });
export type OtpRequestValues = z.infer<typeof otpRequestSchema>;
export const otpRequestDefaults: OtpRequestValues = { phone: "" };

export const OTP_LEN = 5;
export const otpVerifySchema = z.object({ code: otpCode(OTP_LEN) });
export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;
export const otpVerifyDefaults: OtpVerifyValues = { code: "" };

export const resetPasswordSchema = z
  .object({
    password: strongPassword(),
    confirmPassword: z.string(),
    token: z.string().min(1, "لینکِ بازنشانی نامعتبر است"),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "رمزهای واردشده یکسان نیستند",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
