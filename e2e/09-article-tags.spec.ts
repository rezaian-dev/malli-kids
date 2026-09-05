import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./utils";

test.describe.configure({ mode: "serial" });

/** 🏷️ Regression coverage for the article content-taxonomy feature
 *  (`Tag` model + `Article.tags`, see `@/lib/tags`): creating a tag,
 *  assigning several to one article, duplicate-name prevention (the same
 *  name must resolve to the same tag, not a second near-duplicate), and
 *  that the assignment survives a real save + reopen round trip. */
test("admin can create tags, assign several to an article, and duplicates are prevented", async ({
  page,
}) => {
  await loginAsAdmin(page);
  await page.goto("/admin/articles");
  await page.getByRole("button", { name: /مقاله جدید/ }).click();

  const stamp = Date.now();
  const title = `مقاله آزمایشی برچسب ${stamp}`;
  const tagA = `تگآ${stamp}`;
  const tagB = `تگب${stamp}`;

  await page.getByLabel("عنوان").fill(title);
  await page.getByPlaceholder("دو سه خط کوتاه و جذاب…").fill("خلاصهٔ آزمایشی");
  await page.locator(".tiptap, [contenteditable='true']").first().click();
  await page.keyboard.type("متن آزمایشی مقاله برای بررسی تگ‌ها.");

  const newTagInput = page.getByPlaceholder("تگ جدید…");
  const addTagButton = page.getByRole("button", { name: "افزودن تگ" });

  // ➕ Create and select two distinct tags.
  await newTagInput.fill(tagA);
  await addTagButton.click();
  await expect(page.getByRole("button", { name: tagA, pressed: true })).toBeVisible({
    timeout: 5000,
  });
  await newTagInput.fill(tagB);
  await addTagButton.click();
  await expect(page.getByRole("button", { name: tagB, pressed: true })).toBeVisible({
    timeout: 5000,
  });

  // 🔁 Submitting the exact same name again must resolve to the *same* tag
  // (one chip, still selected) rather than creating a visible duplicate.
  await newTagInput.fill(tagA);
  await addTagButton.click();
  await page.waitForTimeout(500);
  await expect(page.getByRole("button", { name: tagA, exact: true })).toHaveCount(1);

  await page.getByRole("button", { name: /ذخیره مقاله/ }).click();
  await expect(page.getByLabel("عنوان")).toHaveCount(0, { timeout: 10_000 });

  try {
    // 📖 Storefront: both tags show on the published article and link back
    // to the (canonical, unfiltered) articles list.
    await page.goto(`/articles`);
    await page.getByRole("link", { name: title }).click();
    await expect(page.getByRole("link", { name: tagA })).toBeVisible();
    await expect(page.getByRole("link", { name: tagB })).toBeVisible();
    await page.getByRole("link", { name: tagA }).click();
    await expect(page).toHaveURL(/\/articles\?tag=/);
    await expect(page.getByText(title)).toBeVisible();

    // ✏️ Reopening the article for edit shows both tags still selected —
    // the assignment round-tripped through a real save, not just local state.
    await page.goto("/admin/articles");
    await page.getByPlaceholder("عنوان، خلاصه یا موضوع مقاله…").fill(title);
    await page.getByRole("button", { name: "ویرایش" }).first().click();
    await expect(page.getByRole("button", { name: tagA, pressed: true })).toBeVisible();
    await expect(page.getByRole("button", { name: tagB, pressed: true })).toBeVisible();
  } finally {
    // 🧹 Remove the test article and its two tags.
    await page.goto("/admin/articles");
    await page.getByPlaceholder("عنوان، خلاصه یا موضوع مقاله…").fill(title);
    const row = page.locator("article", { hasText: title });
    if (await row.count()) {
      await row.getByLabel(`حذف ${title}`).click();
      await page.getByRole("button", { name: "حذف", exact: true }).click();
      await expect(page.getByText("مقاله حذف شد")).toBeVisible({ timeout: 10_000 });
    }
    await page.getByRole("button", { name: /مقاله جدید/ }).click();
    for (const tag of [tagA, tagB]) {
      const chip = page.getByRole("button", { name: `حذف تگ ${tag}` });
      if (await chip.count()) {
        await chip.click();
        await page.getByRole("button", { name: "حذف", exact: true }).click();
        await expect(page.getByRole("alertdialog")).toHaveCount(0, { timeout: 10_000 });
      }
    }
  }
});

test("an invalid/blank tag name is rejected", async ({ page }) => {
  await loginAsAdmin(page);
  await page.goto("/admin/articles");
  await page.getByRole("button", { name: /مقاله جدید/ }).click();

  // The "add tag" control is disabled for a blank/whitespace-only name —
  // there is no way to submit one from the UI.
  const addTagButton = page.getByRole("button", { name: "افزودن تگ" });
  await expect(addTagButton).toBeDisabled();
  await page.getByPlaceholder("تگ جدید…").fill("   ");
  await expect(addTagButton).toBeDisabled();
});
