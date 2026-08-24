import { expect, test } from "@playwright/test";

test("V3-09 Diagnostic spot 9 presents only comparable analytical factors", async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local diagnostic construct fixture" }) });
  });

  await page.goto("/tools?tab=diagnostic");
  await page.getByRole("button", { name: /^Начать диагностику/ }).click();

  for (let spot = 1; spot < 9; spot += 1) {
    await expect(page.getByText(`Ситуация ${spot}`, { exact: false })).toBeVisible();
    const actionSet = page.getByRole("group", { name: "Выбери действие" });
    const reasonSet = page.getByRole("group", { name: "Выбери причину" });
    await actionSet.getByRole("button").first().click();
    await reasonSet.getByRole("button").first().click();
    await page.getByRole("button", { name: /Зафиксировать ответ/ }).click();
  }

  await expect(page.getByText("Ситуация 9", { exact: false })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Какой фактор проверить первым перед решением о частой ставке CO?" })).toBeVisible();
  const actionSet = page.getByRole("group", { name: "Выбери действие" });
  await expect(actionSet.getByRole("button")).toHaveCount(3);
  await expect(actionSet).toContainText("Преимущество диапазона BB на низкой доске");
  await expect(actionSet).toContainText("Префлоп-инициатива CO");
  await expect(actionSet).toContainText("Сам факт игры втроём");
  await expect(actionSet).not.toContainText("Range-bet из-за initiative");
  await expect(actionSet).not.toContainText("Check всегда, потому что multiway");
});
