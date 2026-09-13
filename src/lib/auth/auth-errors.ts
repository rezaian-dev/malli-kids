import { APIError } from "better-auth";
import {
  isServiceUnavailable,
  serviceUnavailable,
  type ActionResult,
} from "@/lib/action-result";

// Map known authentication errors; hide unknown provider details.
export const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

const RATE_LIMIT_ERROR = "تعداد درخواست‌ها زیاد بوده؛ کمی صبر کنید و دوباره تلاش کنید.";

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "ایمیل یا رمز عبور اشتباه است.",
  INVALID_EMAIL: "ایمیل را کامل و صحیح وارد کنید.",
  INVALID_PASSWORD: "رمز عبور معتبر نیست.",
  USER_ALREADY_EXISTS: "حسابی با این ایمیل قبلاً ساخته شده — وارد شوید.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "حسابی با این ایمیل قبلاً ساخته شده — وارد شوید.",
  PASSWORD_TOO_SHORT: "رمز عبور کوتاه است.",
  PASSWORD_TOO_LONG: "رمز عبور بیش‌ازحد بلند است.",
  INVALID_TOKEN: "لینکِ بازنشانی نامعتبر یا منقضی شده — دوباره درخواست دهید.",
  TOKEN_EXPIRED: "لینکِ بازنشانی منقضی شده — دوباره درخواست دهید.",
  USER_NOT_FOUND: "کاربری با این مشخصات پیدا نشد.",
  BANNED_USER: "دسترسیِ این حساب مسدود شده — برای پیگیری با پشتیبانی تماس بگیرید.",
  // From the `phoneNumber` plugin (OTP login, phone-based password reset).
  INVALID_PHONE_NUMBER: "شمارهٔ موبایل معتبر نیست.",
  PHONE_NUMBER_EXIST: "این شماره قبلاً به حسابی دیگر متصل است.",
  PHONE_NUMBER_NOT_EXIST: "حسابی با این شماره پیدا نشد.",
  INVALID_PHONE_NUMBER_OR_PASSWORD: "شماره یا رمز عبور اشتباه است.",
  OTP_NOT_FOUND: "کدی برای این شماره درخواست نشده — دوباره کد بگیرید.",
  OTP_EXPIRED: "کد منقضی شده — دوباره درخواست دهید.",
  INVALID_OTP: "کد واردشده اشتباه است.",
  TOO_MANY_ATTEMPTS: "تعداد تلاش‌ها زیاد بود — دوباره کد بگیرید.",
  PHONE_NUMBER_NOT_VERIFIED: "این شماره هنوز تأیید نشده.",
  SEND_OTP_NOT_IMPLEMENTED: FALLBACK_ERROR,
  SMS_DELIVERY_FAILED: "ارسال پیامک انجام نشد؛ کمی بعد دوباره تلاش کنید.",
  SMS_COOLDOWN: "برای ارسال دوبارهٔ کد کمی صبر کنید.",
  PHONE_NUMBER_CANNOT_BE_UPDATED: "شمارهٔ بازیابی را فقط با کد پیامکی تغییر دهید.",
};

const ERROR_FIELDS: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "password",
  INVALID_EMAIL: "email",
  INVALID_PASSWORD: "password",
  USER_ALREADY_EXISTS: "email",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL: "email",
  PASSWORD_TOO_SHORT: "password",
  PASSWORD_TOO_LONG: "password",
  INVALID_PHONE_NUMBER: "phone",
  PHONE_NUMBER_EXIST: "phone",
  PHONE_NUMBER_NOT_VERIFIED: "phone",
  OTP_NOT_FOUND: "code",
  OTP_EXPIRED: "code",
  INVALID_OTP: "code",
  TOO_MANY_ATTEMPTS: "code",
};

export function authActionError(error: unknown): Extract<ActionResult, { ok: false }> {
  if (isServiceUnavailable(error)) return serviceUnavailable();
  if (error instanceof APIError) {
    const body = error.body as {
      code?: string;
      message?: string;
      field?: string;
      retryAfterSec?: number;
    };
    const code = body?.code;
    if (code === "INVALID_AUTH_INPUT")
      return {
        ok: false,
        error: body.message ?? FALLBACK_ERROR,
        field: body.field,
        code,
      };
    if (code && AUTH_ERROR_MESSAGES[code])
      return {
        ok: false,
        error: AUTH_ERROR_MESSAGES[code],
        code,
        field: ERROR_FIELDS[code],
        retryAfterSec: body.retryAfterSec,
      };
    if (error.statusCode === 429) return { ok: false, error: RATE_LIMIT_ERROR };
    if (error.statusCode >= 500) return serviceUnavailable();
  }
  if (typeof Response !== "undefined" && error instanceof Response) {
    if (error.status === 429) return { ok: false, error: RATE_LIMIT_ERROR };
    if (error.status >= 500) return serviceUnavailable();
  }
  return { ok: false, error: FALLBACK_ERROR };
}
