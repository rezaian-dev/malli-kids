"use server";

import { headers } from "next/headers";
import type { ZodType } from "zod";
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

type AuthFailure = Extract<ActionResult, { ok: false }>;

async function validatedAction<Input, Result extends ActionResult>(
  schema: ZodType<Input>,
  values: unknown,
  run: (input: Input) => Promise<Result>,
): Promise<Result | AuthFailure> {
  const parsed = schema.safeParse(values);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    return {
      ok: false,
      error: issue?.message ?? FALLBACK_ERROR,
      field: String(issue?.path[0] ?? "root"),
    };
  }
  try {
    return await run(parsed.data);
  } catch (error) {
    return authActionError(error);
  }
}

async function findUserByPhone(phone: string) {
  const { adapter } = await auth.$context;
  return adapter.findOne({
    model: "user",
    where: [{ field: "phoneNumber", value: phone }],
  });
}

export async function signInAction(values: SignInValues): Promise<ActionResult<User>> {
  return validatedAction(signInSchema, values, async (body) => {
    const { user } = await auth.api.signInEmail({ body, headers: await headers() });
    return { ok: true, data: await buildUser(user) };
  });
}

// Create the account only after verifying phone ownership.
export async function requestSignUpOtpAction(
  values: SignUpValues,
): Promise<ActionResult> {
  return validatedAction(signUpSchema, values, async ({ phone, email }) => {
    if (await findUserByPhone(phone)) {
      return {
        ok: false,
        error: "این شماره قبلاً ثبت شده؛ از بخش ورود استفاده کنید.",
        field: "phone",
      };
    }
    const { internalAdapter } = await auth.$context;
    if (await internalAdapter.findUserByEmail(email.toLowerCase())) {
      return {
        ok: false,
        error: "حسابی با این ایمیل قبلاً ساخته شده؛ وارد شوید.",
        field: "email",
      };
    }
    return requestOtpAction({ phone });
  });
}

export async function signUpAction(
  values: CompleteSignUpValues,
): Promise<ActionResult<User>> {
  return validatedAction(
    completeSignUpSchema,
    values,
    async ({ phone, ...registration }) => {
      const { user } = await auth.api.signUpEmail({
        body: { ...registration, phoneNumber: phone },
        headers: await headers(),
      });
      return { ok: true, data: await buildUser(user) };
    },
  );
}

export async function signOutAction(): Promise<ActionResult> {
  try {
    await auth.api.signOut({ headers: await headers() });
    return { ok: true };
  } catch (error) {
    return authActionError(error);
  }
}

// Acknowledge unknown numbers without revealing account existence.
export async function forgotPasswordAction(
  values: ForgotPasswordValues,
): Promise<ActionResult> {
  return validatedAction(forgotPasswordSchema, values, async ({ phone }) => {
    await auth.api.requestPasswordResetPhoneNumber({
      body: { phoneNumber: phone },
      headers: await headers(),
    });
    return { ok: true };
  });
}

export async function requestOtpAction(values: OtpRequestValues): Promise<ActionResult> {
  return validatedAction(otpRequestSchema, values, async ({ phone }) => {
    await auth.api.sendPhoneNumberOTP({
      body: { phoneNumber: phone },
      headers: await headers(),
    });
    return { ok: true };
  });
}

export async function verifyOtpAction(
  values: OtpVerifyValues & { phone: string },
): Promise<ActionResult<User>> {
  return validatedAction(verifyPhoneSchema, values, async ({ phone, code }) => {
    const { user } = await auth.api.verifyPhoneNumber({
      body: { phoneNumber: phone, code },
      headers: await headers(),
    });
    return { ok: true, data: await buildUser(user) };
  });
}

export async function resetPasswordAction(
  values: ResetPasswordValues & { phone: string },
): Promise<ActionResult> {
  return validatedAction(
    resetPasswordWithPhoneSchema,
    values,
    async ({ phone, code, password }) => {
      await auth.api.resetPasswordPhoneNumber({
        body: { phoneNumber: phone, otp: code, newPassword: password },
        headers: await headers(),
      });
      return { ok: true };
    },
  );
}

export async function requestRecoveryPhoneAction(
  values: OtpRequestValues,
): Promise<ActionResult> {
  return validatedAction(otpRequestSchema, values, async ({ phone }) => {
    const session = await auth.api.getSession({
      headers: await headers(),
      query: { disableCookieCache: true },
    });
    if (!session) return { ok: false, error: "برای تغییر شماره، دوباره وارد حساب شوید." };
    if (session.user.phoneNumberVerified && session.user.phoneNumber === phone) {
      return { ok: false, error: "این شماره از قبل تأیید شده است.", field: "phone" };
    }
    if (await findUserByPhone(phone)) {
      return { ok: false, error: "این شماره به حسابی دیگر متصل است.", field: "phone" };
    }
    return requestOtpAction({ phone });
  });
}

export async function verifyRecoveryPhoneAction(
  values: OtpVerifyValues & { phone: string },
): Promise<ActionResult<User>> {
  return validatedAction(verifyPhoneSchema, values, async ({ phone, code }) => {
    const requestHeaders = await headers();
    const session = await auth.api.getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    });
    if (!session) return { ok: false, error: "برای تغییر شماره، دوباره وارد حساب شوید." };
    const { user } = await auth.api.verifyPhoneNumber({
      body: { phoneNumber: phone, code, updatePhoneNumber: true, disableSession: true },
      headers: requestHeaders,
    });
    // Refresh the session after changing the verified number.
    await auth.api.getSession({
      headers: requestHeaders,
      query: { disableCookieCache: true },
    });
    return { ok: true, data: await buildUser(user) };
  });
}
