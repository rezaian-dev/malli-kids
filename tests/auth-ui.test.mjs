import test, { after } from "node:test";
import assert from "node:assert/strict";
import { readFile, mkdir } from "node:fs/promises";
import { randomInt } from "node:crypto";
import { chromium } from "playwright";

const env = JSON.parse(await readFile(process.env.TEST_ENV_FILE, "utf8"));
const url = process.env.TEST_UI_URL || "http://127.0.0.1:3000";
assert.equal(new URL(url).hostname, "127.0.0.1");
const browser = await chromium.launch({ headless: true });
after(() => browser.close());
const digits = (v) => v.replace(/\d/g, (d) => "۰۱۲۳۴۵۶۷۸۹"[Number(d)]);
const phoneNumber = () => `0919${randomInt(1000000, 9999999)}`;
async function sms(phone) {
  const all = await (
    await fetch(env.SMS_RELAY_URL.replace(/\/sms$/, "/messages"), {
      headers: { "x-relay-secret": env.SMS_RELAY_SECRET },
    })
  ).json();
  return all.filter((message) => message.phone === phone).at(-1)?.code;
}
async function open(page) {
  await page.goto(url);
  await page.getByRole("button", { name: "باز کردن فرم ورود" }).click();
  await page.getByRole("dialog").waitFor();
}
async function signupForm(page) {
  await page.getByRole("tab", { name: "ثبت‌نام", exact: true }).click();
  return page.getByRole("form", { name: "ثبت‌نام", exact: true });
}
async function pauseValidation(page) {
  await page.addInitScript(() => {
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (...args) {
      const animation = animate.apply(this, args);
      if (this.matches("[data-field]")) animation.pause();
      return animation;
    };
  });
}
async function checkHorizontalClipping(form, expectedErrors) {
  await form
    .locator('[data-field][data-invalid="true"]')
    .nth(expectedErrors - 1)
    .waitFor();
  const result = await form.evaluate((element) => {
    const fields = [
      ...element.querySelectorAll('[data-field][data-invalid="true"]'),
    ];
    const animations = element
      .getAnimations({ subtree: true })
      .filter((a) => a.id === "field-validation");
    const issues = [];
    const nested = animations.some(
      (a) => !a.effect.target.matches("[data-field]"),
    );
    for (const time of [0, 90, 180, 270, 360, 449]) {
      animations.forEach((a) => {
        a.pause();
        a.currentTime = time;
      });
      for (const field of fields) {
        const control =
          field.querySelector("[data-field-shell], [data-otp-input]") ?? field;
        const box = control.getBoundingClientRect();
        let parent = field.parentElement;
        while (parent && parent !== document.body) {
          const style = getComputedStyle(parent);
          if (["hidden", "clip", "auto", "scroll"].includes(style.overflowX)) {
            const clip = parent.getBoundingClientRect();
            const left = clip.left + parent.clientLeft;
            const right = left + parent.clientWidth;
            // 4px reserved for a visible focus/validation ring, not just the border.
            if (box.left - 4 < left - 1 || box.right + 4 > right + 1) {
              issues.push({
                field: field.dataset.field,
                time,
                left: box.left,
                right: box.right,
                clipLeft: left,
                clipRight: right,
              });
            }
          }
          parent = parent.parentElement;
        }
      }
    }
    return {
      issues,
      nested,
      fields: fields.length,
      animations: animations.length,
      overflow: document.documentElement.scrollWidth > innerWidth,
      focusedHere: element.contains(document.activeElement),
    };
  });
  assert.equal(result.fields, expectedErrors);
  assert.equal(result.nested, false, "Only one transform per invalid field");
  assert.deepEqual(result.issues, [], JSON.stringify(result.issues));
  assert.equal(result.overflow, false, "No page-level horizontal scrollbar");
  assert.equal(result.focusedHere, true, "Focus stays in the submitted form");
}

for (const width of [320, 375, 390, 768, 1280]) {
  for (const dark of [false, true]) {
    test(`empty/malformed signup has unclipped errors and rings at ${width}px / ${dark ? "dark" : "light"}`, async () => {
      const page = await browser.newPage({
        viewport: { width, height: width < 768 ? 640 : 850 },
      });
      page.setDefaultTimeout(10_000);
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await pauseValidation(page);
      await open(page);
      if (dark)
        await page.evaluate(() =>
          document.documentElement.classList.add("dark"),
        );
      const form = await signupForm(page);
      await form.getByRole("button", { name: "دریافت کد و ادامه" }).click();
      await checkHorizontalClipping(form, 4);
      assert.equal(
        await form
          .locator('input[name="name"]')
          .evaluate((input) => getComputedStyle(input).fontSize),
        width < 768 ? "16px" : "14px",
      );
      await form.getByLabel("نام و نام خانوادگی").fill("a");
      await form.locator('input[name="email"]').fill("invalid");
      await form.locator('input[name="phone"]').fill("12");
      await form.locator('input[name="password"]').fill("1");
      await form.getByRole("button", { name: "دریافت کد و ادامه" }).click();
      await checkHorizontalClipping(form, 4);
      if ((width === 320 && dark) || (width === 1280 && !dark)) {
        await mkdir("test-results", { recursive: true });
        await page.screenshot({
          path: `test-results/signup-invalid-${width}-${dark ? "dark" : "light"}.png`,
        });
      }
      if (width === 320) {
        await page.setViewportSize({ width, height: 360 });
        await form
          .getByRole("button", { name: "دریافت کد و ادامه" })
          .scrollIntoViewIfNeeded();
        assert.equal(
          await form
            .getByRole("button", { name: "دریافت کد و ادامه" })
            .isVisible(),
          true,
        );
        await checkHorizontalClipping(form, 4);
      }
      assert.deepEqual(errors, []);
      await page.close();
    });
  }
}

test("reduced-motion preference disables validation shaking", async () => {
  const page = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 320, height: 640 },
  });
  page.setDefaultTimeout(10_000);
  await open(page);
  const form = await signupForm(page);
  await form.getByRole("button", { name: "دریافت کد و ادامه" }).click();
  await form.locator('[data-field][data-invalid="true"]').nth(3).waitFor();
  assert.equal(
    await form.evaluate(
      (el) =>
        el
          .getAnimations({ subtree: true })
          .filter((a) => a.id === "field-validation").length,
    ),
    0,
  );
  await page.close();
});

test("real actions: registration, bad OTP, SMS reset, new-password login and recovery phone change", async () => {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  page.setDefaultTimeout(10_000);
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await pauseValidation(page);
  await open(page);
  const form = await signupForm(page);
  const phone = phoneNumber();
  const email = `ui-${phone}@example.test`;
  await form.getByLabel("نام و نام خانوادگی").fill("کاربر آزمایشی");
  await form.locator('input[name="email"]').fill(email);
  await form
    .locator('input[name="phone"]')
    .fill(digits(`+98${phone.slice(1)}`));
  await form.locator('input[name="password"]').fill("Original8!Secure");
  await form.getByRole("button", { name: "دریافت کد و ادامه" }).click();
  const codeForm = page.getByRole("form", { name: "تأیید موبایل و ثبت‌نام" });
  await codeForm.waitFor();
  const signupCode = await sms(phone);
  assert.match(signupCode, /^\d{5}$/);
  await codeForm
    .getByLabel("کد تأیید موبایل")
    .fill(signupCode === "00000" ? "11111" : "00000");
  await codeForm.getByRole("button", { name: "تأیید و ساخت حساب" }).click();
  await codeForm.getByRole("alert").waitFor();
  await checkHorizontalClipping(codeForm, 1);
  await codeForm.getByLabel("کد تأیید موبایل").fill(digits(signupCode));
  assert.equal(
    await codeForm.getByLabel("کد تأیید موبایل").inputValue(),
    signupCode,
  );
  await codeForm.getByRole("button", { name: "تأیید و ساخت حساب" }).click();
  await page.getByTestId("signed-in").waitFor();
  assert.equal(await page.getByTestId("recovery-phone").textContent(), phone);

  await page.getByRole("button", { name: "خروج از حساب", exact: true }).click();
  await page.getByTestId("signed-in").waitFor({ state: "detached" });
  await page.getByRole("button", { name: "باز کردن فرم ورود" }).click();
  await page.getByRole("button", { name: /فراموشی/ }).click();
  const forgotten = page.getByRole("form", { name: "فراموشی رمز عبور" });
  await forgotten.getByLabel("شمارهٔ موبایل").fill(phone);
  await forgotten.getByRole("button", { name: "ارسال کد بازیابی" }).click();
  const reset = page.getByRole("form", { name: "تعیین رمز جدید", exact: true });
  await reset.waitFor();
  await reset
    .getByRole("button", { name: "تعیین رمز جدید", exact: true })
    .click();
  await checkHorizontalClipping(reset, 3);
  const resetCode = await sms(phone);
  await reset
    .getByLabel("کد بازیابی")
    .fill(digits(resetCode).split("").join(" "));
  assert.equal(await reset.getByLabel("کد بازیابی").inputValue(), resetCode);
  await reset.locator('input[name="password"]').fill("Revised9!Secure");
  await reset.locator('input[name="confirmPassword"]').fill("Mismatch8!Secure");
  await reset
    .getByRole("button", { name: "تعیین رمز جدید", exact: true })
    .click();
  await reset.getByText("رمزهای واردشده یکسان نیستند").waitFor();
  await reset.locator('input[name="confirmPassword"]').fill("Revised9!Secure");
  await reset
    .getByRole("button", { name: "تعیین رمز جدید", exact: true })
    .click();
  await page.getByText("رمز عبور تغییر کرد", { exact: true }).waitFor();
  await page.getByRole("button", { name: "ورود به حساب", exact: true }).click();
  const login = page.getByRole("form", { name: "ورود با رمز عبور" });
  await login.locator('input[name="email"]').fill(email);
  await login.locator('input[name="password"]').fill("Revised9!Secure");
  await login
    .getByRole("button", { name: "ورود به حساب", exact: true })
    .click();
  await page.getByTestId("signed-in").waitFor();

  const recovery = page.getByRole("form", { name: "امنیت و بازیابی حساب" });
  const newPhone = phoneNumber();
  await recovery.getByLabel("شمارهٔ جدید بازیابی").fill(newPhone);
  await recovery.getByRole("button", { name: "دریافت کد تأیید" }).click();
  const verify = page.getByRole("form", {
    name: "تأیید شمارهٔ بازیابی",
    exact: true,
  });
  await verify.waitFor();
  await verify.getByLabel("کد تأیید شمارهٔ بازیابی").fill(await sms(newPhone));
  await verify
    .getByRole("button", { name: "تأیید شماره", exact: true })
    .click();
  await recovery.waitFor();
  assert.equal(
    await page.getByTestId("recovery-phone").textContent(),
    newPhone,
  );
  assert.deepEqual(errors, []);
  await mkdir("test-results", { recursive: true });
  await page.screenshot({
    path: "test-results/recovery-mobile.png",
    fullPage: true,
  });
  await page.close();
});

test("rapid submits send one request and show server credential errors inline", async () => {
  const page = await browser.newPage({ viewport: { width: 375, height: 700 } });
  page.setDefaultTimeout(10_000);
  await open(page);
  const login = page.getByRole("form", { name: "ورود با رمز عبور" });
  await login.locator('input[name="email"]').fill("no-such-user@example.test");
  await login.locator('input[name="password"]').fill("Wrong12345!");
  let calls = 0;
  await page.route("**/__actions/signInAction", async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });
  await login.evaluate((form) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await login.getByRole("alert").waitFor();
  assert.equal(calls, 1);
  assert.equal(
    await login.locator('input[name="password"]').getAttribute("aria-invalid"),
    "true",
  );
  await page.close();
});

test("resend is single-flight and server cooldown repairs a fast-forwarded client timer", async () => {
  const page = await browser.newPage({ viewport: { width: 320, height: 700 } });
  page.setDefaultTimeout(10_000);
  await page.clock.install();
  await open(page);
  await page.getByRole("button", { name: /کد.*پیامکی/ }).click();
  const phoneForm = page.getByRole("form", { name: "ورود با کد پیامکی" });
  await phoneForm.locator('input[name="phone"]').fill(phoneNumber());
  await phoneForm.getByRole("button", { name: "ارسال کد پیامکی" }).click();
  const codeForm = page.getByRole("form", { name: "تأیید کد پیامکی" });
  await codeForm.waitFor();
  await page.clock.fastForward(91_000);
  const resend = codeForm.getByRole("button", { name: "ارسال دوبارهٔ کد" });
  await resend.waitFor();
  let calls = 0;
  await page.route("**/__actions/requestOtpAction", async (route) => {
    calls++;
    await new Promise((resolve) => setTimeout(resolve, 350));
    await route.continue();
  });
  await resend.evaluate((button) => {
    button.click();
    button.click();
  });
  await codeForm.getByRole("alert").waitFor();
  assert.equal(calls, 1);
  assert.equal(await resend.count(), 0);
  assert.equal(
    await codeForm
      .getByRole("alert")
      .evaluate((element) => document.activeElement === element),
    true,
  );
  assert.match(await codeForm.textContent(), /ارسال دوباره تا/);
  assert.equal(
    await codeForm.getByRole("button", { name: "تأیید و ورود" }).isEnabled(),
    true,
  );
  await page.close();
});
