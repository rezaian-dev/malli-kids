/** 💬 Client-safe canned-reply vocabulary — the fallback set lives here
 *  (not in `lib/shop/canned-responses`, which is server-only) so client
 *  composers can import it without dragging mongoose into the browser. */

export type CannedResponse = {
  id: string;
  title: string;
  body: string;
};

/** 📦 The fallback set — shown when the collection is empty so composers
 *  are never bare (the manager encourages replacing these with the
 *  team's own voice). */
export const DEFAULT_CANNED_RESPONSES: CannedResponse[] = [
  {
    id: "default-greeting",
    title: "خوش‌آمد",
    body: "سلام، ممنون از پیام شما. چطور می‌تونم کمکتون کنم؟",
  },
  {
    id: "default-order",
    title: "درخواست شماره سفارش",
    body: "برای پیگیری دقیق‌تر، لطفاً شماره سفارش‌تان را ارسال کنید.",
  },
  {
    id: "default-sizing",
    title: "راهنمای سایز",
    body: "قد و وزن کودک‌تان را بفرستید تا بهترین سایز را پیشنهاد بدهم.",
  },
  {
    id: "default-review",
    title: "در حال بررسی",
    body: "موضوع در حال بررسی است و به‌زودی نتیجه را همین‌جا اطلاع می‌دهیم.",
  },
];
