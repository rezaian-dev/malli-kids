import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import type { OrderDoc } from "@/lib/db/models/order";
import { BRAND } from "@/lib/constants";
import { faDate, formatToman, toFaDigits } from "@/lib/locale/fa";

// 🧾 Renders a paid order's real, already-stored data into a premium,
// Persian/RTL invoice PDF — server-side only (`server-only` guards this
// from ever landing in a client bundle; Playwright itself needs Node APIs
// a browser doesn't have anyway).
//
// 🕰️ Historical snapshot, not a live lookup: every value below comes
// straight off the `OrderDoc` passed in (`items[].price`, `subtotal`,
// `discount`, `shipping`, `total`) — the exact numbers `createOrder` wrote
// the moment the order was placed. This module never imports
// `@/lib/shop/products` and never re-prices anything, so a product's price
// changing later can't retroactively change an old invoice: the order
// document already *is* the historical record.
//
// 🖨️ Why a headless browser (Playwright, already a project dependency —
// see the audit/testing use elsewhere) instead of a dedicated PDF-drawing
// library (pdfkit, @react-pdf/renderer, pdfmake, …): every one of those
// builds its own text layout from scratch and — verified, not assumed —
// none of them run real Arabic/Persian glyph shaping (the letter-joining
// this app's own `address-map-field.tsx` comments already flag as a
// recurring pitfall), so Persian text comes out as isolated, unconnected
// letterforms instead of properly joined script. A real browser engine
// already shapes and lays out this exact font/script correctly — it's
// what renders every Persian page on this site — so reusing it via
// `page.pdf()` is the one approach that's *actually* premium/elegant
// Persian typography instead of merely printable Persian text. The
// trade-off is honest: a browser launch is heavier per-request than a
// pure library call, which is why the route calling this rate-limits it
// (see `src/app/api/orders/[id]/invoice/route.ts`) — an on-demand,
// low-frequency "download my invoice" click can afford it; a hot path
// couldn't.

const FONT_PATH = path.join(process.cwd(), "src/fonts/Vazirmatn-Variable.woff2");
const LOGO_PATH = path.join(process.cwd(), "public/brand/logo-white.png");

// ♻️ Read + base64-encode once per server process, not once per invoice —
// both files are small (a couple hundred KB together) and never change
// without a redeploy. Embedding them as data: URIs (rather than pointing
// the HTML at an http(s) URL) makes the rendered page fully self-contained:
// no dependency on this server being reachable *from itself* over the
// network, no localhost/port/base-URL guessing, and identical output
// whether this runs on a dev machine, behind a proxy, or in a container.
let fontDataUri: string | null = null;
function getFontDataUri(): string {
  if (!fontDataUri) {
    fontDataUri = `data:font/woff2;base64,${readFileSync(FONT_PATH).toString("base64")}`;
  }
  return fontDataUri;
}

let logoDataUri: string | null = null;
function getLogoDataUri(): string {
  if (!logoDataUri) {
    logoDataUri = `data:image/png;base64,${readFileSync(LOGO_PATH).toString("base64")}`;
  }
  return logoDataUri;
}

const PAY_LABEL: Record<OrderDoc["pay"], string> = {
  "پرداخت‌شده": "پرداخت‌شده",
  "در انتظار": "در انتظار پرداخت",
  ناموفق: "پرداخت ناموفق",
};
const PAY_TONE: Record<OrderDoc["pay"], string> = {
  "پرداخت‌شده": "#0f7a4d",
  "در انتظار": "#b8893f",
  ناموفق: "#c22b4d",
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function itemRow(item: OrderDoc["items"][number]): string {
  const lineTotal = item.price * item.qty;
  return `
    <tr>
      <td class="cell name">${escapeHtml(item.name)}</td>
      <td class="cell center">${escapeHtml(item.size)}</td>
      <td class="cell center">${toFaDigits(item.qty)}</td>
      <td class="cell num">${formatToman(item.price)}</td>
      <td class="cell num strong">${formatToman(lineTotal)}</td>
    </tr>`;
}

/** 🧾 The invoice number is just the order's own permanent `id` (e.g.
 *  "MK-ABCDE") — already unique, already immutable, already what the
 *  customer knows this order as. Deriving a second counter/id for
 *  "invoice number" would be one more thing to keep in sync for zero real
 *  benefit; this way it's stable by construction (same input, same output,
 *  every time — including across repeated downloads/refreshes). */
export function renderInvoiceHtml(order: OrderDoc & { createdAt: Date }): string {
  const font = getFontDataUri();
  const logo = getLogoDataUri();
  const payTone = PAY_TONE[order.pay];

  return `<!doctype html>
<html lang="fa-IR" dir="rtl">
<head>
<meta charset="utf-8" />
<style>
  @font-face {
    font-family: "Vazirmatn";
    src: url("${font}") format("woff2");
    font-weight: 100 900;
    font-display: block;
  }
  * { box-sizing: border-box; }
  html, body {
    margin: 0;
    padding: 0;
    font-family: "Vazirmatn", "Tahoma", sans-serif;
    color: #0e2a47;
    background: #fff;
    font-size: 13px;
    line-height: 1.7;
  }
  .page { padding: 30px 36px 22px; }
  .head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #0e2a47, #16385a);
    color: #fff8ec;
    border-radius: 18px;
    padding: 20px 26px;
  }
  .brand { display: flex; align-items: center; gap: 14px; }
  .brand img { height: 34px; width: auto; display: block; }
  .brand-name { font-weight: 900; font-size: 16px; letter-spacing: .02em; }
  .brand-sub { font-size: 10px; color: #d9b77f; font-weight: 700; margin-top: 2px; }
  .head-meta { text-align: left; font-size: 11px; color: #f3ecdf; }
  .head-meta b { color: #fff8ec; font-size: 13px; }
  .head-meta .muted { color: #cbd6e2; }

  .grid2 {
    display: flex;
    gap: 16px;
    margin-top: 20px;
  }
  .card {
    flex: 1;
    border: 1px solid #eadfc9;
    border-radius: 14px;
    padding: 14px 18px;
  }
  .card h3 {
    margin: 0 0 8px;
    font-size: 10px;
    font-weight: 900;
    letter-spacing: .08em;
    color: #b8893f;
    text-transform: uppercase;
  }
  .card p { margin: 2px 0; font-size: 12px; }
  .card .strong { font-weight: 900; color: #0e2a47; }

  table.items {
    width: 100%;
    border-collapse: collapse;
    margin-top: 22px;
    font-size: 12px;
  }
  table.items thead th {
    background: #f3ecdf;
    color: #0e2a47;
    font-weight: 900;
    font-size: 10.5px;
    padding: 10px 12px;
    text-align: right;
  }
  table.items thead th:first-child { border-radius: 10px 0 0 10px; }
  table.items thead th:last-child { border-radius: 0 10px 10px 0; }
  .cell { padding: 10px 12px; border-bottom: 1px solid #f1ece0; }
  .cell.name { font-weight: 700; }
  .cell.center { text-align: center; }
  .cell.num { text-align: left; direction: ltr; font-variant-numeric: tabular-nums; }
  .cell.strong { font-weight: 900; color: #0e2a47; }

  .totals {
    margin-top: 18px;
    margin-inline-start: auto;
    width: 280px;
  }
  .totals .row {
    display: flex;
    justify-content: space-between;
    padding: 6px 4px;
    font-size: 12px;
    color: #35506e;
  }
  .totals .row.grand {
    margin-top: 6px;
    padding: 12px 14px;
    border-radius: 12px;
    background: #0e2a47;
    color: #fff8ec;
    font-weight: 900;
    font-size: 14px;
  }
  .totals .row .num { direction: ltr; font-variant-numeric: tabular-nums; }

  .status-bar {
    margin-top: 18px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border: 1px solid #eadfc9;
    border-radius: 12px;
    padding: 10px 16px;
    font-size: 11px;
  }
  .status-pill {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-weight: 900;
    color: ${payTone};
  }
  .status-pill .dot {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${payTone};
  }

  .foot {
    margin-top: 26px;
    padding-top: 14px;
    border-top: 1px dashed #eadfc9;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #7c8ba0;
  }

  @media print {
    .page { padding: 12mm 14mm; }
  }
</style>
</head>
<body>
  <div class="page">
    <div class="head">
      <div class="brand">
        <img src="${logo}" alt="" />
        <div>
          <div class="brand-name">${escapeHtml(BRAND.nameFa)} · ${escapeHtml(BRAND.nameEn)}</div>
          <div class="brand-sub">${escapeHtml(BRAND.address)}</div>
        </div>
      </div>
      <div class="head-meta">
        <div><span class="muted">شمارهٔ فاکتور: </span><b dir="ltr">${escapeHtml(order.id)}</b></div>
        <div><span class="muted">تاریخ سفارش: </span><b>${faDate(order.createdAt)}</b></div>
      </div>
    </div>

    <div class="grid2">
      <div class="card">
        <h3>مشخصات خریدار</h3>
        <p class="strong">${escapeHtml(order.customer)}</p>
        <p dir="ltr" style="text-align:right">${escapeHtml(order.phone)}</p>
      </div>
      <div class="card">
        <h3>آدرس تحویل</h3>
        <p>${escapeHtml(order.city)}</p>
        <p>${escapeHtml(order.address)}</p>
        <p>کد پستی: <span dir="ltr">${escapeHtml(order.postalCode)}</span></p>
      </div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>کالا</th>
          <th>سایز</th>
          <th>تعداد</th>
          <th>قیمت واحد</th>
          <th>جمع</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map(itemRow).join("")}
      </tbody>
    </table>

    <div class="totals">
      <div class="row"><span>جمع کالاها</span><span class="num">${formatToman(order.subtotal)} تومان</span></div>
      ${
        order.discount
          ? `<div class="row"><span>تخفیف${order.couponCode ? ` (${escapeHtml(order.couponCode)})` : ""}</span><span class="num">− ${formatToman(order.discount)} تومان</span></div>`
          : ""
      }
      <div class="row"><span>هزینهٔ ارسال</span><span class="num">${order.shipping ? `${formatToman(order.shipping)} تومان` : "رایگان"}</span></div>
      <div class="row grand"><span>مبلغ نهایی</span><span class="num">${formatToman(order.total)} تومان</span></div>
    </div>

    <div class="status-bar">
      <span class="status-pill"><span class="dot"></span>وضعیتِ پرداخت: ${PAY_LABEL[order.pay]}</span>
      <span>وضعیتِ سفارش: ${escapeHtml(order.status)}</span>
    </div>

    <div class="foot">
      <span>${escapeHtml(BRAND.nameFa)} — ${escapeHtml(BRAND.phoneFa)}</span>
      <span>این سند به‌صورت خودکار صادر شده و نیازی به مهر و امضا ندارد.</span>
    </div>
  </div>
</body>
</html>`;
}

/** 🖨️ HTML → PDF via a real (headless) browser engine — see the module
 *  comment above for why. A fresh browser per call, not a kept-alive
 *  singleton: simpler lifecycle (nothing to recover if a prior render
 *  crashed the process, nothing running idle between the rare requests
 *  this route actually gets), at the cost of a real ~1s launch overhead
 *  per invoice — an accepted trade for an on-demand download button, not
 *  a hot path. */
export async function generateInvoicePdf(
  order: OrderDoc & { createdAt: Date },
): Promise<Buffer> {
  const html = renderInvoiceHtml(order);
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle" });
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: { top: "0", bottom: "0", left: "0", right: "0" },
    });
    return pdf;
  } finally {
    await browser.close();
  }
}
