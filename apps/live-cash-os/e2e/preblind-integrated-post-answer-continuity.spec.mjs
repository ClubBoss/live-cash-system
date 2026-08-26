import { expect, test } from "@playwright/test";

async function prepareFocusedIntegratedRound(page) {
  await page.route("**/api/state", async (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local continuity fixture" }) }));
  await page.goto("/mastery/journey");
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await page.getByRole("button", { name: /Проверить на примере/ }).click();
  await page.goto("/mastery/session?focus=FND-01");
  await expect(page.locator("[data-practical-decision-id]")).toBeVisible();
}

for (const viewport of [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile", width: 390, height: 844 },
]) {
  test(`Integrated POST_ANSWER survives refresh and advances exactly once on Next · ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await prepareFocusedIntegratedRound(page);

    const card = page.locator("[data-practical-decision-id]");
    const firstDecisionId = await card.getAttribute("data-practical-decision-id");
    expect(firstDecisionId).toBeTruthy();

    await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
    await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
    await card.getByRole("button", { name: /Ответить|Answer/ }).click();
    await expect(card.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
    await expect(card.getByRole("button", { name: /Следующее решение|Next decision/ })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-01$/);
    const restoredCard = page.locator("[data-practical-decision-id]");
    await expect(restoredCard).toHaveAttribute("data-practical-decision-id", firstDecisionId);
    await expect(restoredCard.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
    await expect(restoredCard.locator('input[type="radio"]:checked')).toHaveCount(2);

    await restoredCard.getByRole("button", { name: /Следующее решение|Next decision/ }).click();
    await expect.poll(async () => page.locator("[data-practical-decision-id]").getAttribute("data-practical-decision-id")).not.toBe(firstDecisionId);
    await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-01$/);
  });
}
