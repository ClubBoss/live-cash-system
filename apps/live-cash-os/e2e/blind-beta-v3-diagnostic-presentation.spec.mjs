import { expect, test } from "@playwright/test";

test("V3 Diagnostic learner surface hides internal item/module IDs while preserving learner copy", async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local diagnostic presentation fixture" }) });
  });

  await page.goto("/tools?tab=diagnostic");
  await expect(page.getByRole("heading", { name: "Проверь, как принимаешь решения сейчас." })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\b(?:LD-\d+|LCM-\d+)\b/);

  await page.getByRole("button", { name: /^Начать диагностику/ }).click();
  await expect(page.getByText("Ситуация 1", { exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\b(?:LD-\d+|LCM-\d+)\b/);
  await expect(page.getByRole("button", { name: "Сохранить и выйти" })).toBeVisible();
});
