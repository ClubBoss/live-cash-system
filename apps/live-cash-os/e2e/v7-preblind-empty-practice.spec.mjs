import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local V7 empty-practice fixture" }) });
  });
});

test("fresh zero-item practice is not Round complete and routes to the primary journey", async ({ page }) => {
  await page.goto("/mastery/session");

  await expect(page.getByRole("heading", { name: /Сейчас нет подходящих задач для общей практики|No eligible mixed practice right now/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /Раунд завершён|Round complete/ })).toHaveCount(0);
  await expect(page.getByText("0/0", { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Это не завершённый раунд|This is not a completed round/)).toBeVisible();

  const nextRoute = page.getByRole("link", { name: /Продолжить основной маршрут|Continue the primary route/ }).first();
  await expect(nextRoute).toHaveAttribute("href", "/mastery/journey");
  await nextRoute.click();
  await expect(page).toHaveURL(/\/mastery\/journey(?:\?|$)/);
});
