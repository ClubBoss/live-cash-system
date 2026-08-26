import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";
const governedDefect = /marginal\s+hand|assumptions?|\bviable\b|future\s+action|\b(?:evidence|source|supported|learner|authoring|governance|fingerprint|decisionId|skillId)\b|\b(?:the|and|with|without|against|from|will|than|when|where|while|because|before|same|more|less|only|must|should|becomes|remain|remains|changes|increases|decreases)\b/iu;

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "V7 RU naturalness local fixture" }) });
  });
}

async function assertNaturalRussian(locator, surface) {
  await expect(locator).toBeVisible();
  const text = await locator.innerText();
  expect(text, `${surface} must render Russian learner copy`).toMatch(/[А-Яа-яЁё]/u);
  expect(text, `${surface} must not render the governed malformed/hybrid class`).not.toMatch(governedDefect);
}

async function quickStartExampleButton(page) {
  const button = page.getByRole("button", { name: /Проверить на примере|Try an example/ }).first();
  await expect(button).toBeVisible();
  return button;
}

async function ensurePracticalProfile(page) {
  const hasProfile = await page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY);
  if (!hasProfile) {
    await (await quickStartExampleButton(page)).click();
  }
  await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
}

async function enablePracticalSkills(page) {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    const mastery = state?._practicalProfile?.mastery;
    if (!mastery?.skills) throw new Error("missing practical mastery fixture");
    const now = new Date().toISOString();
    for (const skill of Object.values(mastery.skills)) {
      skill.conceptTaught = true;
      if (skill.evidenceStage === "SOURCE_SUPPORTED") skill.evidenceStage = "CONCEPT_TAUGHT";
      skill.conceptTaughtAt ??= now;
    }
    mastery.revision = (mastery.revision ?? 0) + 1;
    mastery.updatedAt = now;
    state.revision = (state.revision ?? 0) + 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, LEARNER_KEY);
}

async function answerCurrentPractical(page) {
  const card = page.locator("section.today-card[data-practical-decision-id]").first();
  await expect(card).toBeVisible();
  await card.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await card.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await card.getByRole("button", { name: /Ответить|Answer/ }).click();
  await expect(card.getByRole("heading", { name: /Верно|Нужно исправить|Correct|Repair needed/ })).toBeVisible();
  return card;
}

test.beforeEach(async ({ page }) => {
  await localOnly(page);
  await page.addInitScript(({ localeKey }) => localStorage.setItem(localeKey, "ru"), { localeKey: LOCALE_KEY });
});

test("V7 post-blind RU publication is natural across the five canonical learner surfaces", async ({ page }) => {
  // Quick Start.
  await page.goto("/mastery/journey");
  await ensurePracticalProfile(page);
  await page.goto("/mastery/journey");
  await assertNaturalRussian(page.locator("main"), "Quick Start");

  // Practical feedback through the canonical focused-session route.
  await enablePracticalSkills(page);
  await page.goto("/mastery/session?focus=BL-02");
  const feedbackCard = await answerCurrentPractical(page);
  await assertNaturalRussian(feedbackCard, "Practical feedback");

  // Focused Table Reading.
  await page.goto("/mastery/perception");
  await assertNaturalRussian(page.locator("main"), "Table Reading");
  await expect(page.locator("section.surface[data-practical-decision-id]").first()).toBeVisible();

  // Mastery/progress.
  await page.goto("/mastery");
  await assertNaturalRussian(page.locator("main"), "Mastery/progress");

  // Real Hands.
  await page.goto("/tools?tab=field");
  await expect(page.getByTestId("real-hand-moduleId")).toBeVisible();
  await assertNaturalRussian(page.locator("main"), "Real Hands");
});
