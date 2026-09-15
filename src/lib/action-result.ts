export const SERVICE_RETRY_SECONDS = 15;
export const SERVICE_UNAVAILABLE_MESSAGE =
  "سرویس سایت موقتاً در دسترس نیست. لطفاً کمی بعد دوباره تلاش کنید.";

export function serviceUnavailable(): Extract<ActionResult, { ok: false }> {
  return {
    ok: false,
    code: "SERVICE_UNAVAILABLE",
    error: SERVICE_UNAVAILABLE_MESSAGE,
    retryAfterSec: SERVICE_RETRY_SECONDS,
  };
}

export function isServiceUnavailable(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as { code?: unknown; body?: { code?: unknown } };
  return (
    value.code === "SERVICE_UNAVAILABLE" || value.body?.code === "SERVICE_UNAVAILABLE"
  );
}

// Safe message extraction for logs — catch bindings are `unknown`, and a bare
// `(err as Error).message` throws on non-Error values.
export function errorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Unknown error";
}

export function requestErrorMessage(): string {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return "اتصال اینترنت دستگاه قطع است. پس از اتصال، دوباره تلاش کنید.";
  }
  return "پاسخ درخواست از سایت دریافت نشد. لطفاً دوباره تلاش کنید؛ اگر مشکل ادامه داشت، با پشتیبانی تماس بگیرید.";
}

// Shared server-action result; error is a ready-to-show Farsi message.
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | {
      ok: false;
      error: string;
      field?: string;
      code?: string;
      retryAfterSec?: number;
    };
