import { expect, test } from "@playwright/test";
import { reachPersistedSkillTargets } from "./practical-fixture-authority.mjs";

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

async function pendingQuickStartAttemptId(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const quickStart = raw ? JSON.parse(raw)._practicalProfile?.studyWorkspace?.continuity?.quickStart ?? null : null;
    return quickStart?.phase === "POST_ANSWER" ? quickStart.attemptId ?? null : null;
  }, LEARNER_KEY);
}

async function attemptOccurrences(page, attemptId) {
  return page.evaluate(({ key, id }) => {
    const raw = localStorage.getItem(key);
    const attempts = raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts ?? [] : [];
    return attempts.filter((attempt) => attempt.id === id).length;
  }, { key: LEARNER_KEY, id: attemptId });
}

async function ensurePracticalProfile(page) {
  const hasProfile = await page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY);
  if (hasProfile) return;
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
}

async function setReached(page, reached) {
  await reachPersistedSkillTargets(
    page,
    LEARNER_KEY,
    QUICK_START_SKILLS.slice(0, reached).map((skillId) => ({ skillId, targetStage: "RECOGNITION_TRAINED" })),
  );
  await page.reload();
}

async function answerVisibleQuickStartDecision(page) {
  const start = page.getByRole("button", { name: /Проверить на примере|Try an example/ });
  if (await start.count()) await start.click();
  const answer = page.getByRole("button", { name: /Ответить|Answer/ }).last();
  await expect(answer).toBeVisible();
  const card = answer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await answer.click();
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
}

async function assertPendingAttemptStillUnique(page, attemptId, attemptBaseline) {
  expect(await masteryAttempts(page)).toBe(attemptBaseline);
  expect(await attemptOccurrences(page, attemptId)).toBe(1);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "V4 Wave A local authority fixture" }) });
  });
});

test("V4 Wave A: generic journey target never presents 0..7/8 as complete and accepts 8/8", async ({ page }) => {
  await page.goto("/mastery/journey");
  await ensurePracticalProfile(page);
  await expect(page.locator("main")).toBeVisible();

  // The sequence is monotonic, so each checkpoint adds only the minimum
  // canonical evidence required for newly-reached Quick Start skills.
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
  await ensurePracticalProfile(page);
  await answerVisibleQuickStartDecision(page);

  const pendingAttemptId = await pendingQuickStartAttemptId(page);
  expect(pendingAttemptId).toBeTruthy();
  expect(await attemptOccurrences(page, pendingAttemptId)).toBe(1);

  // Canonical fixture progression legitimately creates backing attempts. Take
  // the continuity baseline only after that setup, then prove the learner's
  // already-submitted attempt is never duplicated by reload/re-entry/Next.
  await setReached(page, 5);
  const attemptsAfterFixture = await masteryAttempts(page);
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  await assertPendingAttemptStillUnique(page, pendingAttemptId, attemptsAfterFixture);

  await page.reload();
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await assertPendingAttemptStillUnique(page, pendingAttemptId, attemptsAfterFixture);

  await page.goto("/mastery");
  await page.goto("/mastery/journey");
  await ensurePracticalProfile(page);
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  await assertPendingAttemptStillUnique(page, pendingAttemptId, attemptsAfterFixture);

  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  await assertPendingAttemptStillUnique(page, pendingAttemptId, attemptsAfterFixture);
});

test("V4 Wave A: completed authority preserves final post-answer feedback before exposing completion", async ({ page }) => {
  await page.goto("/mastery/journey");
  await ensurePracticalProfile(page);
  await answerVisibleQuickStartDecision(page);

  const pendingAttemptId = await pendingQuickStartAttemptId(page);
  expect(pendingAttemptId).toBeTruthy();
  expect(await attemptOccurrences(page, pendingAttemptId)).toBe(1);

  await setReached(page, 8);
  const attemptsAfterFixture = await masteryAttempts(page);
  await expect(page.getByRole("heading", { name: FEEDBACK_HEADING })).toBeVisible();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
  await assertPendingAttemptStillUnique(page, pendingAttemptId, attemptsAfterFixture);

  await page.getByRole("button", { name: /Следующий пример|Next example/ }).click();
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  await assertPendingAttemptStillUnique(page, pendingAttemptId, attemptsAfterFixture);
});
