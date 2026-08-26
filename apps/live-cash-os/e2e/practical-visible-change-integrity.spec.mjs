import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "local visible-change fixture" }),
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
  await page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) throw new Error("learner state missing");
    const root = JSON.parse(raw);
    const mastery = root._practicalProfile?.mastery;
    const skill = mastery?.skills?.["PF-01"];
    if (!mastery || !skill) throw new Error("PF-01 practical profile missing after canonical profile initialization");
    skill.conceptTaught = true;
    mastery.revision += 1;
    mastery.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(root));
  }, LEARNER_KEY);
  await page.goto("/mastery/perception");
}

test("PF-01 changed learner stimulus visibly carries BTN -> HJ and players-behind Before/Now", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  await localOnly(page);
  await exposePf01(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();

  const baseline = page.locator("[data-practical-decision-id='PM-B3-PF01-101']");
  await expect(baseline).toBeVisible();
  await baseline.locator("fieldset").nth(0).locator("input[type='radio']").first().check();
  await baseline.locator("fieldset").nth(1).locator("input[type='radio']").first().check();
  await baseline.getByRole("button", { name: "Commit decision" }).click();
  await baseline.getByRole("button", { name: /Next table/ }).click();

  const changed = page.locator("[data-practical-decision-id='PM-B3-PF01-103']");
  await expect(changed).toBeVisible();
  const comparison = changed.getByLabel("poker table comparison");
  await expect(comparison).toBeVisible();

  const before = comparison.locator('section[aria-label="Before change"]');
  const now = comparison.locator('section[aria-label="After change"]');
  await expect(before).toContainText("BTN · HERO");
  await expect(before).toContainText("Folds to BTN");
  await expect(now).toContainText("HJ · HERO");
  await expect(now).toContainText("Folds to HJ");
  await expect(now).toContainText("CO");
  await expect(now).toContainText("BTN");
  await expect(changed).not.toContainText("The same hand family is now earlier with more players behind.");
  await expect(changed).not.toContainText("WHAT THIS TESTED");
});
