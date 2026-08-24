import { test, expect } from "@playwright/test";

for (const viewport of [
  { name: "desktop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`canonical utilities and primary learning action are above-fold on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/mastery");

    const continueLearning = page.getByRole("link", { name: /Продолжить обучение|Continue learning/ }).first();
    const dataEntry = page.getByTestId("data-recovery-entry");
    const syncStatus = page.getByTestId("practical-sync-status");
    const ru = page.getByRole("button", { name: "RU" }).first();
    const en = page.getByRole("button", { name: "EN" }).first();

    for (const locator of [continueLearning, dataEntry, syncStatus, ru, en]) {
      await expect(locator).toBeVisible();
      const box = await locator.boundingBox();
      expect(box).not.toBeNull();
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    }

    await expect(continueLearning).toHaveAttribute("href", "/mastery/journey");
    await en.click();
    await expect(en).toHaveAttribute("aria-pressed", "true");
    await page.reload();
    await expect(page.getByRole("button", { name: "EN" }).first()).toHaveAttribute("aria-pressed", "true");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(viewport.width);
  });
}

test("Data utility reaches existing protected Data & Recovery surface", async ({ page }) => {
  await page.goto("/mastery");
  await page.getByTestId("data-recovery-entry").click();
  await expect(page).toHaveURL(/\/tools\?tab=data/);
  await expect(page.getByRole("button", { name: /Data|Данные/ }).first()).toBeVisible();

  const destructive = page.getByRole("button", { name: /erase all|удалить весь|сбросить/i });
  if (await destructive.count()) {
    await expect(destructive.first()).toBeVisible();
  }
});
