import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminSession, isAdminUser } from "@/lib/auth/admin";
import { getOrderForRequester } from "@/lib/shop/orders";
import { generateInvoicePdf } from "@/lib/shop/invoice";
import { rateLimit } from "@/lib/rate-limit";

// 🖨️ Playwright needs real Node APIs — never the Edge runtime
export const runtime = "nodejs";
export const maxDuration = 30;

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const NOT_FOUND_ERROR = "سفارش پیدا نشد.";
const UNPAID_ERROR = "فاکتور فقط برای سفارش‌های پرداخت‌شده صادر می‌شود.";
const RATE_ERROR = "تعداد درخواست‌های دانلود فاکتور زیاد بوده؛ کمی بعد دوباره تلاش کنید.";

// 🧾 The one PDF invoice download path.
// 🔐 Ownership off the real session — null for missing or not-yours; admin is the one exception.
// 🛡️ Storefront and admin sessions are checked independently (they're
// fully separate cookies, see admin-auth.ts) — either one alone is enough.
// 💳 Paid orders only, whatever the client claims.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const [session, adminSession] = await Promise.all([
    getSession(),
    getAdminSession(),
  ]);
  const admin =
    adminSession?.user && isAdminUser(adminSession.user) ? adminSession.user : null;

  if (!session?.user && !admin) {
    return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
  }

  const rateKey = session?.user.id ?? `admin:${admin!.id}`;
  const limited = rateLimit(`invoice:${rateKey}`, {
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
    userId: session?.user.id ?? admin!.id,
    isAdmin: Boolean(admin),
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
      // 🔒 Per-user asset — never cacheable by CDN, proxy, or disk
      "Cache-Control": "private, no-store",
    },
  });
}
