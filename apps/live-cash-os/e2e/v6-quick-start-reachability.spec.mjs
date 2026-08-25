import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const COMPLETE_HEADING = /Быстрый старт завершён|Quick start complete/;
const CORRECT_HEADING = /Верно|Correct/;
const REPAIR_HEADING = /Нужно исправить|Repair needed/;

async function openCurrentDecision(page) {
  const answer = page.getByRole("button", { name: /Ответить|Answer/ }).last();
  if (await answer.isVisible()) return answer;

  const start = page.getByRole("button", { name: /Проверить на примере|Try an example/ });
  await expect(start).toBeVisible();
  await start.click();
  await expect(answer).toBeVisible();
  return answer;
}

async function answerCurrentDecisionCorrectly(page) {
  const answer = await openCurrentDecision(page);
  const card = answer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
  const actionLabels = card.locator("fieldset").nth(0).locator("label");
  const reasonLabels = card.locator("fieldset").nth(1).locator("label");
  const actionTexts = (await actionLabels.allTextContents()).map((text) => text.trim());
  const reasonTexts = (await reasonLabels.allTextContents()).map((text) => text.trim());

  await actionLabels.first().locator('input[type="radio"]').check();
  await reasonLabels.first().locator('input[type="radio"]').check();
  await answer.click();

  if (await page.getByRole("heading", { name: CORRECT_HEADING }).isVisible()) {
    await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
    return;
  }

  await expect(page.getByRole("heading", { name: REPAIR_HEADING })).toBeVisible();
  const correction = await page.locator("[data-practical-correct-answer]").innerText();
  const actionIndex = actionTexts.findIndex((text) => text && correction.includes(text));
  const reasonIndex = reasonTexts.findIndex((text) => text && correction.includes(text));
  expect(actionIndex).toBeGreaterThanOrEqual(0);
  expect(reasonIndex).toBeGreaterThanOrEqual(0);

  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
  const retryAnswer = await openCurrentDecision(page);
  const retryCard = retryAnswer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
  await retryCard.locator("fieldset").nth(0).locator("label").nth(actionIndex).locator('input[type="radio"]').check();
  await retryCard.locator("fieldset").nth(1).locator("label").nth(reasonIndex).locator('input[type="radio"]').check();
  await retryAnswer.click();
  await expect(page.getByRole("heading", { name: CORRECT_HEADING })).toBeVisible();
  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "V6 fresh Quick Start fixture" }) });
  });
});

test("V6: fresh learner sees Quick Start steps 1 through 8 without skips and completes 8/8", async ({ page }) => {
  test.setTimeout(240_000);

  await page.goto("/mastery/journey");
  await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
  await page.reload();

  for (let step = 1; step <= 8; step += 1) {
    await expect(page.locator("main")).toContainText(new RegExp(`(?:ШАГ ${step} ИЗ 8|STEP ${step} OF 8)`));
    await answerCurrentDecisionCorrectly(page);
    await answerCurrentDecisionCorrectly(page);
  }

  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  await expect(page.locator("main")).not.toContainText(/Сейчас нет следующего допустимого шага|There is no currently admissible next Quick Start step/);
});
