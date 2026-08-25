import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function useLocalWaveDFixture(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local V4 Wave D fixture" }) });
  });
}

async function patchPracticalSkills(page, patches) {
  await page.goto("/mastery/journey");
  const hasProfile = await page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY);
  if (!hasProfile) {
    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  }
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
  await page.evaluate(({ key, patches: skillPatches }) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("missing learner fixture");
    const learner = JSON.parse(raw);
    const mastery = learner._practicalProfile?.mastery;
    if (!mastery) throw new Error("missing practical mastery fixture");
    const now = new Date().toISOString();
    for (const [skillId, patch] of Object.entries(skillPatches)) {
      const progress = mastery.skills?.[skillId];
      if (!progress) throw new Error(`missing practical skill ${skillId}`);
      Object.assign(progress, patch, { conceptTaughtAt: patch.conceptTaught ? now : progress.conceptTaughtAt });
    }
    mastery.revision += 1;
    mastery.updatedAt = now;
    learner.revision += 1;
    learner.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(learner));
  }, { key: LEARNER_KEY, patches });
  await page.reload();
}

async function masteryAttemptCount(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts?.length ?? 0 : 0;
  }, LEARNER_KEY);
}

async function latestAttempt(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    const attempts = raw ? JSON.parse(raw)._practicalProfile?.mastery?.attempts ?? [] : [];
    return attempts.at(-1) ?? null;
  }, LEARNER_KEY);
}

async function activePerceptualDecisionId(page) {
  const card = page.locator("section.surface[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  return card.getAttribute("data-practical-decision-id");
}

async function answerPerceptualCard(page) {
  const card = page.locator("section.surface[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await card.getByRole("button", { name: /Зафиксировать решение|Commit decision/ }).click();
  await expect(card.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
}

async function currentPerceptualCursor(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.studyWorkspace?.continuity?.perceptual?.decisionId ?? null : null;
  }, LEARNER_KEY);
}

async function answerIntegratedCard(page) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await card.getByRole("button", { name: /Ответить|Answer/ }).click();
  await expect(card.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
  return card;
}

test("V4-D Table Reading keeps the same active item across reload, focused-Practical history, and stale cursor recovery without duplicate evidence", async ({ page }) => {
  await useLocalWaveDFixture(page);
  await patchPracticalSkills(page, {
    "FND-06": { conceptTaught: true, evidenceStage: "CONCEPT_TAUGHT" },
  });

  await page.goto("/mastery/perception");
  const firstId = await activePerceptualDecisionId(page);
  expect(firstId).toBeTruthy();
  await answerPerceptualCard(page);
  const attemptsAfterAnswer = await masteryAttemptCount(page);
  expect(attemptsAfterAnswer).toBe(1);

  await page.getByRole("button", { name: /Следующий стол|Next table/ }).click();
  const secondId = await activePerceptualDecisionId(page);
  expect(secondId).toBeTruthy();
  expect(secondId).not.toBe(firstId);
  await expect.poll(() => currentPerceptualCursor(page)).toBe(secondId);

  await page.reload();
  expect(await activePerceptualDecisionId(page)).toBe(secondId);
  expect(await masteryAttemptCount(page)).toBe(attemptsAfterAnswer);

  await page.goto("/mastery/session?focus=FND-06&source=v4-wave-d#table-reading");
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();
  await page.goBack();
  await expect(page).toHaveURL(/\/mastery\/perception$/);
  expect(await activePerceptualDecisionId(page)).toBe(secondId);
  expect(await masteryAttemptCount(page)).toBe(attemptsAfterAnswer);

  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-06&source=v4-wave-d#table-reading$/);
  await page.goBack();
  expect(await activePerceptualDecisionId(page)).toBe(secondId);
  expect(await masteryAttemptCount(page)).toBe(attemptsAfterAnswer);

  await page.evaluate(({ key, oldDecisionId }) => {
    const learner = JSON.parse(localStorage.getItem(key));
    const continuity = learner._practicalProfile.studyWorkspace.continuity;
    continuity.contentVersion = "stale-v4-wave-d-content";
    continuity.perceptual = { decisionId: oldDecisionId, updatedAt: new Date().toISOString() };
    learner.revision += 1;
    learner.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(learner));
  }, { key: LEARNER_KEY, oldDecisionId: firstId });

  await page.reload();
  expect(await activePerceptualDecisionId(page)).toBe(secondId);
  expect(await masteryAttemptCount(page)).toBe(attemptsAfterAnswer);
  await expect.poll(() => currentPerceptualCursor(page)).toBe(secondId);
});

test("V4-D focused PF-01 session shows canonical RU/EN learner title while all eight scored items stay PF-01 and generic presentation stays generic", async ({ page }) => {
  await useLocalWaveDFixture(page);
  await patchPracticalSkills(page, {
    "FND-06": { conceptTaught: true, evidenceStage: "DECISION_TRAINED" },
    "PF-01": { conceptTaught: true, evidenceStage: "CONCEPT_TAUGHT" },
  });

  await page.goto("/mastery/session?source=v4-wave-d-generic");
  const genericEyebrow = page.locator("section.hero .eyebrow").first();
  await expect(genericEyebrow).toHaveText(/^ПРАКТИКА · 1\/\d+$/);
  await expect(genericEyebrow).not.toContainText("RFI по позиции");

  await page.goto("/mastery/session?focus=PF-01&source=v4-wave-d#focus-copy");
  const focusEyebrow = page.locator("section.hero .eyebrow").first();
  await expect(focusEyebrow).toHaveText("ПРАКТИКА · RFI по позиции · 1/8");
  await expect(page.locator("main")).not.toContainText("PF-01");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(focusEyebrow).toHaveText("PRACTICE · RFI by position · 1/8");
  await expect(page.locator("main")).not.toContainText("PF-01");
  await page.getByRole("button", { name: "RU", exact: true }).click();

  const scoredSkillIds = [];
  for (let index = 0; index < 8; index += 1) {
    await expect(focusEyebrow).toHaveText(`ПРАКТИКА · RFI по позиции · ${index + 1}/8`);
    const card = await answerIntegratedCard(page);
    await expect(card).toContainText("Навык: RFI по позиции");
    await expect(card).not.toContainText("PF-01");
    const attempt = await latestAttempt(page);
    expect(attempt).toBeTruthy();
    scoredSkillIds.push(attempt.skillId);
    expect(attempt.skillId).toBe("PF-01");
    if (index < 7) await card.getByRole("button", { name: /Следующее решение|Next decision/ }).click();
  }
  expect(scoredSkillIds).toHaveLength(8);
  expect(new Set(scoredSkillIds)).toEqual(new Set(["PF-01"]));

  const attemptsAfterFocusedRound = await masteryAttemptCount(page);
  await page.goto("/mastery/session?focus=NOT-A-SKILL&source=v4-wave-d#unavailable");
  await expect(page.getByRole("heading", { name: /Этот навык пока недоступен|This skill is not available yet/ })).toBeVisible();
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toHaveCount(0);
  expect(await masteryAttemptCount(page)).toBe(attemptsAfterFocusedRound);
});
