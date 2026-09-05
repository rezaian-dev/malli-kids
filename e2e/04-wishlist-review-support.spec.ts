import { test, expect } from "@playwright/test";
import { completeShippingProfile, freshUser, gotoFirstProduct, signUp } from "./utils";

// 💛 The heart/favorite toggle only exists on the shop grid's product
// cards (`FavButton` inside `product-card-grid.tsx`/`product-card-list.tsx`)
// — the PDP itself has no favorite button of its own, so these tests
// favorite from `/shop`, not from a product's own detail page.
async function favoriteFirstShopCard(page: import("@playwright/test").Page) {
  await page.goto("/shop");
  const heart = page.locator('button[aria-label*="علاقه‌مندی"]').first();
  // The button's own aria-label carries the product name verbatim
  // (`افزودنِ «name» به علاقه‌مندی‌ها`) — more robust than scraping the
  // card's rendered text, which mixes in price/rating with no separators.
  const label = (await heart.getAttribute("aria-label"))!;
  const productName = label.match(/«(.+)»/)![1];
  await heart.click();
  return productName;
}

test("favorite toggled on a product persists to the wishlist tab and a reload", async ({ page }) => {
  const user = freshUser("wishlist");
  await signUp(page, user);
  const productName = await favoriteFirstShopCard(page);
  await expect(page.getByText("به علاقه‌مندی‌ها اضافه شد")).toBeVisible();
  // The toggle's own success toast fires optimistically, before the server
  // action that actually persists it resolves (see `toggleFavorite` in
  // `store-provider.tsx`) — give that fire-and-forget request a moment to
  // land before the next step does a hard navigation (`page.goto`, unlike
  // an in-app `<Link>`, doesn't wait for in-flight requests).
  await page.waitForTimeout(1000);

  await page.goto("/profile#wishlist");
  await expect(page.getByText(productName, { exact: false })).toBeVisible({ timeout: 10_000 });

  await page.reload();
  await expect(page.getByText(productName, { exact: false })).toBeVisible({ timeout: 10_000 });
});

test("un-favoriting removes the product from the wishlist after reload", async ({ page }) => {
  const user = freshUser("unwishlist");
  await signUp(page, user);
  const productName = await favoriteFirstShopCard(page);
  await expect(page.getByText("به علاقه‌مندی‌ها اضافه شد")).toBeVisible();
  await page.locator('button[aria-label*="علاقه‌مندی"]').first().click();
  await expect(page.getByText("از علاقه‌مندی‌ها حذف شد")).toBeVisible();

  await page.goto("/profile#wishlist");
  await page.reload();
  await expect(page.getByText(productName, { exact: false })).toHaveCount(0);
});

test("a shopper who purchased a product can leave a review, which starts pending", async ({ page }) => {
  const user = freshUser("review");
  await signUp(page, user);
  await completeShippingProfile(page);
  await gotoFirstProduct(page);
  const url = page.url();

  await page.getByRole("button", { name: /ثبت سفارش — پرداخت هنگامِ تحویل/ }).click();
  await page.getByRole("button", { name: /تأیید و ثبتِ سفارش/ }).click();
  await expect(page.getByText(/سفارش .* ثبت شد/)).toBeVisible({ timeout: 15_000 });

  await page.goto(url);
  // Reviews live under their own tab, not on the default "معرفی" pane.
  await page.getByRole("tab", { name: "نظر خریداران" }).click();
  await expect(page.getByText("ثبت نظر فقط پس از خرید و ورود ممکن است")).toHaveCount(0);

  await page.getByRole("radio", { name: "5 ستاره" }).click();
  await page.getByLabel("نظرِ شما").fill("کیفیت دوخت و پارچه عالی بود، خیلی راضی هستم.");
  await page.getByRole("button", { name: "ثبت نظر" }).click();
  await expect(page.getByText(/پس از تأیید ادمین نمایش داده می‌شود/)).toBeVisible({ timeout: 10_000 });
});

test("a shopper who has not purchased a product cannot submit a review", async ({ page }) => {
  const user = freshUser("noreview");
  await signUp(page, user);
  await gotoFirstProduct(page);
  await page.getByRole("tab", { name: "نظر خریداران" }).click();
  await expect(page.getByText("ثبت نظر فقط پس از خرید و ورود ممکن است")).toBeVisible();
});

test("support ticket is created and persists across a reload", async ({ page }) => {
  const user = freshUser("support");
  await signUp(page, user);
  await page.goto("/profile#support");
  await page.getByRole("button", { name: /تیکت جدید/ }).click();
  await page.getByLabel("موضوع").fill("سوال دربارهٔ سایزبندی");
  await page.getByLabel("پیام").fill("سلام، برای قد ۹۵ سانتی‌متر چه سایزی مناسب است؟");
  await page.getByRole("button", { name: "ثبت تیکت" }).click();
  await expect(page.getByText("تیکت ثبت شد")).toBeVisible({ timeout: 10_000 });
  await expect(page.getByText("سوال دربارهٔ سایزبندی")).toBeVisible();

  await page.reload();
  await page.goto("/profile#support");
  await expect(page.getByText("سوال دربارهٔ سایزبندی")).toBeVisible({ timeout: 10_000 });
});

test("submitting an empty ticket shows validation instead of creating one", async ({ page }) => {
  const user = freshUser("emptyticket");
  await signUp(page, user);
  await page.goto("/profile#support");
  await page.getByRole("button", { name: /تیکت جدید/ }).click();
  await page.getByRole("button", { name: "ثبت تیکت" }).click();
  await expect(page.getByText(/موضوع باید حداقل|پیام باید حداقل/).first()).toBeVisible();
});
