import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "local V7 B3 causal-feedback fixture" }),
    });
  });
}

async function exposePf01(page) {
  await page.goto("/mastery/journey");
  let hasProfile = await page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY);
  if (!hasProfile) {
    await page.getByRole("button", { name: /Проверить на примере|Try an example/ }).click();
    await expect.poll(async () => page.evaluate((key) => Boolean(JSON.parse(localStorage.getItem(key) ?? "null")?._practicalProfile), LEARNER_KEY)).toBe(true);
    hasProfile = true;
  }
  expect(hasProfile).toBe(true);
  await page.evaluate(({ learnerKey, localeKey }) => {
    const raw = localStorage.getItem(learnerKey);
    if (!raw) throw new Error("learner state missing");
    const root = JSON.parse(raw);
    const mastery = root._practicalProfile?.mastery;
    const skill = mastery?.skills?.["PF-01"];
    if (!mastery || !skill) throw new Error("PF-01 practical profile missing after canonical profile initialization");
    skill.conceptTaught = true;
    mastery.revision += 1;
    mastery.updatedAt = new Date().toISOString();
    localStorage.setItem(learnerKey, JSON.stringify(root));
    localStorage.setItem(localeKey, "en");
  }, { learnerKey: LEARNER_KEY, localeKey: LOCALE_KEY });
  await page.goto("/mastery/perception");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
}

async function chooseFirstPairAndCommit(card, buttonName) {
  await card.locator("fieldset").nth(0).locator("input[type='radio']").first().check();
  await card.locator("fieldset").nth(1).locator("input[type='radio']").first().check();
  await card.getByRole("button", { name: buttonName }).click();
}

test("PF-01 changed node explains actual change -> strategic direction -> why in EN and RU", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await localOnly(page);
  await exposePf01(page);

  const baseline = page.locator("[data-practical-decision-id='PM-B3-PF01-101']");
  await expect(baseline).toBeVisible();
  await chooseFirstPairAndCommit(baseline, "Commit decision");
  await baseline.getByRole("button", { name: /Next table/ }).click();

  const changed = page.locator("[data-practical-decision-id='PM-B3-PF01-103']");
  await expect(changed).toBeVisible();
  await chooseFirstPairAndCommit(changed, "Commit decision");

  const mechanismEn = changed.locator("[data-practical-feedback-mechanism]");
  await expect(mechanismEn).toContainText("What changed:");
  await expect(mechanismEn).toContainText("Same hand moves BTN → HJ with more players behind.");
  await expect(mechanismEn).toContainText("Strategic consequence:");
  await expect(mechanismEn).toContainText("tighten/loosen only where context changes fringe EV");
  await expect(mechanismEn).toContainText("Why the action changes or stays:");
  await expect(mechanismEn).toContainText("opening charts as defaults whose fringe changes with position, players behind, rake and realization");
  await expect(changed.locator("[data-practical-correct-answer]")).toContainText("Correct action:");
  await expect(changed.locator("[data-practical-correct-answer]")).toContainText("Correct reason:");

  await page.evaluate((localeKey) => localStorage.setItem(localeKey, "ru"), LOCALE_KEY);
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");

  const changedRu = page.locator("[data-practical-decision-id='PM-B3-PF01-103']");
  await expect(changedRu).toBeVisible();
  const mechanismRu = changedRu.locator("[data-practical-feedback-mechanism]");
  await expect(mechanismRu).toContainText("Что изменилось:");
  await expect(mechanismRu).toContainText("Та же рука переходит с BTN на HJ, и позади остаётся больше игроков.");
  await expect(mechanismRu).toContainText("Стратегическое следствие:");
  await expect(mechanismRu).toContainText("меняй пограничные руки только там, где контекст действительно меняет их EV");
  await expect(mechanismRu).toContainText("Почему действие меняется или сохраняется:");
  await expect(mechanismRu).toContainText("пограничные руки меняются из-за позиции, игроков позади, рейка и реализации equity");
  await expect(changedRu.locator("[data-practical-correct-answer]")).toContainText("Правильное действие:");
  await expect(changedRu.locator("[data-practical-correct-answer]")).toContainText("Правильная причина:");
});
