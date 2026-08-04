import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { isAdminUser } from "@/lib/auth/admin";
import { getOrderForRequester } from "@/lib/shop/orders";
import { generateInvoicePdf } from "@/lib/shop/invoice";
import { rateLimit } from "@/lib/rate-limit";

// 🖨️ Playwright needs real Node APIs (child process, filesystem) — never
// runs on the Edge runtime.
export const runtime = "nodejs";
export const maxDuration = 30;

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const NOT_FOUND_ERROR = "سفارش پیدا نشد.";
const UNPAID_ERROR = "فاکتور فقط برای سفارش‌های پرداخت‌شده صادر می‌شود.";
const RATE_ERROR = "تعداد درخواست‌های دانلود فاکتور زیاد بوده؛ کمی بعد دوباره تلاش کنید.";

/** 🧾 GET /api/orders/[id]/invoice — the one real download path for an
 *  order's PDF invoice.
 *
 *  🔐 Ownership is enforced *here*, server-side, off the real session —
 *  never off anything the client sends. `getOrderForRequester` returns
 *  `null` for both "no such order" and "exists but isn't this caller's"
 *  so a guessed/shared id can't be used to probe which order ids are real;
 *  an admin session is the one exception (same "see any order" access the
 *  rest of `/admin/orders` already has).
 *
 *  💳 Gated on the order's own `pay` field — never generated for an order
 *  that isn't `"پرداخت‌شده"` yet, regardless of how confident the client is
 *  that it should be. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
  }

  const limited = rateLimit(`invoice:${session.user.id}`, {
    windowMs: 5 * 60_000,
    max: 20,
  });
  if (!limited.ok) {
    return NextResponse.json(
      { error: RATE_ERROR },
      { status: 429, headers: { "Retry-After": String(limited.retryAfterSec) } },
    );
  }

  const order = await getOrderForRequester(id, {
    userId: session.user.id,
    isAdmin: isAdminUser(session.user),
  });
  if (!order) {
    return NextResponse.json({ error: NOT_FOUND_ERROR }, { status: 404 });
  }
  if (order.pay !== "پرداخت‌شده") {
    return NextResponse.json({ error: UNPAID_ERROR }, { status: 402 });
  }

  const pdf = await generateInvoicePdf(order);

  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="invoice-${order.id}.pdf"`,
      // 🔒 A signed-in user's own invoice, not a public asset — never let a
      // shared cache (CDN, proxy) or the browser's disk cache store a copy
      // some other visitor's request could later be served.
      "Cache-Control": "private, no-store",
    },
  });
}
