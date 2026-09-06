import { APIError } from "better-auth";

// 🈯 Better Auth error codes mapped to Farsi; unlisted codes fall back to a
// generic message. Shared by both the storefront (`actions.ts`) and admin
// (`admin-actions.ts`) Better Auth instances — the codes are identical,
// only the session/cookie behind them differs.
export const FALLBACK_ERROR = "خطایی رخ داد؛ کمی بعد دوباره تلاش کنید.";

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
};

export function authActionError(error: unknown): { ok: false; error: string } {
  const code =
    error instanceof APIError ? (error.body as { code?: string })?.code : undefined;
  return { ok: false, error: (code && AUTH_ERROR_MESSAGES[code]) || FALLBACK_ERROR };
}
