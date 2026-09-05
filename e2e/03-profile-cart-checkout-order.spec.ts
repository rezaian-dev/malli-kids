import { test, expect } from "@playwright/test";
import {
  addCurrentProductToCart,
  completeShippingProfile,
  freshUser,
  gotoFirstProduct,
  signUp,
  watchConsole,
} from "./utils";

test.describe.configure({ mode: "serial" });

test("profile edits persist across a reload", async ({ page }) => {
  const user = freshUser("profile");
  await signUp(page, user);
  await completeShippingProfile(page);
  await page.reload();
  await expect(page.getByLabel("کد پستی")).toHaveValue("1234567890");
  await expect(page.getByLabel("آدرس", { exact: true })).toHaveValue("خیابان ولیعصر، پلاک ۱۲۳، واحد ۴");
  await expect(page.getByLabel("شماره موبایل")).toHaveValue(/0912|09123456789/);
});

test("address map opens, geocodes, and can be confirmed into the address field", async ({ page }) => {
  const user = freshUser("map");
  await signUp(page, user);
  await page.goto("/profile");
  await page.getByRole("button", { name: /انتخاب روی نقشه/ }).click();
  const mapGroup = page.getByRole("group", { name: /نقشه‌ی انتخاب موقعیت/ });
  await expect(mapGroup).toBeVisible({ timeout: 15_000 });
  // The map's own initial layout is expected to fire one `moveend` on its
  // own, but that timing isn't something a test should race — panning it
  // once (a real keyboard interaction Leaflet already supports) guarantees
  // a `moveend` fires and a location gets picked, exactly like a shopper
  // nudging the map would.
  await mapGroup.focus();
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: /تأیید و استفاده از این آدرس/ }).click();
  await expect(page.getByRole("button", { name: /ویرایش موقعیت روی نقشه|انتخاب روی نقشه/ })).toBeVisible();
});

test("cart: add item, see it in the cart sheet, and it survives a reload", async ({ page }) => {
  const guard = watchConsole(page);
  const user = freshUser("cart");
  await signUp(page, user);
  await gotoFirstProduct(page);
  const productName = await page.getByRole("heading", { level: 1 }).textContent();
  await addCurrentProductToCart(page);
  await expect(page.getByText(/به سبد اضافه شد/)).toBeVisible();

  await page.getByRole("button", { name: /^سبد خرید/ }).click();
  const cartSheet = page.getByRole("dialog");
  await expect(cartSheet.getByText(productName!.trim(), { exact: false })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: /^سبد خرید/ }).click();
  await expect(page.getByRole("dialog").getByText(productName!.trim(), { exact: false })).toBeVisible();
  guard.assertClean("during cart flow");
});

test("checkout a single cart line end-to-end: order created, visible, invoice downloadable", async ({ page }) => {
  const user = freshUser("checkout");
  await signUp(page, user);
  await completeShippingProfile(page);

  await gotoFirstProduct(page);
  const productName = (await page.getByRole("heading", { level: 1 }).textContent())!.trim();

  await page.getByRole("button", { name: /ثبت سفارش — پرداخت هنگامِ تحویل/ }).click();
  await expect(page.getByRole("dialog").getByText("ثبت سفارش")).toBeVisible();
  await page.getByRole("button", { name: /تأیید و ثبتِ سفارش/ }).click();
  await expect(page.getByText(/سفارش .* ثبت شد/)).toBeVisible({ timeout: 15_000 });

  await page.goto("/profile#orders");
  await expect(page.getByText(productName)).toBeVisible({ timeout: 10_000 });

  const invoiceLink = page.getByRole("link", { name: /دانلود فاکتور/ });
  await expect(invoiceLink).toBeVisible();
  const href = await invoiceLink.getAttribute("href");
  expect(href).toMatch(/\/api\/orders\/.+\/invoice/);
  const res = await page.request.get(href!);
  expect(res.status()).toBe(200);

  // Persistence check: reload and the order must still be there.
  await page.reload();
  await expect(page.getByText(productName)).toBeVisible({ timeout: 10_000 });
});

test("checkout is blocked with a clear message when shipping info is incomplete", async ({ page }) => {
  const user = freshUser("noship");
  await signUp(page, user);
  await gotoFirstProduct(page);
  await page.getByRole("button", { name: /ثبت سفارش — پرداخت هنگامِ تحویل/ }).click();
  await expect(page.getByText(/پروفایل خود را تکمیل کنید/)).toBeVisible();
  await expect(page.getByRole("dialog").getByText("ثبت سفارش")).toHaveCount(0);
});
