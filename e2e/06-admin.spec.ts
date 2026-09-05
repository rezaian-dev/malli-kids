import { test, expect, type Browser } from "@playwright/test";
import {
  completeShippingProfile,
  freshUser,
  gotoFirstProduct,
  loginAsAdmin,
  signUp,
  uniqueEmail,
  watchConsole,
} from "./utils";
import path from "node:path";

const TEST_IMAGE = path.join(__dirname, "fixtures", "test-image.png");

test.describe.configure({ mode: "serial" });

/** 🧍 Spins up an isolated customer in their own browser context (so the
 *  admin session in the main `page` is never disturbed) and places one
 *  real COD order. Returns identifying bits the admin-side assertions
 *  need. */
async function createCustomerWithOrder(browser: Browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const user = freshUser("cust");
  await signUp(page, user);
  await completeShippingProfile(page);
  await gotoFirstProduct(page);
  const productName = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  await page.getByRole("button", { name: /ثبت سفارش — پرداخت هنگامِ تحویل/ }).click();
  await page.getByRole("button", { name: /تأیید و ثبتِ سفارش/ }).click();
  const toastText = await page.getByText(/سفارش .* ثبت شد/).textContent({ timeout: 15_000 });
  const orderId = toastText?.match(/سفارش\s+(\S+)\s+ثبت/)?.[1] ?? "";
  await ctx.close();
  return { user, productName, orderId };
}

async function createCustomerWithPendingReview(browser: Browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const user = freshUser("revcust");
  await signUp(page, user);
  await completeShippingProfile(page);
  await gotoFirstProduct(page);
  const productUrl = page.url();
  await page.getByRole("button", { name: /ثبت سفارش — پرداخت هنگامِ تحویل/ }).click();
  await page.getByRole("button", { name: /تأیید و ثبتِ سفارش/ }).click();
  await expect(page.getByText(/سفارش .* ثبت شد/)).toBeVisible({ timeout: 15_000 });
  await page.goto(productUrl);
  const reviewBody = `بازبینی خودکار QA ${Date.now()}`;
  await page.getByRole("tab", { name: "نظر خریداران" }).click();
  await page.getByRole("radio", { name: "4 ستاره" }).click();
  await page.getByLabel("نظرِ شما").fill(reviewBody);
  await page.getByRole("button", { name: "ثبت نظر" }).click();
  await expect(page.getByText(/پس از تأیید ادمین نمایش داده می‌شود/)).toBeVisible({ timeout: 10_000 });
  await ctx.close();
  return { user, reviewBody };
}

async function createCustomerWithTicket(browser: Browser) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const user = freshUser("ticketcust");
  await signUp(page, user);
  const subject = `QA تیکت ${Date.now()}`;
  await page.goto("/profile#support");
  await page.getByRole("button", { name: /تیکت جدید/ }).click();
  await page.getByLabel("موضوع").fill(subject);
  await page.getByLabel("پیام").fill("لطفاً بررسی کنید این تیکت آزمایشی است.");
  await page.getByRole("button", { name: "ثبت تیکت" }).click();
  await expect(page.getByText("تیکت ثبت شد")).toBeVisible({ timeout: 10_000 });
  await ctx.close();
  return { user, subject };
}

// ---------------------------------------------------------------------------

test("a guest hitting an admin page is sent to /admin/login, not shown the page", async ({ page }) => {
  const res = await page.goto("/admin/products");
  expect(res?.status()).toBeLessThan(400);
  await page.waitForURL(/\/admin\/login/);
});

test("a signed-in non-admin hitting /admin is redirected away, not shown the dashboard", async ({ page }) => {
  const user = freshUser("notadmin");
  await signUp(page, user);
  await page.goto("/admin");
  await page.waitForURL((url) => !url.pathname.startsWith("/admin") || url.pathname === "/admin/login");
  await expect(page.getByRole("heading", { name: "داشبورد گالری" })).toHaveCount(0);
});

test("admin login works and the dashboard renders cleanly", async ({ page }) => {
  const guard = watchConsole(page);
  await loginAsAdmin(page);
  await expect(page.getByRole("heading", { name: "داشبورد گالری" })).toBeVisible();
  guard.assertClean("on admin dashboard");
});

test("admin can create, edit and delete a product, each step persisting past reload", async ({ page }) => {
  await loginAsAdmin(page);
  const name = `محصول آزمایشی کیوای ${Date.now()}`;

  await page.goto("/admin/products/new");
  await page.getByLabel("نام محصول").fill(name);
  await page.getByLabel("قیمت (تومان)").fill("250000");
  await page.getByLabel("توضیح", { exact: true }).fill("این یک محصول آزمایشی برای تست خودکار است.");
  await page.locator('input[type="file"]').first().setInputFiles(TEST_IMAGE);
  await expect(page.locator('img[alt="' + name + '"], img[alt="پیش‌نمایش محصول"]')).toBeVisible({
    timeout: 15_000,
  });
  await page.getByRole("button", { name: /ساخت محصول/ }).click();
  await page.waitForURL(/\/admin\/products$/, { timeout: 15_000 });

  // The catalog can hold many products across many pages — search by name
  // (like a real admin would) instead of assuming sort order/pagination
  // puts the new product on the first page.
  async function findCard() {
    await page.getByPlaceholder("نام مدل یا دسته‌بندی…").fill(name);
    const card = page.locator("article", { hasText: name });
    await expect(card).toBeVisible({ timeout: 10_000 });
    return card;
  }

  await expect(await findCard()).toBeVisible();

  await page.reload();
  await (await findCard())
    .getByRole("link", { name: /ویرایش محصول/ })
    .click();
  await page.waitForURL(/\/edit$/);
  await page.getByLabel("قیمت (تومان)").fill("310000");
  await page.getByRole("button", { name: /ذخیره تغییرات/ }).click();
  await page.waitForURL(/\/admin\/products$/, { timeout: 15_000 });

  await page.reload();
  // Re-open the edit form and check the raw (ASCII) field value rather than
  // the formatted Persian-digit display text, which `formatToman` renders
  // with `٬` separators and Persian glyphs.
  await (await findCard())
    .getByRole("link", { name: /ویرایش محصول/ })
    .click();
  await page.waitForURL(/\/edit$/);
  await expect(page.getByLabel("قیمت (تومان)")).toHaveValue("310000");

  // Delete.
  await page.goto("/admin/products");
  const card = await findCard();
  await card.getByRole("button", { name: `حذف ${name}` }).click();
  await page.getByRole("button", { name: "حذف", exact: true }).click();
  await expect(page.getByText("محصول حذف شد")).toBeVisible({ timeout: 10_000 });
  await page.reload();
  await page.getByPlaceholder("نام مدل یا دسته‌بندی…").fill(name);
  await expect(page.getByText(name)).toHaveCount(0);
});

test("admin can toggle a legacy product's stock switch and it persists", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/inventory");
  const toggle = page.locator('[aria-label^="موجودی "]:visible').first();
  await expect(toggle).toBeVisible();
  const before = await toggle.getAttribute("aria-checked");
  await toggle.click();
  await page.waitForTimeout(500);
  await page.reload();
  const after = await page.locator('[aria-label^="موجودی "]:visible').first().getAttribute("aria-checked");
  expect(after).not.toBe(before);
  // Restore original state so this test is repeatable across runs.
  await page.locator('[aria-label^="موجودی "]:visible').first().click();
});

// 🛡️ This dev database already carries the real operator's own admin
// account alongside the pre-existing `admin-bootstrap-test@example.com`
// one — deliberately never driven down to a single admin here (that would
// mean demoting one of those two to test the "last admin" branch, which
// isn't this suite's call to make). The promote/demote round trip is
// exercised for real; the actual last-admin guard itself (`demoteAdminAction`
// / `LAST_ADMIN_ERROR` in `customers/_lib/actions.ts`, and the `isLastAdmin`
// UI branch in `admin-team-landing.tsx`) is verified by code inspection.
test("promoting and demoting a customer round-trips their admin access", async ({ page, browser }) => {
  await loginAsAdmin(page);

  const custCtx = await browser.newContext();
  const custPage = await custCtx.newPage();
  const candidate = freshUser("promo");
  await signUp(custPage, candidate);
  await custCtx.close();

  await page.goto("/admin/team");
  await page.getByPlaceholder("جستجوی نام، ایمیل یا موبایل کاربر…").fill(candidate.email);
  await page.getByRole("button", { name: /ارتقا$/ }).click();
  await expect(page.getByText("دسترسیِ ادمین اعطا شد")).toBeVisible({ timeout: 10_000 });

  await page.reload();
  const promotedCard = page.locator("article", { hasText: candidate.name });
  await expect(promotedCard).toBeVisible();
  await promotedCard.getByRole("button", { name: "تنزل به کاربر عادی" }).click();
  await page.getByRole("button", { name: "تنزل", exact: true }).click();
  await expect(page.getByText("ادمین تنزل یافت")).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(page.locator("article", { hasText: candidate.name })).toHaveCount(0);
});

test("admin can advance an order's status and it persists", async ({ page, browser }) => {
  const { orderId } = await createCustomerWithOrder(browser);
  await loginAsAdmin(page);
  await page.goto("/admin/orders");

  expect(orderId, "order id toast should have been parsed").toBeTruthy();
  // AdminTable renders a mobile-card layout alongside the desktop table
  // (one hidden via CSS per viewport) — `:visible` picks whichever is
  // actually shown at this viewport instead of a hidden duplicate.
  const row = page.locator("span:visible", { hasText: orderId });
  await row.first().click();
  await expect(page.getByRole("heading", { name: "جزئیات سفارش" })).toBeVisible();

  await page.getByRole("combobox", { name: "تغییر وضعیت سفارش" }).click();
  await page.getByRole("option", { name: "در حال آماده‌سازی" }).click();
  await expect(page.locator(":visible", { hasText: "در حال آماده‌سازی" }).first()).toBeVisible();

  await page.keyboard.press("Escape");
  await page.reload();
  await row.first().click();
  await expect(page.getByRole("combobox", { name: "تغییر وضعیت سفارش" })).toContainText(
    "در حال آماده‌سازی",
  );
});

test("admin can create a coupon and it persists", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/coupons");
  const code = `QA${Date.now().toString().slice(-8)}`;

  await page.getByRole("button", { name: "کد جدید" }).click();
  const dialog = page.getByRole("dialog", { name: "کد تخفیف جدید" });
  await dialog.getByLabel("کد", { exact: true }).fill(code);
  await dialog.getByLabel("عنوان").fill("کد آزمایشی QA");
  await dialog.getByLabel("درصد تخفیف").fill("15");
  await dialog.getByLabel("سقف استفاده").fill("50");
  await dialog.getByLabel("انقضا").fill("1409/12/29");
  await dialog.getByRole("button", { name: "ذخیره کد" }).click();
  await expect(page.getByText("کد تخفیف ذخیره شد")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(code)).toBeVisible();

  await page.reload();
  await expect(page.getByText(code)).toBeVisible();
});

test("admin can flip a festive banner's active state and it persists", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/banners");
  const toggle = page.getByRole("switch", { name: /^(فعال|خاموش)$/ }).first();
  await expect(toggle).toBeVisible();
  const before = await toggle.getAttribute("aria-checked");
  await toggle.click();
  await expect(page.getByRole("switch", { name: /^(فعال|خاموش)$/ }).first()).toHaveAttribute(
    "aria-checked",
    before === "true" ? "false" : "true",
    { timeout: 10_000 },
  );
  await page.reload();
  await expect(page.getByRole("switch", { name: /^(فعال|خاموش)$/ }).first()).toHaveAttribute(
    "aria-checked",
    before === "true" ? "false" : "true",
  );
  // Restore.
  await page.getByRole("switch", { name: /^(فعال|خاموش)$/ }).first().click();
});

test("admin can write and publish a new article", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/articles");
  const title = `مقاله آزمایشی QA ${Date.now()}`;

  await page.getByRole("button", { name: "مقاله جدید" }).click();
  await page.getByLabel("عنوان").fill(title);
  await page.getByLabel(/خلاصه/).fill("خلاصهٔ کوتاه برای مقالهٔ آزمایشی.");
  await page.locator('[contenteditable="true"]').first().click();
  await page.keyboard.type("متن کامل مقالهٔ آزمایشی برای تست خودکار.");
  await page.getByRole("button", { name: "ذخیره مقاله" }).click();
  await expect(page.getByText("مقاله ذخیره شد")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText(title)).toBeVisible();

  await page.reload();
  await expect(page.getByText(title)).toBeVisible();
});

test("admin can approve a pending review", async ({ page, browser }) => {
  const { reviewBody } = await createCustomerWithPendingReview(browser);
  await loginAsAdmin(page);
  await page.goto("/admin/reviews");
  await expect(page.getByText(reviewBody)).toBeVisible({ timeout: 10_000 });

  const card = page.locator("article, li", { hasText: reviewBody }).first();
  await card.getByRole("button", { name: /تأیید و انتشار/ }).click();
  await page.waitForTimeout(1000);
  await page.reload();
  // A moderated review no longer shows in the pending queue's default view.
  await expect(page.getByText("در انتظار تأیید").and(page.getByText(reviewBody))).toHaveCount(0);
});

test("admin can reply to a support ticket and the reply persists", async ({ page, browser }) => {
  const { subject } = await createCustomerWithTicket(browser);
  await loginAsAdmin(page);
  await page.goto("/admin/messages");
  await expect(page.getByText(subject)).toBeVisible({ timeout: 10_000 });

  const card = page.locator("article, li", { hasText: subject }).first();
  await card.click();
  await card.getByRole("button", { name: "ثبت پاسخ" }).click();
  await card.getByPlaceholder("پاسخ کامل و شفاف خود را بنویسید…").fill(
    "با سلام، پاسخ آزمایشی تیم پشتیبانی برای این تیکت.",
  );
  await card.getByRole("button", { name: "ارسال پاسخ" }).click();
  await expect(card.getByText("پاسخ داده شده")).toBeVisible({ timeout: 10_000 });

  await page.reload();
  const reloadedCard = page.locator("article, li", { hasText: subject }).first();
  await expect(reloadedCard.getByText("پاسخ داده شده")).toBeVisible();
});
