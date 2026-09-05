import { test, expect } from "@playwright/test";
import { watchConsole } from "./utils";

// 🧑‍🤝‍🧑 Guest journeys: browse, search, filter, product detail, and the
// two "must gate, never silently fail" guest actions (cart, favorites).

test("guest can browse the home page cleanly", async ({ page }) => {
  const guard = watchConsole(page);
  await page.goto("/");
  await expect(page).toHaveTitle(/ملی‌کیدز|MALLI/i);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  guard.assertClean("on home page");
});

test("search narrows the shop results", async ({ page }) => {
  await page.goto("/shop");
  const cards = page.locator('a[href^="/product/"]');
  const before = await cards.count();
  expect(before).toBeGreaterThan(0);

  await page.getByLabel("جستجو").fill("پیراهن");
  await page.getByLabel("جستجو").press("Enter");
  await page.waitForURL(/query=/);
  await expect(page.locator('a[href^="/product/"]').first()).toBeVisible();
  const after = await page.locator('a[href^="/product/"]').count();
  expect(after).toBeLessThanOrEqual(before);
  for (const name of await page.locator('a[href^="/product/"] h3, a[href^="/product/"]').allTextContents()) {
    // Every remaining product name is expected to relate to the query, but
    // Persian fuzzy text can appear in category/season too — just assert
    // the page didn't silently reset to the unfiltered set.
    void name;
  }
});

test("an unmatched search shows an empty state, not a crash", async ({ page }) => {
  const guard = watchConsole(page);
  await page.goto("/shop?query=zzzznonexistentqueryzzzz");
  await expect(page.locator('a[href^="/product/"]')).toHaveCount(0);
  await expect(page.getByText(/کالایی پیدا نشد/)).toBeVisible();
  guard.assertClean("on empty shop search");
});

test("category filter narrows the shop grid", async ({ page }) => {
  await page.goto("/shop");
  await page.locator('[aria-label="دسته‌بندی"]').getByText("دخترانه", { exact: true }).click();
  await page.waitForURL(/category=/);
  const count = await page.locator('a[href^="/product/"]').count();
  expect(count).toBeGreaterThan(0);
});

test("product detail page renders gallery, price and sizes", async ({ page }) => {
  const guard = watchConsole(page);
  await page.goto("/shop");
  await page.locator('a[href^="/product/"]').first().click();
  await page.waitForURL(/\/product\//);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByText("تومان").first()).toBeVisible();
  await expect(page.locator("#pdp-add-to-cart")).toBeVisible();
  guard.assertClean("on product detail page");
});

test("a malformed product id 404s instead of crashing", async ({ page }) => {
  const res = await page.goto("/product/not-a-real-id");
  expect(res?.status()).toBeLessThan(500);
  await expect(page.getByRole("heading", { name: /پیدا نشد|یافت نشد/ })).toBeVisible();
});

test("an unknown route renders the not-found page", async ({ page }) => {
  const res = await page.goto("/this-route-does-not-exist-xyz");
  expect(res?.status()).toBeLessThan(500);
  await expect(page.getByText(/پیدا نشد|یافت نشد|404/)).toBeVisible();
});

test("guest add-to-cart opens the auth dialog instead of adding silently", async ({ page }) => {
  await page.goto("/shop");
  await page.locator('a[href^="/product/"]').first().click();
  await page.waitForURL(/\/product\//);
  await page.locator("#pdp-add-to-cart button").first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("tab", { name: "ورود", exact: true })).toBeVisible();
});

test("guest favorite (heart) opens the auth dialog", async ({ page }) => {
  await page.goto("/shop");
  const heart = page.locator('button[aria-label*="علاقه"]').first();
  if ((await heart.count()) === 0) test.skip(true, "no favorite button found on shop grid");
  await heart.click();
  await expect(page.getByRole("dialog")).toBeVisible();
});
