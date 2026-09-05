// 💬 Lives here (not in the server-only lib/shop/canned-responses) so client composers can import it freely.

export type CannedResponse = {
  id: string;
  title: string;
  body: string;
};

// 📦 Shown only when the collection is empty, so composers are never bare.
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
