import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const FOCUS_ID = "FND-01";

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

  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере/ }).click();
  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught : false;
  }, LEARNER_KEY)).toBe(true);

  await page.goto("/mastery");
  await page.goto(`/mastery/session?focus=${FOCUS_ID}&source=url-regression#focused-session`);
  await expect(page).toHaveURL(new RegExp(`/mastery/session\\?focus=${FOCUS_ID}&source=url-regression#focused-session$`));
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();

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