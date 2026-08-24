import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const FOCUS_ID = "FND-01";

async function masteryAttempts(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts?.length ?? 0 : 0;
  }, LEARNER_KEY);
}

async function answerCurrentCard(page) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  const decisionId = await card.getAttribute("data-practical-decision-id");
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await card.getByRole("button", { name: /Ответить|Answer/ }).click();
  await expect(card.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
  return { card, decisionId };
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local V3-06 continuity fixture" }) });
  });
});

test("V3-06b scored Quick Start feedback survives hard refresh without duplicate evidence", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  const { decisionId } = await answerCurrentCard(page);
  const attemptsAfterAnswer = await masteryAttempts(page);
  expect(attemptsAfterAnswer).toBeGreaterThan(0);

  await page.reload();
  const restored = page.locator(`section.today-card[data-practical-decision-id="${decisionId}"]`);
  await expect(restored).toBeVisible();
  await expect(restored.getByRole("heading", { name: /Верно|Нужно исправить/ })).toBeVisible();
  await expect(restored.locator('input[type="radio"]:checked')).toHaveCount(2);
  await expect(restored.locator('input[type="radio"]:enabled')).toHaveCount(0);
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(restored.getByRole("heading", { name: /Correct|Repair needed/ })).toBeVisible();
  await page.reload();
  await expect(page.locator(`section.today-card[data-practical-decision-id="${decisionId}"]`).getByRole("heading", { name: /Correct|Repair needed/ })).toBeVisible();
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);
});

test("V3-06c submitted Q1 resumes at Q2 across leave/re-entry, reload, Back and Forward", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught : false;
  }, LEARNER_KEY)).toBe(true);

  await page.goto(`/mastery/session?focus=${FOCUS_ID}&source=v3-06#continuity`);
  await expect(page.getByText(/ПРАКТИКА · 1\/8|PRACTICE · 1\/8/)).toBeVisible();
  const first = await answerCurrentCard(page);
  const attemptsAfterQ1 = await masteryAttempts(page);

  await page.goto("/mastery");
  await page.goto(`/mastery/session?focus=${FOCUS_ID}&source=v3-06#continuity`);
  await expect(page).toHaveURL(new RegExp(`/mastery/session\\?focus=${FOCUS_ID}&source=v3-06#continuity$`));
  await expect(page.getByText(/ПРАКТИКА · 2\/8|PRACTICE · 2\/8/)).toBeVisible();
  const q2 = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(q2).toBeVisible();
  expect(await q2.getAttribute("data-practical-decision-id")).not.toBe(first.decisionId);
  expect(await masteryAttempts(page)).toBe(attemptsAfterQ1);

  const q2Id = await q2.getAttribute("data-practical-decision-id");
  await page.reload();
  await expect(page.getByText(/ПРАКТИКА · 2\/8|PRACTICE · 2\/8/)).toBeVisible();
  expect(await page.locator("section.today-card[data-practical-decision-id]").first().getAttribute("data-practical-decision-id")).toBe(q2Id);
  expect(await masteryAttempts(page)).toBe(attemptsAfterQ1);

  await page.goBack();
  await expect(page).toHaveURL(/\/mastery$/);
  await page.goForward();
  await expect(page.getByText(/ПРАКТИКА · 2\/8|PRACTICE · 2\/8/)).toBeVisible();
  expect(await masteryAttempts(page)).toBe(attemptsAfterQ1);

  await page.goto("/mastery/session");
  await expect(page).toHaveURL(/\/mastery\/session$/);
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  expect(await masteryAttempts(page)).toBe(attemptsAfterQ1);
});
