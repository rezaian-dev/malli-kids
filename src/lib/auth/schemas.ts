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

// 📱 Password reset moved off email onto the SMS panel — same phone+code shape as OTP login.
export const forgotPasswordSchema = z.object({ phone: mobile() });
export type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;
export const forgotPasswordDefaults: ForgotPasswordValues = { phone: "" };

export const otpRequestSchema = z.object({ phone: mobile() });
export type OtpRequestValues = z.infer<typeof otpRequestSchema>;
export const otpRequestDefaults: OtpRequestValues = { phone: "" };

export const OTP_LEN = 5;
export const otpVerifySchema = z.object({ code: otpCode(OTP_LEN) });
export type OtpVerifyValues = z.infer<typeof otpVerifySchema>;
export const otpVerifyDefaults: OtpVerifyValues = { code: "" };

// 🔑 Second step of the phone-based reset. No `phone` field here — same as
// `verifyOtpAction`, it carries over from step one as component state, not a
// re-typed form field, and gets merged in only where the server action needs it.
export const resetPasswordSchema = z
  .object({
    code: otpCode(OTP_LEN),
    password: strongPassword(),
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    error: "رمزهای واردشده یکسان نیستند",
    path: ["confirmPassword"],
  });
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
export const resetPasswordDefaults: ResetPasswordValues = {
  code: "",
  password: "",
  confirmPassword: "",
};
