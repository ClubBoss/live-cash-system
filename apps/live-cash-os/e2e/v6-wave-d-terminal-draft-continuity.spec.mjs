import { expect, test } from "@playwright/test";
import { nextFirstJourneyDecision, recommendFirstJourneyStep } from "../lib/practical-first-journey.ts";

const LEARNER_KEY = "live-cash-os:learner-state";
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

async function masterySnapshot(page) {
  return page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key) ?? "null");
    return JSON.stringify(root?._practicalProfile?.mastery ?? null);
  }, LEARNER_KEY);
}

async function currentMastery(page) {
  return page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key) ?? "null");
    const mastery = root?._practicalProfile?.mastery;
    if (!mastery) throw new Error("missing practical mastery state");
    return mastery;
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

async function answerCurrentQuickStartDecision(page) {
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  const card = await practiceCard(page);
  const mastery = await currentMastery(page);
  const recommendation = recommendFirstJourneyStep(mastery);
  if (!recommendation) throw new Error("missing canonical Quick Start recommendation");
  const decision = nextFirstJourneyDecision(mastery, recommendation.skillId);
  if (!decision) throw new Error(`missing canonical Quick Start decision for ${recommendation.skillId}`);
  const actionIndex = decision.actionOptions.findIndex((option) => option.id === decision.correctActionId);
  const reasonIndex = decision.reasonOptions.findIndex((option) => option.id === decision.correctReasonId);
  if (actionIndex < 0 || reasonIndex < 0) throw new Error(`invalid canonical answer options for ${decision.id}`);

  await card.locator("fieldset").nth(0).locator('input[type="radio"]').nth(actionIndex).check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').nth(reasonIndex).check();
  await page.getByRole("button", { name: /Ответить|Answer/ }).last().click();
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
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

test("V6-D fresh Quick Start advances 1 through 8 and final accepted item hands off directly to canonical COMPLETE", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
  await page.reload();
  await ensurePracticalProfile(page);

  let expectedAttempts = await attemptCount(page);
  expect(expectedAttempts).toBe(0);

  for (let step = 1; step <= 8; step += 1) {
    await expect(page.locator("main")).toContainText(new RegExp(`(?:ШАГ ${step} ИЗ 8|STEP ${step} OF 8)`));

    for (let recognitionRep = 0; recognitionRep < 2; recognitionRep += 1) {
      await answerCurrentQuickStartDecision(page);
      expectedAttempts += 1;
      expect(await attemptCount(page)).toBe(expectedAttempts);
      await expect(page.locator("main")).not.toContainText(STALE_COPY);

      await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
      expect(await attemptCount(page)).toBe(expectedAttempts);
      await expect(page.locator("main")).not.toContainText(STALE_COPY);

      if (recognitionRep === 0) {
        await expect(page.locator("main")).toContainText(new RegExp(`(?:ШАГ ${step} ИЗ 8|STEP ${step} OF 8)`));
      } else if (step < 8) {
        await expect(page.locator("main")).toContainText(new RegExp(`(?:ШАГ ${step + 1} ИЗ 8|STEP ${step + 1} OF 8)`));
      }
    }
  }

  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  await expect(page.locator("main")).not.toContainText(STALE_COPY);
  const attemptsAtComplete = await attemptCount(page);
  expect(attemptsAtComplete).toBe(expectedAttempts);

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
