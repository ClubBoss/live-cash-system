import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function useLocalWaveDFixture(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local V4 Wave D E-02 fixture" }) });
  });
}

async function ensurePracticalProfile(page) {
  await page.goto("/mastery/journey");
  const hasProfile = await page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY);
  if (!hasProfile) await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
}

function selectedSkillSurface(page) {
  return page.locator("section.surface").filter({ has: page.getByText(/ВЫБРАННЫЙ НАВЫК|SELECTED SKILL/, { exact: true }) }).last();
}

async function selectedSkillTitle(page) {
  const surface = selectedSkillSurface(page);
  await expect(surface).toBeVisible();
  return surface.locator("h1").first().innerText();
}

async function currentSkillMapCursor(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.studyWorkspace?.continuity?.skillMap?.skillId ?? null : null;
  }, LEARNER_KEY);
}

async function masterySnapshot(page) {
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

test("V4-D E-02 Skill Map selection survives ordinary continuity, fails closed, and preserves C learner-safe source-gap copy", async ({ page }) => {
  await useLocalWaveDFixture(page);
  await ensurePracticalProfile(page);
  await page.goto("/mastery");

  const defaultTitle = await selectedSkillTitle(page);
  await expect.poll(() => currentSkillMapCursor(page)).not.toBeNull();
  const defaultSkillId = await currentSkillMapCursor(page);
  const masteryBefore = await masterySnapshot(page);
  const attemptsBefore = await attemptCount(page);

  await page.getByRole("button", { name: /^RFI по позиции ·/ }).click();
  await expect(selectedSkillSurface(page).getByRole("heading", { name: "RFI по позиции", exact: true })).toBeVisible();
  await expect.poll(() => currentSkillMapCursor(page)).toBe("PF-01");

  await page.reload();
  await expect(selectedSkillSurface(page).getByRole("heading", { name: "RFI по позиции", exact: true })).toBeVisible();
  expect(await masterySnapshot(page)).toBe(masteryBefore);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.goto("/mastery/journey");
  await page.goto("/mastery");
  await expect(selectedSkillSurface(page).getByRole("heading", { name: "RFI по позиции", exact: true })).toBeVisible();
  expect(await masterySnapshot(page)).toBe(masteryBefore);

  await page.goto("/mastery/journey");
  await page.goBack();
  await expect(page).toHaveURL(/\/mastery$/);
  await expect(selectedSkillSurface(page).getByRole("heading", { name: "RFI по позиции", exact: true })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await page.goBack();
  await expect(selectedSkillSurface(page).getByRole("heading", { name: "RFI по позиции", exact: true })).toBeVisible();
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.getByRole("button", { name: /BvB 3-bet pots/ }).first().click();
  const main = page.getByRole("main");
  await main.getByRole("button", { name: "EN", exact: true }).click();
  await expect(main).not.toContainText("POSITIVE_EV_SOURCE_ACCESS_REQUIRED");
  await expect(main).not.toContainText(/\bB1\b/);
  await expect(main).toContainText(/Dedicated SB-vs-BB 3-bet-pot strategy needs a more inspectable source/i);
  expect(await masterySnapshot(page)).toBe(masteryBefore);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.evaluate(({ key }) => {
    const learner = JSON.parse(localStorage.getItem(key));
    learner._practicalProfile.studyWorkspace.continuity.contentVersion = "stale-v4-wave-d-e02";
    learner._practicalProfile.studyWorkspace.continuity.skillMap = { skillId: "UNKNOWN-SKILL", updatedAt: new Date().toISOString() };
    learner.revision += 1;
    learner.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(learner));
  }, { key: LEARNER_KEY });
  await page.reload();
  expect(await selectedSkillTitle(page)).toBe(defaultTitle);
  await expect.poll(() => currentSkillMapCursor(page)).toBe(defaultSkillId);
  expect(await masterySnapshot(page)).toBe(masteryBefore);
  expect(await attemptCount(page)).toBe(attemptsBefore);

  await page.evaluate(({ key }) => {
    const learner = JSON.parse(localStorage.getItem(key));
    learner._practicalProfile.studyWorkspace.continuity.contentVersion = learner._practicalProfile.mastery.contentVersion;
    learner._practicalProfile.studyWorkspace.continuity.skillMap = { skillId: "UNKNOWN-SKILL", updatedAt: new Date().toISOString() };
    learner.revision += 1;
    learner.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(learner));
  }, { key: LEARNER_KEY });
  await page.reload();
  expect(await selectedSkillTitle(page)).toBe(defaultTitle);
  await expect.poll(() => currentSkillMapCursor(page)).toBe(defaultSkillId);
  expect(await masterySnapshot(page)).toBe(masteryBefore);
  expect(await attemptCount(page)).toBe(attemptsBefore);
});
