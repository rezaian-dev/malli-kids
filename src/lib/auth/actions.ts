"use server";

import { headers } from "next/headers";
import type { ZodError } from "zod";
import { auth } from "@/lib/auth/auth";
import { buildUser } from "@/lib/auth/user";
import { authActionError, FALLBACK_ERROR } from "@/lib/auth/auth-errors";
import type { ActionResult } from "@/lib/action-result";
import type { User } from "@/types";
import {
  completeSignUpSchema,
  forgotPasswordSchema,
  otpRequestSchema,
  resetPasswordWithPhoneSchema,
  signInSchema,
  signUpSchema,
  verifyPhoneSchema,
  type CompleteSignUpValues,
  type ForgotPasswordValues,
  type OtpRequestValues,
  type OtpVerifyValues,
  type ResetPasswordValues,
  type SignInValues,
  type SignUpValues,
} from "./schemas";

function validationError(error: ZodError) {
  const issue = error.issues[0];
  return {
    ok: false as const,
    error: issue?.message ?? FALLBACK_ERROR,
    field: String(issue?.path[0] ?? "root"),
  };
}

export async function signInAction(
  values: SignInValues,
): Promise<ActionResult<User>> {
  const parsed = signInSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
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

/** No user is created until the submitted mobile number has passed OTP verification. */
export async function requestSignUpOtpAction(
  values: SignUpValues,
): Promise<ActionResult> {
  const parsed = signUpSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const ctx = await auth.$context;
    const existingPhone = await ctx.adapter.findOne({
      model: "user",
      where: [{ field: "phoneNumber", value: parsed.data.phone }],
    });
    if (existingPhone)
      return {
        ok: false,
        error: "این شماره قبلاً ثبت شده؛ از بخش ورود استفاده کنید.",
        field: "phone",
      };
    if (
      await ctx.internalAdapter.findUserByEmail(parsed.data.email.toLowerCase())
    ) {
      return {
        ok: false,
        error: "حسابی با این ایمیل قبلاً ساخته شده؛ وارد شوید.",
        field: "email",
      };
    }
    return await requestOtpAction({ phone: parsed.data.phone });
  } catch (error) {
    return authActionError(error);
  }
}

export async function signUpAction(
  values: CompleteSignUpValues,
): Promise<ActionResult<User>> {
  const parsed = completeSignUpSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const { phone, ...rest } = parsed.data;
    const body = { ...rest, phoneNumber: phone };
    // The auth hook also enforces this proof on direct /api/auth/sign-up/email calls.
    const { user } = await auth.api.signUpEmail({
      body,
      headers: await headers(),
    });
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

/** Generic success for unknown numbers is intentional: never enumerate accounts. */
export async function forgotPasswordAction(
  values: ForgotPasswordValues,
): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await auth.api.requestPasswordResetPhoneNumber({
      body: { phoneNumber: parsed.data.phone },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}

export async function requestOtpAction(
  values: OtpRequestValues,
): Promise<ActionResult> {
  const parsed = otpRequestSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    // Cooldown is in the auth hook, so the public endpoint cannot bypass it.
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber: parsed.data.phone },
      headers: await headers(),
    });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}

export async function verifyOtpAction(
  values: OtpVerifyValues & { phone: string },
): Promise<ActionResult<User>> {
  const parsed = verifyPhoneSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const { user } = await auth.api.verifyPhoneNumber({
      body: { phoneNumber: parsed.data.phone, code: parsed.data.code },
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
  const parsed = resetPasswordWithPhoneSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    await auth.api.resetPasswordPhoneNumber({
      body: {
        phoneNumber: parsed.data.phone,
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

/** Existing email/password customers can opt in without trusting their old contact number. */
export async function requestRecoveryPhoneAction(
  values: OtpRequestValues,
): Promise<ActionResult> {
  const parsed = otpRequestSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    if (!session)
      return { ok: false, error: "برای تغییر شماره، دوباره وارد حساب شوید." };
    if (
      session.user.phoneNumberVerified &&
      session.user.phoneNumber === parsed.data.phone
    ) {
      return {
        ok: false,
        error: "این شماره از قبل تأیید شده است.",
        field: "phone",
      };
    }
    const ctx = await auth.$context;
    const existing = await ctx.adapter.findOne({
      model: "user",
      where: [{ field: "phoneNumber", value: parsed.data.phone }],
    });
    if (existing)
      return {
        ok: false,
        error: "این شماره به حسابی دیگر متصل است.",
        field: "phone",
      };
    return await requestOtpAction(parsed.data);
  } catch (error) {
    return authActionError(error);
  }
}

export async function verifyRecoveryPhoneAction(
  values: OtpVerifyValues & { phone: string },
): Promise<ActionResult<User>> {
  const parsed = verifyPhoneSchema.safeParse(values);
  if (!parsed.success) return validationError(parsed.error);
  try {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    });
    if (!session)
      return { ok: false, error: "برای تغییر شماره، دوباره وارد حساب شوید." };
    const { user } = await auth.api.verifyPhoneNumber({
      body: {
        phoneNumber: parsed.data.phone,
        code: parsed.data.code,
        updatePhoneNumber: true,
        disableSession: true,
      },
      headers: requestHeaders,
    });
    await auth.api.getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    });
    return { ok: true, data: await buildUser(user) };
  } catch (error) {
    return authActionError(error);
  }
}
