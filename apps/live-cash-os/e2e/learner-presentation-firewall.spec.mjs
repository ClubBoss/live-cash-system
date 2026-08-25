import { expect, test } from "@playwright/test";

const forbiddenPresentation = /(?:\bFTGU(?:[- ]?E)?\d+\b|\bLCM-\d+\b|\b(?:FND|PF|BL|OOP|IP|3BP|4BP|TURN|RIV|MW|DEEP|EXP)-\d{2}\b|\bPM-(?:[A-Z0-9]+-)+[A-Z0-9]+\b|\bHUMAN(?:_ASSISTED)?\b|canonical\s+Practical|exact\s+Practical\s+skill|sourceRefs|source[- ]backed|source\s+integrity|structured\s+canonical\s+binding|routing\s+inventory|980\s+indexed\s+scenarios|980\s+проиндексированн|\blegacy\b)/iu;

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

test("Reference and Real Hands keep internal metadata and migration history behind the learner presentation firewall in RU and EN", async ({ page }) => {
  await localOnly(page);

  await page.goto("/mastery/reference");
  const referenceMain = page.locator("main");
  await expectLearnerSafe(page);
  await expect(referenceMain).toContainText("Точные частоты здесь пока не установлены");
  await expect(referenceMain).toContainText("В этой группе много разных конфигураций");
  await expect(referenceMain).not.toContainText("980 проиндексированных сценариев");

  await referenceMain.getByRole("button", { name: "EN", exact: true }).click();
  await expectLearnerSafe(page);
  await expect(referenceMain).toContainText("Exact frequencies are not established here yet");
  await expect(referenceMain).toContainText("This reference family contains many distinct configurations");
  await expect(referenceMain).not.toContainText("980 indexed scenarios");

  await page.goto("/tools?tab=field");
  const toolsMain = page.locator("main");
  await expect(page.getByRole("navigation", { name: "Support tools" })).toBeVisible();
  await expectLearnerSafe(page);
  await expect(toolsMain).toContainText("practice topic");
  await expect(toolsMain).not.toContainText("exact Practical skill");

  await toolsMain.evaluate((main) => {
    const blockedNote = document.createElement("p");
    blockedNote.dataset.testid = "legacy-en-note-probe";
    blockedNote.textContent = "This legacy note cannot support transfer because it has no decision locked before the result.";
    main.append(blockedNote);

    const queuedRepair = document.createElement("p");
    queuedRepair.dataset.testid = "legacy-en-queue-probe";
    queuedRepair.textContent = "legacy mistake-practice tasks queued";
    main.append(queuedRepair);
  });
  await expect(page.getByTestId("legacy-en-note-probe")).toHaveText(
    "This note cannot support real-table transfer because the decision was not recorded before the result.",
  );
  await expect(page.getByTestId("legacy-en-queue-probe")).toHaveText("mistake-practice tasks to complete");
  await expectLearnerSafe(page);

  await toolsMain.getByRole("button", { name: "RU", exact: true }).click();
  await expectLearnerSafe(page);
  await expect(toolsMain).toContainText("точная тема для тренировки");
  await expect(toolsMain).not.toContainText("точным навыком Practical");

  await toolsMain.evaluate((main) => {
    const queuedRepair = document.createElement("p");
    queuedRepair.dataset.testid = "legacy-ru-queue-probe";
    queuedRepair.textContent = "legacy-заданий на работу над ошибкой";
    main.append(queuedRepair);
  });
  await expect(page.getByTestId("legacy-ru-queue-probe")).toHaveText("заданий на работу над ошибкой");
  await expectLearnerSafe(page);
});