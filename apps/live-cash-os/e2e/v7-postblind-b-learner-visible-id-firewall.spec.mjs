import { expect, test } from "@playwright/test";

const BARE_EVIDENCE_ID = /\bE\d{2,}\b/u;

async function chooseFirstPairAndAnswer(card, buttonName) {
  await card.locator("fieldset").nth(0).locator("input[type='radio']").first().check();
  await card.locator("fieldset").nth(1).locator("input[type='radio']").first().check();
  await card.getByRole("button", { name: buttonName }).click();
}

async function expectNoOpaqueEvidenceId(page, routeLabel, locale) {
  const main = page.getByRole("main");
  const text = await main.innerText();
  expect(text, `${routeLabel} ${locale} must not publish bare evidence/curriculum IDs`).not.toMatch(BARE_EVIDENCE_ID);
}

async function expectCausalFeedbackPreserved(page, routeLabel, locale) {
  const mechanism = page.locator("[data-practical-feedback-mechanism]").last();
  await expect(mechanism).toBeVisible();
  const text = (await mechanism.innerText()).trim();
  expect(text.length, `${routeLabel} ${locale} causal feedback must remain substantive`).toBeGreaterThan(30);
  expect(text, `${routeLabel} ${locale} causal feedback must not publish a bare evidence ID`).not.toMatch(BARE_EVIDENCE_ID);
  console.log(`V7_POSTBLIND_B_BROWSER route=${routeLabel} locale=${locale} mechanism_chars=${text.length} residual=0`);
}

async function switchMainLocale(page, locale) {
  const main = page.getByRole("main");
  await main.getByRole("button", { name: locale.toUpperCase(), exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
}

test.beforeEach(async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "V7 post-blind B browser proof is fixed to canonical Chromium");
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "local V7 post-blind B learner-ID firewall fixture" }),
    });
  });
});

test("Quick Start and adaptive practice publish causal feedback without bare evidence IDs in EN and RU", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });

  await page.goto("/mastery/journey");
  await switchMainLocale(page, "en");
  await expectNoOpaqueEvidenceId(page, "quick-start-pre-answer", "en");

  await page.getByRole("button", { name: "Try an example" }).click();
  const quickAnswer = page.getByRole("button", { name: "Answer", exact: true }).last();
  await expect(quickAnswer).toBeVisible();
  const quickCard = quickAnswer.locator("xpath=ancestor::section[contains(@class,'today-card')][1]");
  await expectNoOpaqueEvidenceId(page, "quick-start-pre-answer", "en");
  await chooseFirstPairAndAnswer(quickCard, "Answer");
  await expectCausalFeedbackPreserved(page, "quick-start", "en");
  await expectNoOpaqueEvidenceId(page, "quick-start", "en");

  await switchMainLocale(page, "ru");
  await expectCausalFeedbackPreserved(page, "quick-start", "ru");
  await expectNoOpaqueEvidenceId(page, "quick-start", "ru");

  await switchMainLocale(page, "en");
  await page.goto("/mastery/session");
  await expect(page.locator("[data-practical-decision-id]")).toBeVisible();
  const adaptiveCard = page.locator("[data-practical-decision-id]").first();
  await expectNoOpaqueEvidenceId(page, "adaptive-practice-pre-answer", "en");
  await chooseFirstPairAndAnswer(adaptiveCard, "Answer");
  await expectCausalFeedbackPreserved(page, "adaptive-practice", "en");
  await expectNoOpaqueEvidenceId(page, "adaptive-practice", "en");

  await switchMainLocale(page, "ru");
  await expectCausalFeedbackPreserved(page, "adaptive-practice", "ru");
  await expectNoOpaqueEvidenceId(page, "adaptive-practice", "ru");
});
