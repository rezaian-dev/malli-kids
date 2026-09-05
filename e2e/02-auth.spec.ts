import { test, expect } from "@playwright/test";
import { freshUser, login, logout, openAuthModal, signUp, watchConsole } from "./utils";

test("signup creates a real session and shows the account menu", async ({ page }) => {
  const guard = watchConsole(page);
  const user = freshUser("signup");
  await signUp(page, user);
  await expect(page.getByRole("button", { name: "حساب کاربری" })).toBeVisible();
  guard.assertClean("after signup");
});

test("invalid login shows an error, not a silent failure", async ({ page }) => {
  await page.goto("/");
  const dialog = await openAuthModal(page);
  await dialog.getByLabel("ایمیل").fill("no-such-user@example.com");
  await dialog.locator('input[type="password"]').fill("WrongPass123");
  await dialog.getByRole("button", { name: /ورود به حساب/ }).click();
  await expect(page.getByText(/نامعتبر|اشتباه|یافت نشد/)).toBeVisible({ timeout: 10_000 });
  // Dialog must stay open — a failed login is not a login.
  await expect(page.getByRole("dialog")).toBeVisible();
});

test("empty signup form shows field validation instead of submitting", async ({ page }) => {
  await page.goto("/");
  const dialog = await openAuthModal(page);
  await dialog.getByRole("tab", { name: "ثبت‌نام" }).click();
  await dialog.getByRole("button", { name: /^ساخت.{0,2}حساب/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByRole("button", { name: "حساب کاربری" })).toHaveCount(0);
});

test("logout clears the session and returns guest UI", async ({ page }) => {
  const user = freshUser("logout");
  await signUp(page, user);
  await logout(page);
  await page.reload();
  await expect(page.getByRole("banner").getByRole("button", { name: /ورود/ })).toBeVisible();
});

test("session persists across a reload", async ({ page }) => {
  const user = freshUser("persist");
  await signUp(page, user);
  await page.reload();
  await expect(page.getByRole("button", { name: "حساب کاربری" })).toBeVisible();
});

test("login works for an already-registered account", async ({ page }) => {
  const user = freshUser("relogin");
  await signUp(page, user);
  await logout(page);
  await login(page, user);
  await expect(page.getByRole("button", { name: "حساب کاربری" })).toBeVisible();
});

test("two accounts in the same browser stay distinct (no identity bleed)", async ({ page }) => {
  const a = freshUser("multiA");
  const b = freshUser("multiB");

  await signUp(page, a);
  await page.getByRole("button", { name: "حساب کاربری" }).click();
  await expect(page.getByRole("menu").getByText(a.name, { exact: true })).toBeVisible();
  await page.keyboard.press("Escape");
  await logout(page);

  await signUp(page, b);
  await page.getByRole("button", { name: "حساب کاربری" }).click();
  await expect(page.getByRole("menu").getByText(b.name, { exact: true })).toBeVisible();
  await expect(page.getByRole("menu").getByText(a.name, { exact: true })).toHaveCount(0);
});
