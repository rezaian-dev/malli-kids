import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import type { OrderDoc } from "@/lib/db/models/order";
import { BRAND } from "@/lib/constants";
import { faDate, formatToman, toFaDigits } from "@/lib/locale/fa";

// 🧾 Historical snapshot — every value off the OrderDoc; never re-prices.
// 🖨️ Playwright, not a PDF lib — only a real engine shapes Persian glyphs

const FONT_PATH = path.join(
  process.cwd(),
  "src/fonts/Vazirmatn-Variable.woff2",
);
const LOGO_PATH = path.join(process.cwd(), "public/brand/logo-white.png");

// ♻️ Cached once per process; embedded as data: URIs so the page never depends on this server reaching itself.
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
  پرداخت‌شده: "پرداخت‌شده",
  "در انتظار": "در انتظار پرداخت",
  ناموفق: "پرداخت ناموفق",
};
const PAY_TONE: Record<OrderDoc["pay"], string> = {
  پرداخت‌شده: "#0f7a4d",
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

function itemRow(item: OrderDoc["items"][number], index: number): string {
  const lineTotal = item.price * item.qty;
  return `
    <tr>
      <td class="td-idx">${toFaDigits(index + 1)}</td>
      <td class="td-name">${escapeHtml(item.name)}</td>
      <td class="td-center">${escapeHtml(item.size)}</td>
      <td class="td-center">${toFaDigits(item.qty)}</td>
      <td class="td-num">${formatToman(item.price)}</td>
      <td class="td-num td-strong">${formatToman(lineTotal)}</td>
    </tr>`;
}

// 🧾 The invoice number is just the order's own permanent id — no second counter to keep in sync.
function renderInvoiceHtml(order: OrderDoc & { createdAt: Date }): string {
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

  .table-wrap {
    margin-top: 22px;
    border: 1px solid #eadfc9;
    border-radius: 14px;
    overflow: hidden;
    background: #fff;
  }
  table.items {
    width: 100%;
    border-collapse: collapse;
    border-spacing: 0;
    table-layout: fixed;
    font-size: 12px;
  }
  table.items col.c-idx { width: 8%; }
  table.items col.c-name { width: 34%; }
  table.items col.c-size { width: 12%; }
  table.items col.c-qty { width: 10%; }
  table.items col.c-unit { width: 18%; }
  table.items col.c-sum { width: 18%; }
  table.items thead th {
    background: linear-gradient(180deg, #f7f1e6 0%, #efe4d0 100%);
    color: #0e2a47;
    font-weight: 800;
    font-size: 11px;
    letter-spacing: .02em;
    padding: 12px 14px;
    border-bottom: 1px solid #e0d4bc;
    white-space: nowrap;
  }
  table.items tbody td {
    padding: 13px 14px;
    border-bottom: 1px solid #f1ece0;
    vertical-align: middle;
  }
  table.items tbody tr:nth-child(even) td { background: #fbf8f2; }
  table.items tbody tr:last-child td { border-bottom: 0; }
  .th-idx, .td-idx { text-align: center; color: #7c8ba0; font-weight: 700; }
  .th-name, .td-name { text-align: right; }
  .td-name { font-weight: 700; }
  .th-center, .td-center { text-align: center; }
  .th-num, .td-num {
    text-align: left;
    direction: ltr;
    font-variant-numeric: tabular-nums;
  }
  .td-strong { font-weight: 800; color: #0e2a47; }

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

    <div class="table-wrap">
      <table class="items">
        <colgroup>
          <col class="c-idx" />
          <col class="c-name" />
          <col class="c-size" />
          <col class="c-qty" />
          <col class="c-unit" />
          <col class="c-sum" />
        </colgroup>
        <thead>
          <tr>
            <th class="th-idx">ردیف</th>
            <th class="th-name">کالا</th>
            <th class="th-center">سایز</th>
            <th class="th-center">تعداد</th>
            <th class="th-num">قیمت واحد</th>
            <th class="th-num">جمع</th>
          </tr>
        </thead>
        <tbody>
          ${order.items.map(itemRow).join("")}
        </tbody>
      </table>
    </div>

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

// 🖨️ Fresh browser per call, not a kept-alive singleton — simpler lifecycle at the cost of ~1s launch overhead.
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
