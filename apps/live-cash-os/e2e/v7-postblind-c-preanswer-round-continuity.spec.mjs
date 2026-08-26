import { expect, test } from "@playwright/test";

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
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts?.length ?? 0 : 0;
  }, LEARNER_KEY);
}

async function seedQuickStartReadiness(page) {
  await page.evaluate(({ key, ids }) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("missing learner state");
    const root = JSON.parse(raw);
    const mastery = root._practicalProfile?.mastery;
    if (!mastery?.skills) throw new Error("missing practical mastery state");

    for (const skillId of ids) {
      const skill = mastery.skills[skillId];
      if (!skill) throw new Error(`missing Quick Start skill ${skillId}`);
      skill.evidenceStage = "RECOGNITION_TRAINED";
      skill.conceptTaught = true;
    }

    localStorage.setItem(key, JSON.stringify(root));
  }, { key: LEARNER_KEY, ids: QUICK_START_SKILLS });
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
