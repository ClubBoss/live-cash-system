import { expect, test } from "@playwright/test";
import { reachPersistedSkillTargets } from "./practical-fixture-authority.mjs";

const LEARNER_KEY = "live-cash-os:learner-state";
const QUICK_START_SKILLS = [
  "FND-01",
  "FND-02",
  "PF-01",
  "PF-04",
  "W4-BOARD-01",
  "IP-01",
  "BL-04",
  "W4-RUNOUT-01",
];

async function practicalMasterySnapshot(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const mastery = raw ? JSON.parse(raw)._practicalProfile?.mastery ?? null : null;
    return mastery ? JSON.stringify(mastery) : null;
  }, LEARNER_KEY);
}

async function attemptCount(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const mastery = raw ? JSON.parse(raw)._practicalProfile?.mastery ?? null : null;
    return mastery ? (mastery.attemptArchive?.count ?? 0) + (mastery.attempts?.length ?? 0) : 0;
  }, LEARNER_KEY);
}

async function integratedDraft(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.studyWorkspace?.continuity?.integrated?.draft ?? null : null;
  }, LEARNER_KEY);
}

async function lastAttempt(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const attempts = raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts ?? [] : [];
    return attempts.at(-1) ?? null;
  }, LEARNER_KEY);
}

async function seedQuickStartReadiness(page) {
  await reachPersistedSkillTargets(
    page,
    LEARNER_KEY,
    QUICK_START_SKILLS.map((skillId) => ({ skillId, targetStage: "RECOGNITION_TRAINED" })),
  );
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
}

async function activeDecisionId(page, index, total = 8) {
  await expect(page.getByText(new RegExp(`ПРАКТИКА · (?:.+ · )?${index}\\/${total}|PRACTICE · (?:.+ · )?${index}\\/${total}`))).toBeVisible();
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  return card.getAttribute("data-practical-decision-id");
}

async function submitCurrent(page) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await card.getByRole("button", { name: /Ответить|Answer/ }).click();
  await expect(card.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "V7 Post-Blind C local fixture" }) });
  });
});

test("V7-C active Q1 replaces stale COMPLETE across two leave routes and reload without evidence inflation", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
  await seedQuickStartReadiness(page);

  // Match the Blind V7 precondition: a mature learner completes one generic
  // round and has a truthful next generic round available to start.
  await page.goto("/mastery/session");
  await activeDecisionId(page, 1);
  for (let index = 1; index <= 8; index += 1) {
    await submitCurrent(page);
    await page.getByRole("button", { name: /Следующее решение|Next decision/ }).click();
    if (index < 8) await activeDecisionId(page, index + 1);
  }
  await expect(page.getByRole("heading", { name: /Раунд завершён|Round complete/ })).toBeVisible();
  await expect(page.getByRole("button", { name: /Продолжить обучение|Continue learning/ })).toBeVisible();
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toHaveCount(0);

  const masteryBeforeNewRound = await practicalMasterySnapshot(page);
  const attemptsBeforeNewRound = await attemptCount(page);
  expect(masteryBeforeNewRound).toBeTruthy();

  await page.getByRole("button", { name: /Продолжить обучение|Continue learning/ }).click();
  const q1Id = await activeDecisionId(page, 1);
  expect(q1Id).toBeTruthy();
  expect(await practicalMasterySnapshot(page)).toBe(masteryBeforeNewRound);
  expect(await attemptCount(page)).toBe(attemptsBeforeNewRound);

  // A: leave through the skill map, then re-enter the canonical session.
  await page.goto("/mastery");
  await page.goto("/mastery/session");
  expect(await activeDecisionId(page, 1)).toBe(q1Id);
  await expect(page.getByRole("heading", { name: /Раунд завершён|Round complete/ })).toHaveCount(0);
  expect(await attemptCount(page)).toBe(attemptsBeforeNewRound);

  // B: second normal learner surface leave/re-entry route.
  await page.goto("/mastery/journey");
  await page.goto("/mastery/session");
  expect(await activeDecisionId(page, 1)).toBe(q1Id);
  await expect(page.getByRole("heading", { name: /Раунд завершён|Round complete/ })).toHaveCount(0);

  // C: reload before the first answer.
  await page.reload();
  expect(await activeDecisionId(page, 1)).toBe(q1Id);
  expect(await practicalMasterySnapshot(page)).toBe(masteryBeforeNewRound);
  expect(await attemptCount(page)).toBe(attemptsBeforeNewRound);

  // D: existing post-submit continuity still advances to Q2.
  await submitCurrent(page);
  expect(await attemptCount(page)).toBe(attemptsBeforeNewRound + 1);
  await page.getByRole("button", { name: /Следующее решение|Next decision/ }).click();
  const q2Id = await activeDecisionId(page, 2);
  expect(q2Id).toBeTruthy();
  expect(q2Id).not.toBe(q1Id);
  await page.reload();
  expect(await activeDecisionId(page, 2)).toBe(q2Id);
  expect(await attemptCount(page)).toBe(attemptsBeforeNewRound + 1);
});


async function currentDecisionId(page) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  return card.getAttribute("data-practical-decision-id");
}

async function choosePreSubmitDraft(page, { confidence = null } = {}) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  const action = card.locator("fieldset").nth(0).locator('input[type="radio"]').first();
  const reason = card.locator("fieldset").nth(1).locator('input[type="radio"]').first();
  const actionId = await action.getAttribute("value");
  const reasonId = await reason.getAttribute("value");
  expect(actionId).toBeTruthy();
  expect(reasonId).toBeTruthy();
  await action.check();
  await reason.check();
  if (confidence !== null) {
    await card.locator('input[type="range"]').fill(String(confidence));
  }
  await expect.poll(async () => integratedDraft(page)).toMatchObject({
    actionId,
    reasonId,
    confidence: confidence ?? 65,
    confidenceProvenance: confidence === null ? "NOT_CAPTURED" : "SELF_REPORT",
  });
  return { actionId, reasonId, confidence: confidence ?? 65 };
}

async function expectDraftControls(page, expected) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card.locator("fieldset").nth(0).locator('input[type="radio"]:checked')).toHaveValue(expected.actionId);
  await expect(card.locator("fieldset").nth(1).locator('input[type="radio"]:checked')).toHaveValue(expected.reasonId);
  await expect(card.locator('input[type="range"]')).toHaveValue(String(expected.confidence));
}

async function resumeThroughCanonicalContinue(page, expectedDecisionId) {
  await page.goto("/mastery");
  const resume = page.locator('a[data-active-round-resume="1"]').first();
  await expect(resume).toBeVisible();
  await resume.click();
  await expect.poll(async () => currentDecisionId(page)).toBe(expectedDecisionId);
}

test("LC-AUD-025 generic Q1 preserves action/reason and untouched-confidence provenance across Continue reload Back/Forward", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
  await seedQuickStartReadiness(page);

  await page.goto("/mastery/session");
  const q1Id = await currentDecisionId(page);
  const attemptsBefore = await attemptCount(page);
  const masteryBefore = await practicalMasterySnapshot(page);
  const selected = await choosePreSubmitDraft(page);
  expect(await attemptCount(page)).toBe(attemptsBefore);
  expect(await practicalMasterySnapshot(page)).toBe(masteryBefore);

  await resumeThroughCanonicalContinue(page, q1Id);
  await expectDraftControls(page, selected);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.reload();
  expect(await currentDecisionId(page)).toBe(q1Id);
  await expectDraftControls(page, selected);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.goBack();
  await expect(page).toHaveURL(/\/mastery(?:\?.*)?$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/session(?:\?.*)?$/);
  expect(await currentDecisionId(page)).toBe(q1Id);
  await expectDraftControls(page, selected);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  // BFCache/popstate can cause one expected React remount while the route is
  // being re-hydrated. Require the submit control to stay visible across a
  // short stability window before interacting; repeated detach would still
  // fail this acceptance rather than being hidden by force-clicking.
  const submit = page.getByRole("button", { name: /Ответить|Answer/ });
  await expect(submit).toBeVisible();
  await page.waitForTimeout(250);
  await expect(submit).toBeVisible();
  await submit.click();
  expect(await attemptCount(page)).toBe(attemptsBefore + 1);
  expect((await lastAttempt(page))?.confidenceProvenance).toBe("NOT_CAPTURED");
});

test("LC-AUD-025 focused Q1 preserves touched confidence as SELF_REPORT across canonical resume and reload", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
  await seedQuickStartReadiness(page);

  const focusSkillId = "FND-01";
  await page.goto(`/mastery/session?focus=${focusSkillId}`);
  const q1Id = await currentDecisionId(page);
  const attemptsBefore = await attemptCount(page);
  const selected = await choosePreSubmitDraft(page, { confidence: 83 });
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await resumeThroughCanonicalContinue(page, q1Id);
  await expect(page).toHaveURL(new RegExp(`/mastery/session\\?focus=${focusSkillId}`));
  await expectDraftControls(page, selected);
  expect((await integratedDraft(page))?.confidenceProvenance).toBe("SELF_REPORT");

  await page.reload();
  expect(await currentDecisionId(page)).toBe(q1Id);
  await expectDraftControls(page, selected);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.getByRole("button", { name: /Ответить|Answer/ }).click();
  expect(await attemptCount(page)).toBe(attemptsBefore + 1);
  const attempt = await lastAttempt(page);
  expect(attempt?.confidence).toBe(83);
  expect(attempt?.confidenceProvenance).toBe("SELF_REPORT");
});
