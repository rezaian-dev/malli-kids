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

// 📱 Password reset moved off email onto the SMS panel (better-auth's `phoneNumber`
// plugin) — no more "never reveal whether the account exists" swallow-all-errors
// dance, because `requestPasswordResetPhoneNumber` already does that itself
// server-side (it answers {status:true} even for an unknown phone number, see
// its route source) — a thrown error here is a real failure worth surfacing.
export async function forgotPasswordAction(
  values: ForgotPasswordValues,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    await auth.api.requestPasswordResetPhoneNumber({
      body: { phoneNumber: phoneDigits(parsed.data.phone) },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}

// 📨 Real send via the SMS panel (src/lib/sms.ts, wired in auth.ts's `phoneNumber`
// plugin). The app-level cooldown below matches the client's 90s resend timer and
// sits in front of Better Auth's own (Redis-backed) per-route limit as a second layer.
export async function requestOtpAction(
  values: OtpRequestValues,
): Promise<ActionResult> {
  const parsed = otpRequestSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const phone = phoneDigits(parsed.data.phone);
  const limited = await rateLimit(`otp-request:${phone}`, {
    windowMs: 90_000,
    max: 1,
  });
  if (!limited.ok)
    return { ok: false, error: "کمی صبر کنید و دوباره تلاش کنید." };

  try {
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber: phone },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}

// 🆕🔑 One endpoint, two outcomes: a phone nobody's seen before gets an account
// on the spot (`signUpOnVerification` in auth.ts), an existing one just signs
// in — matching the "enter phone, get code, you're in" UX of the login tab.
export async function verifyOtpAction(
  values: OtpVerifyValues & { phone: string },
): Promise<ActionResult<User>> {
  const parsed = otpVerifySchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    const { user } = await auth.api.verifyPhoneNumber({
      body: { phoneNumber: phoneDigits(values.phone), code: parsed.data.code },
      headers: await headers(),
    });
    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return authActionError(error);
  }
}

export async function resetPasswordAction(
  values: ResetPasswordValues & { phone: string },
): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(values);
  if (!parsed.success)
    return { ok: false, error: parsed.error.issues[0]?.message ?? FALLBACK_ERROR };

  try {
    await auth.api.resetPasswordPhoneNumber({
      body: {
        phoneNumber: phoneDigits(values.phone),
        otp: parsed.data.code,
        newPassword: parsed.data.password,
      },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}
