import { expect, test } from "@playwright/test";

const forbiddenPresentation = /(?:\bFTGU(?:[- ]?E)?\d+\b|\bLCM-\d+\b|\b(?:FND|PF|BL|OOP|IP|3BP|4BP|TURN|RIV|MW|DEEP|EXP)-\d{2}\b|\bPM-(?:[A-Z0-9]+-)+[A-Z0-9]+\b|\bHUMAN(?:_ASSISTED)?\b|canonical\s+Practical|exact\s+Practical\s+skill|sourceRefs|source[- ]backed|source\s+integrity|structured\s+canonical\s+binding|routing\s+inventory|980\s+indexed\s+scenarios|980\s+проиндексированн)/iu;

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "local learner-presentation fixture" }),
    });
  });
}

async function expectLearnerSafe(page) {
  const main = page.locator("main");
  await expect(main).toBeVisible();
  await expect.poll(async () => main.innerText()).not.toMatch(forbiddenPresentation);
}

test("Reference and Real Hands keep internal metadata behind the learner presentation firewall in RU and EN", async ({ page }) => {
  await localOnly(page);

  await page.goto("/mastery/reference");
  await expectLearnerSafe(page);
  await expect(page.locator("main")).toContainText("Точные частоты здесь пока не установлены");
  await expect(page.locator("main")).toContainText("В этой группе много разных конфигураций");
  await expect(page.locator("main")).not.toContainText("980 проиндексированных сценариев");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expectLearnerSafe(page);
  await expect(page.locator("main")).toContainText("Exact frequencies are not established here yet");
  await expect(page.locator("main")).toContainText("This reference family contains many distinct configurations");
  await expect(page.locator("main")).not.toContainText("980 indexed scenarios");

  await page.goto("/tools?tab=field");
  await expect(page.getByRole("navigation", { name: "Support tools" })).toBeVisible();
  await expectLearnerSafe(page);
  await expect(page.locator("main")).toContainText("practice topic");
  await expect(page.locator("main")).not.toContainText("exact Practical skill");

  await page.getByRole("button", { name: "RU", exact: true }).click();
  await expectLearnerSafe(page);
  await expect(page.locator("main")).toContainText("точная тема для тренировки");
  await expect(page.locator("main")).not.toContainText("точным навыком Practical");
});
