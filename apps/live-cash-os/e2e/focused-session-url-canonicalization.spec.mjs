import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const FOCUS_ID = "FND-01";

async function learnerState(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, LEARNER_KEY);
}

function evidenceSnapshot(state) {
  return JSON.stringify({
    modules: state.modules,
    interactions: state.interactions,
    reviewQueue: state.reviewQueue,
    fieldNotes: state.fieldNotes,
    diagnostic: state.diagnostic,
    activeSession: state.activeSession,
    practicalMastery: state._practicalProfile?.mastery,
    practicalPerformance: state._practicalProfile?.performance,
  });
}

function expectFreshGenericContinuity(state) {
  const integrated = state?._practicalProfile?.studyWorkspace?.continuity?.integrated;
  expect(integrated).toBeTruthy();
  expect(integrated.focusSkillId).toBeNull();
  expect(integrated.nextIndex).toBe(0);
  expect(integrated.submittedAttemptIds).toEqual([]);
  expect(integrated.items.length).toBeGreaterThan(0);
  expect(integrated.items.length).toBeLessThanOrEqual(8);
}

async function finishCurrentRound(page) {
  const skillLabels = [];
  let scored = 0;
  for (let step = 0; step < 12; step += 1) {
    if (await page.getByRole("heading", { name: "Раунд завершён", exact: true }).isVisible().catch(() => false)) return { scored, skillLabels };

    const card = page.locator("section.today-card[data-practical-decision-id]");
    await expect(card).toBeVisible();
    await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
    await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
    await card.getByRole("button", { name: /Ответить/ }).click();
    const skillLine = card.locator(".today-card").filter({ hasText: "Навык:" }).locator("p").filter({ hasText: "Навык:" }).first();
    await expect(skillLine).toBeVisible();
    skillLabels.push((await skillLine.innerText()).replace(/^Навык:\s*/u, "").trim());
    scored += 1;
    await card.getByRole("button", { name: /Следующее решение/ }).click();
  }

  throw new Error("Focused round did not complete within the bounded session size");
}

test("explicit generic continuation replaces stale focused continuity without mastery, evidence, or history resurrection", async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local focused-url fixture" }) });
  });

  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере/ }).click();
  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught : false;
  }, LEARNER_KEY)).toBe(true);

  await page.goto("/mastery");
  await page.goto(`/mastery/session?focus=${FOCUS_ID}&source=url-regression#focused-session`);
  await expect(page).toHaveURL(new RegExp(`/mastery/session\\?focus=${FOCUS_ID}&source=url-regression#focused-session$`));
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();

  const focusedRound = await finishCurrentRound(page);
  expect(focusedRound.scored).toBe(8);
  expect(new Set(focusedRound.skillLabels).size).toBe(1);
  const beforeCleanup = await learnerState(page);
  expect(beforeCleanup).not.toBeNull();
  const beforeEvidence = evidenceSnapshot(beforeCleanup);

  await page.getByRole("button", { name: /^Продолжить обучение/ }).click();
  await expect(page).toHaveURL(/\/mastery\/session\?source=url-regression#focused-session$/);
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();
  const afterCleanup = await learnerState(page);
  expect(evidenceSnapshot(afterCleanup)).toBe(beforeEvidence);
  expectFreshGenericContinuity(afterCleanup);

  await page.reload();
  await expect(page).toHaveURL(/\/mastery\/session\?source=url-regression#focused-session$/);
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  await expect(page.locator("section.today-card[data-practical-decision-id]")).toBeVisible();
  const afterReload = await learnerState(page);
  expect(evidenceSnapshot(afterReload)).toBe(beforeEvidence);
  expectFreshGenericContinuity(afterReload);

  await page.goBack();
  await expect(page).toHaveURL(/\/mastery$/);
  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/session\?source=url-regression#focused-session$/);
  expect(new URL(page.url()).searchParams.has("focus")).toBe(false);
  await expect(page.locator("main")).not.toContainText("ВЫБРАННЫЙ ФОКУС");
});
