import { expect, test } from "@playwright/test";

test("direct Practical Mastery URL preserves the test-invite access boundary", async ({ page }) => {
  await page.goto("/mastery");
  await expect(page.getByRole("heading", { name: "Вход для тестирования" })).toBeVisible();
  await expect(page.getByLabel("Код доступа")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Не пройти курс/i })).toHaveCount(0);
});
