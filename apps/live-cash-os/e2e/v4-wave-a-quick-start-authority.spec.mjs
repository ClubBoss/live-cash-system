import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const QUICK_START_SKILLS = ["FND-01", "FND-02", "PF-01", "PF-04", "W4-BOARD-01", "IP-01", "BL-04", "W4-RUNOUT-01"];
const COMPLETE_HEADING = /Быстрый старт завершён|Quick start complete/;
const FEEDBACK_HEADING = /Верно|Нужно исправить|Correct|Repair needed/;

async function masteryAttempts(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts?.length ?? 0 : 0;
  }, LEARNER_KEY);
}

async function setReached(page, reached) {
  await page.evaluate(({ key, ids, count }) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("missing learner state");
    const root = JSON.parse(raw);
    const mastery = root._practicalProfile?.mastery;
    if (!mastery?.skills) throw new Error("missing practical mastery state");
    ids.forEach((skillId, index) => {
      const skill = mastery.skills[skillId];
      if (!skill) throw new Error(`missing Quick Start skill ${skillId}`);
      skill.evidenceStage = index < count ? "RECOGNITION_TRAINED" : "SOURCE_SUPPORTED";
      skill.conceptTaught = index < count;
    });
    localStorage.setItem(key, JSON.stringify(root));
  }, { key: LEARNER_KEY, ids: QUICK_START_SKILLS, count: reached });
  await page.reload();
}

async function answerVisibleQuickStartDecision(page) {
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  const answer = page.getByRole("button", { name: /Ответить|Answer/ }).last();
  await expect(answer).toBeVisible();
  const card = answer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await answer.click();
  await expect(card.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  return card;
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "V4 Wave A local authority fixture" }) });
  });
});

test("V4 Wave A: generic journey target never presents 0..7/8 as complete and accepts 8/8", async ({ page }) => {
  await page.goto("/mastery/journey");
  await expect(page.locator("main")).toBeVisible();

  for (const reached of [0, 1, 3, 5, 7]) {
    await setReached(page, reached);
    await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  }

  await setReached(page, 8);
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
});

test("V4 Wave A: partial VALID post-answer feedback survives reload and leave/re-entry without duplicate mastery attempt", async ({ page }) => {
  await page.goto("/mastery/journey");
  await answerVisibleQuickStartDecision(page);
  const attemptsAfterAnswer = await masteryAttempts(page);
  expect(attemptsAfterAnswer).toBeGreaterThan(0);

  await setReached(page, 5);
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);

  await page.reload();
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);

  await page.goto("/mastery");
  await page.goto("/mastery/journey");
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);

  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);
});

test("V4 Wave A: completed authority preserves final post-answer feedback before exposing completion", async ({ page }) => {
  await page.goto("/mastery/journey");
  await answerVisibleQuickStartDecision(page);
  const attemptsAfterAnswer = await masteryAttempts(page);

  await setReached(page, 8);
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);

  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  expect(await masteryAttempts(page)).toBe(attemptsAfterAnswer);
});
