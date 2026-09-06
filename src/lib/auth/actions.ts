"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth/auth";
import { buildUser } from "@/lib/auth/user";
import { authActionError, FALLBACK_ERROR } from "@/lib/auth/auth-errors";
import { phoneDigits } from "@/lib/digits";
import { rateLimit } from "@/lib/rate-limit";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import {
  forgotPasswordSchema,
  otpRequestSchema,
  otpVerifySchema,
  resetPasswordSchema,
  signInSchema,
  signUpSchema,
  type ForgotPasswordValues,
  type OtpRequestValues,
  type OtpVerifyValues,
  type ResetPasswordValues,
  type SignInValues,
  type SignUpValues,
} from "./schemas";

export async function signInAction(
  values: SignInValues,
): Promise<ActionResult<User>> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    const { user } = await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });
    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return authActionError(error);
  }
}

// 🛡️ The admin-panel equivalent lives in `admin-actions.ts` — it signs in
// against a fully separate cookie (`adminAuth`) so it never touches this
// storefront session.

export async function signUpAction(
  values: SignUpValues,
): Promise<ActionResult<User>> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    const { user } = await auth.api.signUpEmail({
      body: parsed.data,
      headers: await headers(),
    });
    // 🆕 Routes through buildUser anyway to keep the return shape identical everywhere.
    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return authActionError(error);
  }
}

export async function signOutAction(): Promise<ActionResult> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}

export async function forgotPasswordAction(
  values: ForgotPasswordValues,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    await auth.api.requestPasswordReset({
      body: { email: parsed.data.email, redirectTo: "/reset-password" },
      headers: await headers(),
    });
  } catch {
    // 🤫 Never reveal whether the email exists — always report success.
  }
  return { ok: true };
}

// 📱 UI is fully built; flip once an SMS provider is purchased and wired up.
const SMS_PROVIDER_CONFIGURED = false;

// 📨 With no SMS provider, answers { demo: true } so the UI still previews.
export async function requestOtpAction(
  values: OtpRequestValues,
): Promise<ActionResult<{ demo: boolean }>> {
  const parsed = otpRequestSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const phone = phoneDigits(parsed.data.phone);
  // 🚦 Matches the client's resend cooldown (90s).
  const limited = rateLimit(`otp-request:${phone}`, {
    windowMs: 90_000,
    max: 1,
  });
  if (!limited.ok)
    return { ok: false, error: "کمی صبر کنید و دوباره تلاش کنید." };

  if (!SMS_PROVIDER_CONFIGURED) return { ok: true, data: { demo: true } };

  // TODO: send the real SMS via the configured provider once purchased.
  return { ok: true, data: { demo: false } };
}

// 🔐 No SMS provider means no code was sent — never fake a successful sign-in.
export async function verifyOtpAction(
  values: OtpVerifyValues,
): Promise<ActionResult<User>> {
  const parsed = otpVerifySchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  return {
    ok: false,
    error:
      "ورود با کدِ پیامکی هنوز فعال نشده — فعلاً از ایمیل و رمز عبور وارد شوید.",
  };
}

export async function resetPasswordAction(
  values: ResetPasswordValues,
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? FALLBACK_ERROR };

  try {
    await auth.api.resetPassword({
      body: { newPassword: parsed.data.password, token: parsed.data.token },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}
