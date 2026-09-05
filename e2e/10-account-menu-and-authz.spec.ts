import { test, expect } from "@playwright/test";
import { freshUser, loginAsAdmin, signUp } from "./utils";

// 👤 Account/user menu open/close animation & interaction regressions
// (`.account-menu-panel` in `storefront.css` + `UserAccountMenu`). The
// animation itself isn't asserted pixel-by-pixel — that's what a human eye
// (or a visual-diff tool this repo doesn't have) is for — but every
// interaction contract it must not break (open, close, outside click,
// Escape, reduced motion) is.
test.describe("account menu", () => {
  test("opens, supports outside click and Escape, and respects reduced motion", async ({
    page,
  }) => {
    const user = freshUser("menuqa");
    await signUp(page, user);
    await page.waitForLoadState("networkidle");

    const trigger = page.getByRole("button", { name: "حساب کاربری" });
    const panel = page.locator(".account-menu-panel");

    // Open — plays the enter keyframe, ends visible and interactive.
    await trigger.click();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveAttribute("data-state", "open");
    await expect(page.getByRole("menuitem", { name: /حساب کاربری من/ })).toBeVisible();

    // Outside click closes it.
    await page.mouse.click(10, 10);
    await expect(panel).toHaveCount(0, { timeout: 2000 });

    // Escape closes it too, and focus returns to the trigger.
    await trigger.click();
    await expect(panel).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(panel).toHaveCount(0, { timeout: 2000 });
    await expect(trigger).toBeFocused();

    // `prefers-reduced-motion: reduce` — no animation at all, but the menu
    // still opens and is usable.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await trigger.click();
    await expect(panel).toBeVisible();
    const animationName = await panel.evaluate((el) => getComputedStyle(el).animationName);
    expect(animationName).toBe("none");
  });
});

// 🔐 Admin authorization: self-demotion. `demoteAdminAction` must refuse an
// admin who targets their own account — even though the UI doesn't hide the
// button on their own row — while still allowing a *different* admin to
// demote them normally (see the guard added in `customers/_lib/actions.ts`).
test("an admin cannot demote themselves, but another admin can demote them", async ({
  page,
  browser,
}) => {
  await loginAsAdmin(page);

  const candidate = freshUser("selfdemote");
  const custCtx = await browser.newContext();
  const custPage = await custCtx.newPage();
  await signUp(custPage, candidate);
  await custCtx.close();

  await page.goto("/admin/team");
  await page.getByPlaceholder("جستجوی نام، ایمیل یا موبایل کاربر…").fill(candidate.email);
  await page.getByRole("button", { name: /ارتقا$/ }).click();
  await expect(page.getByText("دسترسیِ ادمین اعطا شد")).toBeVisible({ timeout: 10_000 });

  // 🧍 The freshly-promoted admin, in their own session, tries to demote
  // *themselves* from `/admin/team`.
  const selfCtx = await browser.newContext();
  const selfPage = await selfCtx.newPage();
  await selfPage.goto("/admin/login");
  await selfPage.getByLabel(/ایمیل/).fill(candidate.email);
  await selfPage.locator('input[type="password"]').fill(candidate.password);
  await selfPage.getByRole("button", { name: /ورود/ }).click();
  await selfPage.waitForURL(/\/admin(?!\/login)/);

  await selfPage.goto("/admin/team");
  const ownRow = selfPage.locator("article", { hasText: candidate.name });
  await expect(ownRow).toBeVisible();
  await ownRow.getByRole("button", { name: "تنزل به کاربر عادی" }).click();
  await selfPage.getByRole("button", { name: "تنزل", exact: true }).click();
  await expect(selfPage.getByText("نمی‌توانید سطح دسترسی خودتان را تغییر دهید.")).toBeVisible({
    timeout: 10_000,
  });

  // Still an admin — a protected admin-only page still renders for them.
  await selfPage.reload();
  await expect(selfPage.getByRole("heading", { name: "تیم مدیریت" })).toBeVisible();
  await selfCtx.close();

  // 🧹 A *different* admin demoting the same account still works normally.
  await page.reload();
  const promotedCard = page.locator("article", { hasText: candidate.name });
  await expect(promotedCard).toBeVisible();
  await promotedCard.getByRole("button", { name: "تنزل به کاربر عادی" }).click();
  await page.getByRole("button", { name: "تنزل", exact: true }).click();
  await expect(page.getByText("ادمین تنزل یافت")).toBeVisible({ timeout: 10_000 });
});
