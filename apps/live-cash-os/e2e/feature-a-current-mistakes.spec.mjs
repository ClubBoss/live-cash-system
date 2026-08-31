import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function rootFeatureASnapshot(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const root = JSON.parse(raw);
    return JSON.stringify({
      revision: root.revision,
      updatedAt: root.updatedAt,
      mastery: root._practicalProfile?.mastery ?? null,
      attempts: root._practicalProfile?.mastery?.attempts ?? null,
      studyWorkspace: root._practicalProfile?.studyWorkspace ?? null,
    });
  }, LEARNER_KEY);
}

test("Feature A existing Current Mistakes surface uses exact misconception evidence without browsing mutation", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.route("**/api/state", async (route) => route.fulfill({
    status: 401,
    contentType: "application/json",
    body: JSON.stringify({ error: "feature-a local fixture" }),
  }));

  // Let the canonical app create a valid Practical profile first, then add one
  // durable attempt fixture using a real current-corpus double-tag decision.
  await page.goto("/mastery");
  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return false;
    return Boolean(JSON.parse(raw)._practicalProfile?.mastery);
  }, LEARNER_KEY)).toBe(true);

  await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("missing learner state");
    const root = JSON.parse(raw);
    const mastery = root._practicalProfile.mastery;
    const answeredAt = "2026-09-01T00:00:00.000Z";
    const attemptId = `PM-BL-01-102:feature-a-e2e:${answeredAt}`;
    mastery.attempts.push({
      id: attemptId,
      decisionId: "PM-BL-01-102",
      skillId: "BL-01",
      actionId: "b",
      reasonId: "r3",
      confidence: 90,
      correct: false,
      answeredAt,
    });
    mastery.revision += 1;
    mastery.updatedAt = answeredAt;
    const progress = mastery.skills["BL-01"];
    progress.attempts += 1;
    progress.lastAttemptAt = answeredAt;
    progress.lastIncorrectDecisionId = "PM-BL-01-102";
    localStorage.setItem(key, JSON.stringify(root));
  }, LEARNER_KEY);

  await page.goto("/mastery/study");
  await expect(page.getByRole("heading", { name: "Что нужно исправить сейчас", exact: true })).toBeVisible();
  const currentMistakes = page.locator("section.surface").filter({ hasText: "ТЕКУЩИЕ ОШИБКИ" });
  await expect(currentMistakes).toHaveCount(1);
  await expect(currentMistakes.locator(".today-card")).toHaveCount(1);
  await expect(currentMistakes.getByText("Где сбой", { exact: false })).toBeVisible();
  await expect(currentMistakes).toContainText("Эта ошибка сейчас не закрыта");
  await expect(currentMistakes).not.toContainText("Эта ошибка повторяется");
  await expect(currentMistakes).not.toContainText(/PM-BL-01-102|BL-01|PRICE_ONLY|SKILL:/);

  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);

  const beforeBrowse = await rootFeatureASnapshot(page);
  expect(beforeBrowse).not.toBeNull();

  await page.reload();
  await expect(page.getByRole("heading", { name: "Что нужно исправить сейчас", exact: true })).toBeVisible();
  await expect(currentMistakes.locator(".today-card")).toHaveCount(1);
  expect(await rootFeatureASnapshot(page)).toBe(beforeBrowse);

  await page.getByRole("button", { name: "EN", exact: true }).first().click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: "What needs repair now", exact: true })).toBeVisible();
  await expect(currentMistakes).toContainText("This mistake is currently unresolved");
  await expect(currentMistakes).not.toContainText("This mistake is repeating");
  await expect(currentMistakes).not.toContainText(/PM-BL-01-102|BL-01|PRICE_ONLY|SKILL:/);

  expect(await rootFeatureASnapshot(page)).toBe(beforeBrowse);
});
