import { expect, test } from "@playwright/test";

async function expectBuildIdentity(page) {
  const footer = page.locator("footer[data-build-sha][data-app-version]");
  await expect(footer).toBeVisible();
  await expect(footer).toHaveAttribute("data-app-version", "1.2.0");
  await expect(footer).toHaveAttribute("data-build-sha", "local");
  await expect(footer).toHaveText("Live Cash OS v1.2.0");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
}

test("v1.2.0 canonical Practical Mastery and support tools expose one local build identity without overflow", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();
  await expectBuildIdentity(page);

  await page.goto("/tools");
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
  await expectBuildIdentity(page);
});
