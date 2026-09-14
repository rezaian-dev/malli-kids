import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { getAdminSession, isAdminUser } from "@/lib/auth/admin";
import { getOrderForRequester } from "@/lib/shop/orders";
import { generateInvoicePdf } from "@/lib/shop/invoice";
import { hasVerifiedPayment } from "@/lib/shop/order-status";
import { rateLimit, rateLimitError } from "@/lib/rate-limit";
import {
  isServiceUnavailable,
  serviceUnavailable,
  SERVICE_RETRY_SECONDS,
} from "@/lib/action-result";

// Playwright needs real Node APIs — never the Edge runtime
export const runtime = "nodejs";
export const maxDuration = 30;

const AUTH_ERROR = "برای این کار باید وارد حساب‌تان باشید.";
const NOT_FOUND_ERROR = "سفارش پیدا نشد.";
const UNPAID_ERROR = "فاکتور فقط برای سفارش‌های پرداخت‌شده صادر می‌شود.";
const RATE_ERROR = "تعداد درخواست‌های دانلود فاکتور زیاد بوده؛ کمی بعد دوباره تلاش کنید.";

// Allow only paid orders owned by the customer or accessed by an admin.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const [session, adminSession] = await Promise.all([getSession(), getAdminSession()]);
    const admin =
      adminSession?.user && isAdminUser(adminSession.user) ? adminSession.user : null;

    if (!session?.user && !admin) {
      return NextResponse.json({ error: AUTH_ERROR }, { status: 401 });
    }

    const rateKey = session?.user.id ?? `admin:${admin!.id}`;
    const limited = await rateLimit(`invoice:${rateKey}`, {
      windowMs: 5 * 60_000,
      max: 20,
    });
    if (!limited.ok) {
      return NextResponse.json(rateLimitError(limited, RATE_ERROR), {
        status: limited.reason === "unavailable" ? 503 : 429,
        headers: { "Retry-After": String(limited.retryAfterSec) },
      });
    }

    const order = await getOrderForRequester(id, {
      userId: session?.user.id ?? admin!.id,
      isAdmin: Boolean(admin),
    });
    if (!order) {
      return NextResponse.json({ error: NOT_FOUND_ERROR }, { status: 404 });
    }
    if (!hasVerifiedPayment(order.payment, order.total)) {
      return NextResponse.json({ error: UNPAID_ERROR }, { status: 402 });
    }

    const pdf = await generateInvoicePdf(order);

    return new NextResponse(new Uint8Array(pdf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="invoice-${order.id}.pdf"`,
        // Per-user asset — never cacheable by CDN, proxy, or disk
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    if (isServiceUnavailable(error)) {
      return NextResponse.json(serviceUnavailable(), {
        status: 503,
        headers: { "Retry-After": String(SERVICE_RETRY_SECONDS) },
      });
    }
    throw error;
  }
}
