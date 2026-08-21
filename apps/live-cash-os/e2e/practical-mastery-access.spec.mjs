import { expect, test } from "@playwright/test";

test("direct Practical Mastery URL preserves the test-invite access boundary", async ({ page }) => {
  test.skip(process.env.LIVE_CASH_DEPLOY_TARGET !== "test-mirror", "test-invite boundary is enabled only in test-mirror builds");
  await page.goto("/mastery");
  await expect(page.getByRole("heading", { name: "Вход для тестирования" })).toBeVisible();
  await expect(page.getByLabel("Код доступа")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Не пройти курс/i })).toHaveCount(0);
});
