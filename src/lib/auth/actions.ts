"use server";

import { headers } from "next/headers";
import { APIError } from "better-auth";
import { auth } from "@/lib/auth/auth";
import { buildUser } from "@/lib/auth/user";
import { isAdminUser } from "@/lib/auth/admin";
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

const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

// 🈯 Better Auth's own error codes → the one Farsi sentence each deserves.
// Anything not listed here (including rate limits) falls back to a generic
// message, so we never leak internals to the client.
const ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "ایمیل یا رمز عبور اشتباه است.",
  USER_ALREADY_EXISTS: "حسابی با این ایمیل قبلاً ساخته شده — وارد شوید.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "حسابی با این ایمیل قبلاً ساخته شده — وارد شوید.",
  PASSWORD_TOO_SHORT: "رمز عبور کوتاه است.",
  PASSWORD_TOO_LONG: "رمز عبور بیش‌ازحد بلند است.",
  INVALID_TOKEN: "لینکِ بازنشانی نامعتبر یا منقضی شده — دوباره درخواست دهید.",
  TOKEN_EXPIRED: "لینکِ بازنشانی منقضی شده — دوباره درخواست دهید.",
  USER_NOT_FOUND: "کاربری با این مشخصات پیدا نشد.",
};

function actionError(error: unknown): { ok: false; error: string } {
  const code =
    error instanceof APIError ? (error.body as { code?: string })?.code : undefined;
  return { ok: false, error: (code && ERROR_MESSAGES[code]) || FALLBACK_ERROR };
}

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
    return actionError(error);
  }
}

/** 🔒 Same real sign-in as `signInAction`, plus a server-side admin check —
 *  the login form on `/admin/login` calls this, never `signInAction`. A
 *  successfully-authenticated non-admin is immediately signed back out
 *  (never left holding a session from an admin-login attempt) and gets the
 *  same rejection an unauthenticated visitor would. */
export async function adminSignInAction(
  values: SignInValues,
): Promise<ActionResult<User>> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  try {
    const { user } = await auth.api.signInEmail({
      body: parsed.data,
      headers: await headers(),
    });

    if (!isAdminUser(user)) {
      await auth.api.signOut({ headers: await headers() });
      return { ok: false, error: "این حساب دسترسی مدیریت ندارد." };
    }

    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return actionError(error);
  }
}

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
    // 🆕 A brand-new signup never has a `Profile` doc yet, but going through
    // `buildUser` anyway (not a plain identity-only object) keeps this
    // action's return shape identical to `signInAction`'s and to
    // `getSessionUser()` — one shape, one place that builds it.
    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return actionError(error);
  }
}

export async function signOutAction(): Promise<ActionResult> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { ok: true };
  } catch (error) {
    return actionError(error);
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

// 📱 OTP sign-in — the UI (`AuthModal` → `OtpLoginPanel`) is fully built, but
// no SMS panel has been purchased yet. Flip this once one is wired up (and
// fill in the real `send()` below); nothing in the client needs to change —
// it already only trusts `demo` to decide whether to show the preview note.
const SMS_PROVIDER_CONFIGURED = false;

/** 📨 Requests an OTP code for `phone`. With no SMS provider configured this
 *  never actually sends anything — it answers `{ demo: true }` so the client
 *  can still walk through the real code-entry screen as a labeled preview
 *  instead of a dead button. */
export async function requestOtpAction(
  values: OtpRequestValues,
): Promise<ActionResult<{ demo: boolean }>> {
  const parsed = otpRequestSchema.safeParse(values);
  if (!parsed.success) return { ok: false, error: FALLBACK_ERROR };

  const phone = phoneDigits(parsed.data.phone);
  // 🚦 One request per phone per cooldown window — same rhythm as the
  // resend timer the client shows (`useCooldown`'s default 90s).
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

/** 🔐 Verifies an OTP code and signs the user in. No SMS provider means no
 *  code was ever really sent, so this must never fake a successful
 *  sign-in — it always explains that plainly instead. */
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
    return actionError(error);
  }
}
