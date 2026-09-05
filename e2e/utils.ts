import { expect, type Page } from "@playwright/test";

/** 🧪 Shared QA helpers for Phase 8 — one real signup/login/checkout path
 *  every spec reuses, instead of each file re-deriving selectors for the
 *  auth modal, admin login, or the single-item COD checkout dialog. */

// 🔐 A second, QA-owned bootstrap email (`ADMIN_EMAILS` in `.env.local` now
// lists both) — the original `admin-bootstrap-test@example.com` account
// predates this test suite with an unknown password, so tests use their
// own address they know the credentials for instead of guessing at it.
export const ADMIN_EMAIL = "qa-phase8-admin@example.com";
export const ADMIN_PASSWORD = "AdminPass123";

export function uniqueEmail(tag: string) {
  return `qa-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

export const VALID_PASSWORD = "TestPass123";

export type TestUser = { email: string; password: string; name: string };

export function freshUser(tag: string): TestUser {
  return {
    email: uniqueEmail(tag),
    password: VALID_PASSWORD,
    // 🔤 `fullName()`'s validator only accepts letters/spaces (Unicode
    // `\p{L}`, so Latin is fine) — no digits. Strip any digits a caller's
    // tag happens to carry (uniqueness lives in the email anyway) so this
    // always stays a valid two-"word" name.
    name: `کاربر ${tag.replace(/[0-9]/g, "") || "تست"}`,
  };
}

/** 🪪 Collects console errors / page errors for the app's own code while a
 *  test runs. Call `assertClean()` at the end. Known-external noise
 *  (map tile fetches, browser extension chatter) is filtered out, not
 *  hidden — callers can still inspect `entries` directly. */
export function watchConsole(page: Page) {
  const entries: string[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") entries.push(`console.error: ${msg.text()}`);
    if (msg.type() === "warning" && /hydrat/i.test(msg.text())) {
      entries.push(`hydration warning: ${msg.text()}`);
    }
  });
  page.on("pageerror", (err) => entries.push(`pageerror: ${err.message}`));
  page.on("requestfailed", (req) => {
    const url = req.url();
    // 🗺️ OpenStreetMap/Esri tile fetches can fail in a sandboxed/offline
    // test run — that's an external dependency, not an app bug; reported
    // separately rather than failing the app-level console assertion.
    if (/tile\.openstreetmap|unpkg\.com|leaflet|arcgisonline\.com/i.test(url)) return;
    // 🧭 Next.js aborts an in-flight RSC prefetch (`?_rsc=`) whenever the
    // shopper navigates away before it resolves — expected browser/router
    // behavior, not a failed request the app caused.
    const failure = req.failure()?.errorText;
    if (failure === "net::ERR_ABORTED" && /[?&]_rsc=/.test(url)) return;
    entries.push(`requestfailed: ${url} — ${failure}`);
  });
  return {
    entries,
    assertClean(context = "") {
      expect(entries, `unexpected console/page errors ${context}`).toEqual([]);
    },
  };
}

export async function openAuthModal(page: Page) {
  await page.getByRole("button", { name: /ورود/ }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  return page.getByRole("dialog");
}

/** 🆕 Registers a brand-new account through the real header auth modal and
 *  leaves the shopper signed in (the app logs a fresh signup in directly).
 *  Every field is scoped to the dialog — the storefront footer has its own
 *  "ایمیل"-labelled newsletter input that a bare `page.getByLabel` would
 *  also match. */
export async function signUp(page: Page, user: TestUser) {
  await page.goto("/");
  const dialog = await openAuthModal(page);
  await dialog.getByRole("tab", { name: "ثبت‌نام" }).click();
  await dialog.getByLabel("نام و نام خانوادگی").fill(user.name);
  await dialog.getByLabel("ایمیل").fill(user.email);
  // `getByLabel("رمز عبور")` is ambiguous here: the login tabpanel's own
  // `<form aria-label="ورود با رمز عبور">` also contains that substring, and
  // the register field's real accessible name is "رمز عبور *" (required
  // marker appended) — a plain `type="password"` lookup sidesteps both.
  await dialog.locator('input[type="password"]').fill(user.password);
  await dialog.getByRole("button", { name: /^ساخت.{0,2}حساب/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10_000 });
  await expect(page.getByRole("button", { name: /ورود/ })).toHaveCount(0);
}

export async function login(page: Page, user: Pick<TestUser, "email" | "password">) {
  await page.goto("/");
  const dialog = await openAuthModal(page);
  // Login tab is the default view, but be explicit in case a previous
  // interaction left the modal on another tab.
  await dialog.getByRole("tab", { name: "ورود", exact: true }).click();
  await dialog.getByLabel("ایمیل").fill(user.email);
  // `getByLabel("رمز عبور")` is ambiguous here: the login tabpanel's own
  // `<form aria-label="ورود با رمز عبور">` also contains that substring, and
  // the register field's real accessible name is "رمز عبور *" (required
  // marker appended) — a plain `type="password"` lookup sidesteps both.
  await dialog.locator('input[type="password"]').fill(user.password);
  await dialog.getByRole("button", { name: /ورود به حساب/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10_000 });
}

export async function logout(page: Page) {
  await page.getByRole("button", { name: "حساب کاربری" }).click();
  // Occasionally races a re-render right as the menu opens (the dropdown
  // item detaches mid-click) — one retry from a clean state is cheap and
  // avoids that flake without masking a real failure.
  try {
    await page.getByRole("menuitem", { name: /خروج/ }).click({ timeout: 10_000 });
  } catch {
    await page.keyboard.press("Escape");
    await page.getByRole("button", { name: "حساب کاربری" }).click();
    await page.getByRole("menuitem", { name: /خروج/ }).click();
  }
  // Scoped to the header — some storefront pages (e.g. the guest home
  // hero) also render their own "ورود | ثبت‌نام" CTA, which would
  // otherwise make this an ambiguous, strict-mode-violating locator.
  await expect(page.getByRole("banner").getByRole("button", { name: /ورود/ })).toBeVisible();
}

/** 👑 Ensures the bootstrap admin account exists and is signed in as admin
 *  via /admin/login. The first run creates the account (its email is in
 *  ADMIN_EMAILS); later runs just log in — safe to call every time. */
async function attemptAdminLogin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("ایمیل").fill(ADMIN_EMAIL);
  await page.getByLabel("کلید دسترسی").fill(ADMIN_PASSWORD);
  await page.getByRole("button", { name: /ورود به کنسول/ }).click();
  await page
    .waitForURL(/\/admin(\/)?$/, { timeout: 6000 })
    .catch(() => {});
  return /\/admin\/?$/.test(new URL(page.url()).pathname);
}

export async function loginAsAdmin(page: Page) {
  if (await attemptAdminLogin(page)) return;

  // No account yet — the very first run for this DB. Create it through the
  // normal customer signup (ADMIN_EMAILS bootstrap needs *some* account to
  // exist first), then retry the admin login.
  await page.goto("/");
  const dialog = await openAuthModal(page);
  await dialog.getByRole("tab", { name: "ثبت‌نام" }).click();
  await dialog.getByLabel("نام و نام خانوادگی").fill("ادمین بوت‌استرپ");
  await dialog.getByLabel("ایمیل").fill(ADMIN_EMAIL);
  await dialog.locator('input[type="password"]').fill(ADMIN_PASSWORD);
  await dialog.getByRole("button", { name: /^ساخت.{0,2}حساب/ }).click();
  await expect(page.getByRole("dialog")).toBeHidden({ timeout: 10_000 });

  const ok = await attemptAdminLogin(page);
  expect(ok, "admin login failed even after bootstrap signup").toBe(true);
}

/** 📮 Fills in the shipping fields checkout needs before it will even open
 *  the dialog (`getMissingShippingFields`) — city/address/phone/postal. */
export async function completeShippingProfile(page: Page) {
  await page.goto("/profile");
  await page.getByLabel("کد پستی").fill("1234567890");
  const city = page.getByLabel("شهر");
  await city.fill("تهران");
  await page.getByRole("option", { name: "تهران" }).first().click();
  await page.getByLabel("آدرس", { exact: true }).fill("خیابان ولیعصر، پلاک ۱۲۳، واحد ۴");
  await page.getByLabel("شماره موبایل").fill("09123456789");
  await page.getByRole("button", { name: "ذخیره حساب" }).click();
  await expect(page.getByText("اطلاعات حساب ذخیره شد")).toBeVisible({ timeout: 10_000 });
}

export async function gotoFirstProduct(page: Page) {
  await page.goto("/shop");
  await page.locator('a[href^="/product/"]').first().click();
  await page.waitForURL(/\/product\//);
}

/** 🛒 Adds the currently-open PDP's selected size/qty to cart. Assumes the
 *  shopper is already signed in. */
export async function addCurrentProductToCart(page: Page) {
  await page.locator("#pdp-add-to-cart button").first().click();
}
