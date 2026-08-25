import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function masteryAttempts(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts?.length ?? 0 : 0;
  }, LEARNER_KEY);
}

async function answerVisibleQuickStartCard(page) {
  const before = await masteryAttempts(page);
  const answer = page.getByRole("button", { name: /Ответить|Answer/ }).last();
  await expect(answer).toBeVisible();
  const card = answer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await answer.click();
  await expect.poll(() => masteryAttempts(page)).toBe(before + 1);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local V6 mastery transparency fixture" }) });
  });
});

test("V6 learner can see partial evidence behind a still-low Skill Map percentage", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await answerVisibleQuickStartCard(page);

  await page.goto("/mastery");
  await page.getByRole("button", { name: "EN", exact: true }).click();

  await expect(page.getByText(/The percentage moves only after enough distinct independent decisions/)).toBeVisible();
  await expect(page.getByText(/skills are building evidence\. An exact repeat of an already-correct example counts once\./)).toBeVisible();
  await expect(page.getByText(/Recent practice: [01]\/1 correct · [01] distinct correct examples · latest confidence 65%\. Confidence alone does not raise mastery\./)).toBeVisible();
});
