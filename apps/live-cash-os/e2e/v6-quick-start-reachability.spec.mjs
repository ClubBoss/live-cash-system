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
const COMPLETE_HEADING = /Быстрый старт завершён|Quick start complete/;
const BLOCKED_COPY = /Сейчас нет следующего допустимого шага|There is no currently admissible next Quick Start step/;

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
  await expect(page.locator("main")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "V6 fresh Quick Start fixture" }),
    });
  });
});

test("V6: recognition-level Quick Start state exposes every canonical next step and completes 8/8", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.evaluate((key) => localStorage.removeItem(key), LEARNER_KEY);
  await page.reload();
  await ensurePracticalProfile(page);

  for (let reached = 0; reached < QUICK_START_SKILLS.length; reached += 1) {
    await setReached(page, reached);
    const step = reached + 1;
    await expect(page.locator("main")).toContainText(new RegExp(`(?:ШАГ ${step} ИЗ 8|STEP ${step} OF 8)`));
    await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toHaveCount(0);
    await expect(page.locator("main")).not.toContainText(BLOCKED_COPY);
  }

  await setReached(page, QUICK_START_SKILLS.length);
  await expect(page.getByRole("heading", { name: COMPLETE_HEADING })).toBeVisible();
  await expect(page.locator("main")).toContainText("8/8");
  await expect(page.locator("main")).not.toContainText(BLOCKED_COPY);
});
