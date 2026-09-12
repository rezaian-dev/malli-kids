// 🎯 Shared server-action result; error is a ready-to-show Farsi message.
export type ActionResult<T = undefined> =
  | ({ ok: true } & (T extends undefined ? object : { data: T }))
  | {
      ok: false;
      error: string;
      field?: string;
      code?: string;
      retryAfterSec?: number;
    };
