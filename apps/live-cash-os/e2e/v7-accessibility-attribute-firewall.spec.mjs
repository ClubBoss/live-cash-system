import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";
const forbiddenAccessibility = /(?:\bFTGU(?:[- ]?E)?\d+\b|\bLCM-\d+\b|\b(?:FND|PF|BL|OOP|IP|3BP|4BP|TURN|RIV|MW|DEEP|EXP)-\d{2}\b|\bPM-(?:[A-Z0-9]+-)+[A-Z0-9]+\b|\bHUMAN(?:_ASSISTED)?\b|canonical\s+Practical|exact\s+Practical\s+skill|sourceRefs|source[- ]backed|source\s+integrity|structured\s+canonical\s+binding|routing\s+inventory|\blegacy\b|\b(?:explain|field|review)-\d{10,}-[a-z0-9]{5,}\b)/iu;
const auditedAttributes = ["aria-label", "aria-description", "title", "alt"];

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "V7 D local accessibility fixture" }),
    });
  });
}

async function learnerAttributeCensus(page) {
  return page.locator("main").evaluate((main, attributes) => {
    const rows = [];
    for (const element of [main, ...main.querySelectorAll("*")]) {
      for (const attribute of attributes) {
        const value = element.getAttribute(attribute);
        if (value !== null) rows.push({ attribute, value, tag: element.tagName.toLowerCase() });
      }
    }
    return rows;
  }, auditedAttributes);
}

async function expectZeroLearnerAttributeLeaks(page) {
  await expect.poll(async () => {
    const rows = await learnerAttributeCensus(page);
    return rows.filter(({ value }) => forbiddenAccessibility.test(value));
  }).toEqual([]);
}

async function createOneRealHand(page) {
  await page.getByTestId("real-hand-moduleId").selectOption({ index: 1 });
  await page.getByTestId("real-hand-stakes").fill("2/5");
  await page.getByTestId("real-hand-heroPosition").fill("BTN");
  await page.getByTestId("real-hand-villainPositions").fill("BB");
  await page.getByTestId("real-hand-effectiveStacks").fill("150bb");
  await page.getByTestId("real-hand-straddle").fill("none");
  await page.getByTestId("real-hand-actionSequence").fill("BTN opens, BB calls");
  await page.getByTestId("real-hand-board").fill("Qh 7d 4c");
  await page.getByTestId("real-hand-sizings").fill("3bb");
  await page.getByTestId("real-hand-cue").fill("BB called preflop");
  await page.getByTestId("real-hand-action").fill("check back");
  await page.getByTestId("real-hand-reason").fill("preserve showdown value");
  await page.getByRole("button", { name: /Зафиксировать решение|Lock decision/ }).click();
}

test.beforeEach(async ({ page }) => {
  await localOnly(page);
  await page.addInitScript(({ learnerKey, localeKey }) => {
    localStorage.removeItem(learnerKey);
    localStorage.setItem(localeKey, "ru");
  }, { learnerKey: LEARNER_KEY, localeKey: LOCALE_KEY });
});

test("V7-D Real Hands exposes semantic RU and EN accessibility labels with zero learner attribute leaks", async ({ page }) => {
  await page.goto("/tools?tab=field");
  await expect(page.getByRole("navigation", { name: "Инструменты" })).toBeVisible();
  await createOneRealHand(page);

  const ruReviewer = page.getByRole("combobox", { name: "Как выполнен разбор", exact: true });
  const ruReview = page.getByRole("textbox", { name: "Разбор", exact: true });
  await expect(ruReviewer).toBeVisible();
  await expect(ruReview).toBeVisible();
  await expect(ruReviewer).not.toHaveAttribute("aria-label", /field-/i);
  await expect(ruReview).not.toHaveAttribute("aria-label", /field-/i);
  await expectZeroLearnerAttributeLeaks(page);

  await page.locator("main").evaluate((main) => {
    const probe = document.createElement("button");
    probe.dataset.testid = "v7-d-attribute-probe";
    probe.setAttribute("aria-label", "Открыть field-1787715078123-a1b2c3d");
    probe.setAttribute("aria-description", "Решение PM-B3-PF01-103 explain-1787715078123-z9y8x7w");
    probe.setAttribute("title", "HUMAN_ASSISTED review-1787715078123-k4m5n6p");
    const image = document.createElement("img");
    image.dataset.testid = "v7-d-alt-probe";
    image.setAttribute("alt", "LCM-01 explain-1787715078123-r2s3t4u");
    main.append(probe, image);
  });

  await expect(page.getByTestId("v7-d-attribute-probe")).toHaveAttribute("aria-label", "Открыть");
  await expectZeroLearnerAttributeLeaks(page);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  const enReviewer = page.getByRole("combobox", { name: "How the review was done", exact: true });
  const enReview = page.getByRole("textbox", { name: "Review", exact: true });
  await expect(enReviewer).toBeVisible();
  await expect(enReview).toBeVisible();
  await expect(enReviewer).not.toHaveAttribute("aria-label", /field-/i);
  await expect(enReview).not.toHaveAttribute("aria-label", /field-/i);
  await expectZeroLearnerAttributeLeaks(page);
});

test("V7-D Data & Recovery stays outside the learner attribute firewall", async ({ page }) => {
  await page.goto("/tools?tab=data");
  const main = page.locator("main");
  await expect(main).toBeVisible();
  await main.evaluate((root) => {
    const probe = document.createElement("button");
    probe.dataset.testid = "v7-d-data-authority-probe";
    probe.setAttribute("aria-label", "PM-B3-PF01-103 field-1787715078123-a1b2c3d");
    root.append(probe);
  });
  await expect(page.getByTestId("v7-d-data-authority-probe")).toHaveAttribute(
    "aria-label",
    "PM-B3-PF01-103 field-1787715078123-a1b2c3d",
  );
});
