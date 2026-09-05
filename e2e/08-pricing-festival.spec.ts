import { test, expect } from "@playwright/test";
import path from "node:path";
import { loginAsAdmin } from "./utils";

const TEST_IMAGE = path.join(__dirname, "fixtures", "test-image.png");

test.describe.configure({ mode: "serial" });

/** 💰 Regression coverage for the festival-overrides-product-discount rule
 *  (`resolvePrice` in `@/lib/shop/pricing`): a live site-wide campaign must
 *  replace a product's own markdown, never stack on top of it, and the
 *  product's own discount must reappear untouched once the campaign ends.
 *  Runs against the PDP (server-authoritative price + display), which is
 *  fed by the same `resolvePrice` call every other surface (cart, checkout,
 *  product cards) uses — see `pricing.ts`'s own doc comment. */
test("festival discount overrides product discount instead of stacking, and reverts when inactive", async ({
  page,
}) => {
  await loginAsAdmin(page);

  // 🧹 Read + restore whatever campaign settings already exist — this test
  // mutates *global* site settings, so it must leave them exactly as found.
  await page.goto("/admin/settings");
  const activeSwitch = page.getByRole("switch");
  const percentInput = page.getByLabel("درصد تخفیف");
  const titleInput = page.getByLabel("عنوان جشنواره");
  const originalActive = (await activeSwitch.getAttribute("aria-checked")) === "true";
  const originalPercent = await percentInput.inputValue();
  const originalTitle = await titleInput.inputValue();

  async function setCampaign(active: boolean, percent: string) {
    await page.goto("/admin/settings");
    const currentlyActive = (await activeSwitch.getAttribute("aria-checked")) === "true";
    if (currentlyActive !== active) await activeSwitch.click();
    await percentInput.fill(percent);
    await page.getByRole("button", { name: /ذخیره تنظیمات/ }).click();
    await expect(page.getByText("تنظیمات ذخیره شد")).toBeVisible({ timeout: 10_000 });
  }

  // 🛍️ A product with its own 20%-off markdown (price 80,000 vs old 100,000).
  const name = `محصول آزمایشی قیمت‌گذاری ${Date.now()}`;
  await page.goto("/admin/products/new");
  await page.getByLabel("نام محصول").fill(name);
  await page.getByLabel("قیمت (تومان)").fill("80000");
  await page.getByLabel("قیمت قبل (اختیاری)").fill("100000");
  await page.getByLabel("توضیح", { exact: true }).fill("محصول آزمایشی برای تست قیمت‌گذاری جشنواره.");
  await page.locator('input[type="file"]').first().setInputFiles(TEST_IMAGE);
  await expect(
    page.locator('img[alt="' + name + '"], img[alt="پیش‌نمایش محصول"]'),
  ).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: /ساخت محصول/ }).click();
  await page.waitForURL(/\/admin\/products$/, { timeout: 15_000 });

  await page.getByPlaceholder("نام مدل یا دسته‌بندی…").fill(name);
  const card = page.locator("article", { hasText: name });
  await expect(card).toBeVisible({ timeout: 10_000 });
  const href = await card.getByRole("link", { name: /ویرایش محصول/ }).getAttribute("href");
  const productId = href?.match(/\/products\/(\d+)\/edit/)?.[1];
  expect(productId).toBeTruthy();

  try {
    // 1️⃣ Festival inactive → the product's own 20% discount shows, alone.
    await setCampaign(false, originalPercent || "20");
    await page.goto(`/product/${productId}`);
    await expect(page.getByText("۲۰٪ تخفیف").first()).toBeVisible();
    await expect(page.getByText("۲۵٪ تخفیف")).toHaveCount(0);

    // 2️⃣ Festival active at 25% → overrides the product's 20%, not stacked
    // (a naive stack would show ~38% off, or a "۲۰٪" badge still present).
    await setCampaign(true, "25");
    await page.goto(`/product/${productId}`);
    await expect(page.getByText("۲۵٪ تخفیف").first()).toBeVisible();
    await expect(page.getByText("۲۰٪ تخفیف")).toHaveCount(0);
    // 75,000 = 25% off the *original* 100,000 — not 25% off the already
    // -discounted 80,000 (which would be 60,000).
    await expect(page.getByText(/۷۵.?۰۰۰/).first()).toBeVisible();
    await expect(page.getByText(/۶۰.?۰۰۰/)).toHaveCount(0);

    // 3️⃣ Festival inactive again → the product's own discount is back,
    // untouched (not a lower number left over from the festival math).
    await setCampaign(false, originalPercent || "20");
    await page.goto(`/product/${productId}`);
    await expect(page.getByText("۲۰٪ تخفیف").first()).toBeVisible();
    await expect(page.getByText("۲۵٪ تخفیف")).toHaveCount(0);
  } finally {
    // 🧹 Restore the real site settings and remove the test product.
    await setCampaign(originalActive, originalPercent);
    await titleInput.fill(originalTitle);
    await page.getByRole("button", { name: /ذخیره تنظیمات/ }).click();
    await expect(page.getByText("تنظیمات ذخیره شد")).toBeVisible({ timeout: 10_000 });

    await page.goto("/admin/products");
    await page.getByPlaceholder("نام مدل یا دسته‌بندی…").fill(name);
    const cleanupCard = page.locator("article", { hasText: name });
    if (await cleanupCard.count()) {
      await cleanupCard.getByRole("button", { name: `حذف ${name}` }).click();
      await page.getByRole("button", { name: "حذف", exact: true }).click();
    }
  }
});
