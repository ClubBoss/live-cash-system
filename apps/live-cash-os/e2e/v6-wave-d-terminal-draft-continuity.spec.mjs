import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const QUICK_START_SKILLS = ["FND-01", "FND-02", "PF-01", "PF-04", "W4-BOARD-01", "IP-01", "BL-04", "W4-RUNOUT-01"];
const COMPLETE_HEADING = /Быстрый старт завершён|Quick start complete/;
const FEEDBACK_HEADING = /Верно|Correct/;
const STALE_COPY = /Сохранённый шаг больше недоступен|The saved step is no longer available/;

async function ensurePracticalProfile(page) {
  const hasProfile = await page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY);
  if (hasProfile) return;
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
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
    root._practicalProfile.studyWorkspace.continuity = undefined;
    localStorage.setItem(key, JSON.stringify(root));
  }, { key: LEARNER_KEY, ids: QUICK_START_SKILLS, count: reached });
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
}

async function masterySnapshot(page) {
  return page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key) ?? "null");
    return JSON.stringify(root?._practicalProfile?.mastery ?? null);
  }, LEARNER_KEY);
}

async function attemptCount(page) {
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile?.mastery?.attempts?.length ?? 0, LEARNER_KEY);
}

async function practiceCard(page) {
  const answer = page.getByRole("button", { name: /Ответить|Answer/ }).last();
  await expect(answer).toBeVisible();
  return answer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "V6 Wave D local continuity fixture" }) });
  });
});

test("V6-D unsubmitted Quick Start draft survives reload, re-entry and history without evidence, while stale draft fails closed", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
  await page.reload();
  await ensurePracticalProfile(page);
  await setReached(page, 0);

  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  const card = await practiceCard(page);
  const masteryBeforeDraft = await masterySnapshot(page);
  const attemptsBeforeDraft = await attemptCount(page);
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();

  await expect.poll(async () => page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key) ?? "null");
    return root?._practicalProfile?.studyWorkspace?.continuity?.quickStart?.phase ?? null;
  }, LEARNER_KEY)).toBe("IN_PROGRESS");
  expect(await masterySnapshot(page)).toBe(masteryBeforeDraft);
  expect(await attemptCount(page)).toBe(attemptsBeforeDraft);

  await page.reload();
  let restoredCard = await practiceCard(page);
  await expect(restoredCard.locator("fieldset").nth(0).locator('input[type="radio"]').first()).toBeChecked();
  await expect(restoredCard.locator("fieldset").nth(1).locator('input[type="radio"]').first()).toBeChecked();
  expect(await masterySnapshot(page)).toBe(masteryBeforeDraft);

  await page.goto("/mastery");
  await page.goBack();
  restoredCard = await practiceCard(page);
  await expect(restoredCard.locator("fieldset").nth(0).locator('input[type="radio"]').first()).toBeChecked();
  await expect(restoredCard.locator("fieldset").nth(1).locator('input[type="radio"]').first()).toBeChecked();
  expect(await attemptCount(page)).toBe(attemptsBeforeDraft);

  await page.goForward();
  await expect(page).toHaveURL(/\/mastery$/);
  await page.goto("/mastery/journey");
  restoredCard = await practiceCard(page);
  await expect(restoredCard.locator("fieldset").nth(0).locator('input[type="radio"]').first()).toBeChecked();

  await page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key) ?? "null");
    root._practicalProfile.studyWorkspace.continuity.contentVersion = "stale-v6-draft";
    localStorage.setItem(key, JSON.stringify(root));
  }, LEARNER_KEY);
  await page.reload();
  await expect(page.getByRole("button", { name: /Проверить на примере|Try an example/ })).toBeVisible();
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  const staleCard = await practiceCard(page);
  await expect(staleCard.locator('input[type="radio"]:checked')).toHaveCount(0);
  expect(await masterySnapshot(page)).toBe(masteryBeforeDraft);
  expect(await attemptCount(page)).toBe(attemptsBeforeDraft);
});

test("V6-D final accepted Quick Start answer hands off directly from feedback to canonical COMPLETE and stays complete", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
  await page.reload();
  await ensurePracticalProfile(page);

  for (let reached = 0; reached < QUICK_START_SKILLS.length; reached += 1) {
    await setReached(page, reached);
    await expect(page.locator("main")).toContainText(new RegExp(`(?:ШАГ ${reached + 1} ИЗ 8|STEP ${reached + 1} OF 8)`));
  }

  await setReached(page, 7);
  const attemptsBeforeFinal = await attemptCount(page);
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  const card = await practiceCard(page);
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await page.getByRole("button", { name: /Ответить|Answer/ }).last().click();
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  expect(await attemptCount(page)).toBe(attemptsBeforeFinal + 1);

  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  await expect(page.locator("main")).not.toContainText(STALE_COPY);
  const attemptsAtComplete = await attemptCount(page);
  expect(attemptsAtComplete).toBe(attemptsBeforeFinal + 1);

  await page.reload();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  expect(await attemptCount(page)).toBe(attemptsAtComplete);

  await page.goto("/mastery");
  await page.goto("/mastery/journey");
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(STALE_COPY);
  expect(await attemptCount(page)).toBe(attemptsAtComplete);
});
