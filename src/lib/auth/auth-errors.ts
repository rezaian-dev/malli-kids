import { APIError } from "better-auth";

// 🈯 Better Auth error codes mapped to Farsi; unlisted codes fall back to a
// generic message. Shared by both the storefront (`actions.ts`) and admin
// (`admin-actions.ts`) Better Auth instances — the codes are identical,
// only the session/cookie behind them differs.
export const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

const RATE_LIMIT_ERROR = "تعداد درخواست‌ها زیاد بوده؛ کمی صبر کنید و دوباره تلاش کنید.";

export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  INVALID_EMAIL_OR_PASSWORD: "ایمیل یا رمز عبور اشتباه است.",
  USER_ALREADY_EXISTS: "حسابی با این ایمیل قبلاً ساخته شده — وارد شوید.",
  USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL:
    "حسابی با این ایمیل قبلاً ساخته شده — وارد شوید.",
  PASSWORD_TOO_SHORT: "رمز عبور کوتاه است.",
  PASSWORD_TOO_LONG: "رمز عبور بیش‌ازحد بلند است.",
  INVALID_TOKEN: "لینکِ بازنشانی نامعتبر یا منقضی شده — دوباره درخواست دهید.",
  TOKEN_EXPIRED: "لینکِ بازنشانی منقضی شده — دوباره درخواست دهید.",
  USER_NOT_FOUND: "کاربری با این مشخصات پیدا نشد.",
  BANNED_USER: "دسترسیِ این حساب مسدود شده — برای پیگیری با پشتیبانی تماس بگیرید.",
  // 📱 From the `phoneNumber` plugin (OTP login, phone-based password reset).
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
};

export function authActionError(error: unknown): { ok: false; error: string } {
  if (error instanceof APIError) {
    const code = (error.body as { code?: string })?.code;
    if (code && AUTH_ERROR_MESSAGES[code]) return { ok: false, error: AUTH_ERROR_MESSAGES[code] };
    // 🚦 Better Auth's own rate limiter short-circuits before reaching the
    // endpoint's normal error path, so it may not carry one of the codes
    // above — a bare 429 still deserves a specific message, not the fallback.
    if (error.statusCode === 429) return { ok: false, error: RATE_LIMIT_ERROR };
  }
  if (typeof Response !== "undefined" && error instanceof Response && error.status === 429) {
    return { ok: false, error: RATE_LIMIT_ERROR };
  }
  return { ok: false, error: FALLBACK_ERROR };
}
