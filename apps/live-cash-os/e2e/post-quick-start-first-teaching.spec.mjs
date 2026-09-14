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

async function ensurePracticalProfile(page) {
  const hasProfile = await page.evaluate(
    (key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile),
    LEARNER_KEY,
  );
  if (hasProfile) return;

  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect.poll(async () => page.evaluate(
    (key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile),
    LEARNER_KEY,
  )).toBe(true);
}

async function setQuickStartDecisionTrained(page) {
  await reachPersistedSkillTargets(
    page,
    LEARNER_KEY,
    QUICK_START_SKILLS.map((skillId) => ({ skillId, targetStage: "DECISION_TRAINED" })),
  );
  await page.reload();
  await expect(page.locator("main")).toBeVisible();
}

async function masterySnapshot(page) {
  return page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key) ?? "null");
    if (!root?._practicalProfile?.mastery) throw new Error("missing practical mastery snapshot");
    return root._practicalProfile.mastery;
  }, LEARNER_KEY);
}

for (const fixture of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "mobile-390", width: 390, height: 844 },
]) {
  test(`post-QS first teaching edge is explicit and focused on ${fixture.name}`, async ({ page }) => {
    await page.setViewportSize({ width: fixture.width, height: fixture.height });
    await page.route("**/api/state", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({ error: "post-QS teaching fixture" }),
      });
    });

    await page.goto("/mastery/journey");
    await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
    await page.reload();
    await expect(page.locator("main")).toContainText(/ШАГ 1 ИЗ 8|STEP 1 OF 8/);
    await ensurePracticalProfile(page);
    await setQuickStartDecisionTrained(page);

    await expect(page.getByRole("heading", { name: /Быстрый старт завершён|Quick start complete/ })).toBeVisible();
    await expect(page.locator("main")).toContainText("8/8");
    await expect(page.locator("main")).toContainText(/Это не означает полное освоение|This is not full mastery/);

    await page.locator("main").getByRole("link", { name: /Продолжить обучение →|Continue learning →/ }).click();
    await expect(page).toHaveURL(/\/mastery\/journey\?continue=1$/);
    await expect(page.locator("main")).toContainText(/ПОСЛЕ БЫСТРОГО СТАРТА|AFTER QUICK START/);
    await expect(page.locator("main")).toContainText(/МЕХАНИЗМ|MECHANISM/);
    await expect(page.getByRole("button", { name: /Проверить на примере|Try an example/ })).toBeVisible();

    await page.reload();
    await expect(page).toHaveURL(/\/mastery\/journey\?continue=1$/);
    await expect(page.locator("main")).toContainText(/ПОСЛЕ БЫСТРОГО СТАРТА|AFTER QUICK START/);

    await page.goBack();
    await expect(page).toHaveURL(/\/mastery\/journey$/);
    await expect(page.getByRole("heading", { name: /Быстрый старт завершён|Quick start complete/ })).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/mastery\/journey\?continue=1$/);
    await expect(page.locator("main")).toContainText(/ПОСЛЕ БЫСТРОГО СТАРТА|AFTER QUICK START/);
    await expect(page.locator("main")).toContainText(/МЕХАНИЗМ|MECHANISM/);
    await expect(page.getByRole("button", { name: /Проверить на примере|Try an example/ })).toBeVisible();

    const beforeView = await masterySnapshot(page);
    await page.waitForTimeout(50);
    const afterView = await masterySnapshot(page);
    expect(afterView).toEqual(beforeView);

    const attemptsBefore = beforeView.attempts.length;
    const taughtBefore = new Set(
      Object.entries(beforeView.skills).filter(([, progress]) => progress.conceptTaught).map(([skillId]) => skillId),
    );

    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
    await expect(page).toHaveURL(/\/mastery\/session\?focus=[^&]+$/);
    await expect(page.locator('input[type="radio"]').first()).toBeVisible();

    const afterStart = await masterySnapshot(page);
    const newlyTaught = Object.entries(afterStart.skills)
      .filter(([skillId, progress]) => !taughtBefore.has(skillId) && progress.conceptTaught)
      .map(([skillId]) => skillId);
    expect(newlyTaught).toHaveLength(1);

    const focusSkillId = new URL(page.url()).searchParams.get("focus");
    expect(focusSkillId).toBe(newlyTaught[0]);
    expect(afterStart.skills[focusSkillId].evidenceStage).toBe("CONCEPT_TAUGHT");
    expect(afterStart.attempts).toHaveLength(attemptsBefore);
    expect(QUICK_START_SKILLS).not.toContain(focusSkillId);
  });
}


test("new source-bounded teaching is rendered before FND-04 practice", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "post-QS FND-04 teaching fixture" }),
    });
  });

  await page.goto("/mastery/journey");
  await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
  await page.reload();
  await ensurePracticalProfile(page);
  await setQuickStartDecisionTrained(page);

  const before = await masterySnapshot(page);
  expect(before.skills["FND-04"].conceptTaught).toBe(false);

  await page.goto("/mastery/journey?focus=FND-04");
  await expect(page).toHaveURL(/\/mastery\/journey\?focus=FND-04$/);
  await expect(page.locator("main")).toContainText(/Ситуация:|Situation:/);
  await expect(page.locator("main")).toContainText(/Граница:|Boundary:/);
  await expect(page.locator("main")).toContainText(/чистые ауты|clean outs/i);

  const stillUntaught = await masterySnapshot(page);
  expect(stillUntaught.skills["FND-04"].conceptTaught).toBe(false);
  expect(stillUntaught.attempts).toHaveLength(before.attempts.length);

  await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
  await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-04$/);
  await expect(page.locator('input[type="radio"]').first()).toBeVisible();

  const after = await masterySnapshot(page);
  expect(after.skills["FND-04"].conceptTaught).toBe(true);
  expect(after.skills["FND-04"].evidenceStage).toBe("CONCEPT_TAUGHT");
  expect(after.attempts).toHaveLength(before.attempts.length);
});
