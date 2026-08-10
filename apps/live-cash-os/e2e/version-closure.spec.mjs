import { expect, test } from "@playwright/test";

test("v1.2.0 footer exposes canonical app and local build identity without overflow", async ({ page }) => {
  await page.goto("/");
  const footer = page.locator("footer[data-build-sha][data-app-version]");
  await expect(footer).toBeVisible();
  await expect(footer).toHaveAttribute("data-app-version", "1.2.0");
  await expect(footer).toHaveAttribute("data-build-sha", "local");
  await expect(footer).toContainText("Live Cash OS v1.2.0 · Build local");
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
  expect(overflow).toBe(false);
});
