import { test, expect } from "@playwright/test";
import {
  addCurrentProductToCart,
  completeShippingProfile,
  freshUser,
  gotoFirstProduct,
  logout,
  signUp,
} from "./utils";

// 🔐 The single most important commerce-security property this app makes:
// a cart/wishlist/profile/order is scoped to *one* identity, never "the"
// shared browser slot — see `cartScopeOf` in `storefront-state.ts`. All of
// this runs in ONE browser context (one `page`), deliberately, to simulate
// two people using the same device one after another — the case where a
// bug would actually leak data, unlike two separate Playwright contexts.

test("user B never sees user A's cart, wishlist, profile or orders on a shared browser", async ({
  page,
}) => {
  const a = freshUser("isoA");
  const b = freshUser("isoB");

  // --- User A: build up real private state -------------------------------
  await signUp(page, a);
  await completeShippingProfile(page);
  await gotoFirstProduct(page);
  const productName = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();
  await addCurrentProductToCart(page);
  await page.locator('button[aria-label*="علاقه‌مندی"]').first().click();
  await expect(page.getByText("به علاقه‌مندی‌ها اضافه شد")).toBeVisible();

  await page.getByRole("button", { name: /ثبت سفارش — پرداخت هنگامِ تحویل/ }).click();
  await page.getByRole("button", { name: /تأیید و ثبتِ سفارش/ }).click();
  await expect(page.getByText(/سفارش .* ثبت شد/)).toBeVisible({ timeout: 15_000 });

  await page.goto("/profile#orders");
  await expect(page.getByText(productName)).toBeVisible({ timeout: 10_000 });
  const invoiceHref = await page.getByRole("link", { name: /دانلود فاکتور/ }).getAttribute("href");

  await logout(page);

  // --- User B on the very same browser ------------------------------------
  await signUp(page, b);

  await page.getByRole("button", { name: /سبد خرید \(خالی\)/ })
    .waitFor({ state: "visible" })
    .catch(() => {});
  await page.getByRole("button", { name: /^سبد خرید/ }).click();
  await expect(page.getByRole("dialog").getByText(productName)).toHaveCount(0);
  await page.keyboard.press("Escape");

  await page.goto("/profile#wishlist");
  await expect(page.getByText(productName)).toHaveCount(0);

  await page.goto("/profile");
  await expect(page.getByLabel("آدرس", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("کد پستی")).toHaveValue("");

  await page.goto("/profile#orders");
  await expect(page.getByText(productName)).toHaveCount(0);

  // B's own session cannot fetch A's invoice — server-side ownership check,
  // not merely a UI that hides the link.
  const res = await page.request.get(invoiceHref!);
  expect(res.status()).toBe(404);
});
