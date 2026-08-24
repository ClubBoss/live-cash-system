import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function learnerSnapshot(page) {
  return page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY);
}

async function finishCurrentRound(page) {
  for (let step = 0; step < 12; step += 1) {
    if (await page.getByRole("heading", { name: "Раунд завершён", exact: true }).isVisible().catch(() => false)) return;

    const card = page.locator("section.today-card[data-practical-decision-id]");
    await expect(card).toBeVisible();
    await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
    await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
    await card.getByRole("button", { name: /Ответить/ }).click();
    await card.getByRole("button", { name: /Следующее решение/ }).click();
  }

  throw new Error("Focused round did not complete within the bounded session size");
}

test("explicit generic continuation removes stale focus without learner-state mutation or history resurrection", async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local focused-url fixture" }) });
  });

  await page.goto("/mastery");
  const recommendation = page.locator("section.today-card").filter({ hasText: "СЕЙЧАС ПОЛЕЗНЕЕ ВСЕГО" }).first();
  const focused = recommendation.getByRole("link", { name: "Продолжить обучение", exact: true });
  const href = await focused.getAttribute("href");
  expect(href).toMatch(/^\/mastery\/session\?focus=[A-Z0-9-]+$/);
  const focusId = new URL(href, "http://local.test").searchParams.get("focus");
  expect(focusId).toBeTruthy();

  await page.goto(`${href}&source=url-regression#focused-session`);
  await expect(page).toHaveURL(new RegExp(`/mastery/session\\?focus=${focusId}&source=url-regression#focused-session$`));
  await expect(page.locator("main")).toContainText(/ПРАКТИКА/);

  await finishCurrentRound(page);
  const beforeCleanup = await learnerSnapshot(page);
  expect(beforeCleanup).not.toBeNull();

  await page.getByRole("button", { name: "Продолжить обучение", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/session\?source=url-regression#focused-session$/);
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();
  expect(await learnerSnapshot(page)).toBe(beforeCleanup);

  await page.reload();
  await expect(page).toHaveURL(/\/mastery\/session\?source=url-regression#focused-session$/);
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();
  expect(await learnerSnapshot(page)).toBe(beforeCleanup);

  await page.goBack();
  await expect(page).toHaveURL(/\/mastery$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/session\?source=url-regression#focused-session$/);
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  await expect(page.locator("main")).not.toContainText("ВЫБРАННЫЙ ФОКУС");
});