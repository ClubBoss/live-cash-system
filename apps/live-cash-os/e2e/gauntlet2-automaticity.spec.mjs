import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function seedBurstEligibility(page) {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    for (const module of Object.values(state.modules)) module.contentCompleted = false;
    for (const id of ["geometry", "preflop", "blinds"]) state.modules[id].contentCompleted = true;
    state.activeSession = null;
    state.revision += 1;
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);
  await page.reload();
}

async function openBurst(page) {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /Серия · 8 быстрых решений/ }).click();
  await expect(page.locator(".session-head > div > span")).toContainText("Серия · 1/8");
  const card = page.locator(".decision-card");
  await expect(card).toHaveAttribute("aria-label", "Смешанная задача");
  await expect(card.locator(":scope > .eyebrow")).toHaveAttribute("aria-hidden", "true");
}

async function clickStableContinue(page) {
  const g4Continue = page.locator("[data-g4-feedback-state]").getByRole("button", { name: /^Продолжить/ });
  const coreContinue = page.locator(".feedback-view > button.primary");
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await g4Continue.isVisible().catch(() => false)) {
      try { await g4Continue.click({ timeout: 500 }); return; } catch (error) { lastError = error; }
    }
    if (await coreContinue.isVisible().catch(() => false)) {
      try { await coreContinue.click({ timeout: 500 }); return; } catch (error) { lastError = error; }
    }
    await page.waitForTimeout(100);
  }
  throw lastError ?? new Error("No learner-visible Continue control appeared after the Burst answer");
}

async function answerCurrentSpot(page) {
  const card = page.locator(".decision-card");
  await card.locator(".answer-set").nth(0).getByRole("button").first().click();
  await card.locator(".answer-set").nth(1).getByRole("button").first().click();
  await card.getByRole("button", { name: /^Ответить/ }).click();

  // G2 owns the bounded eight-decision progression contract. G4 owns exact
  // correct/partial/wrong feedback composition. During compatibility-host
  // handoff the Core and G4 Continue controls can exchange visibility for a
  // frame, so click the control that is actually learner-visible at action time.
  await clickStableContinue(page);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedBurstEligibility(page);
});

test("fast series runs eight concealed mixed decisions and resumes without a shadow session", async ({ page }) => {
  await openBurst(page);
  await answerCurrentSpot(page);
  await expect(page.locator(".session-head > div > span")).toContainText("Серия · 2/8");

  await page.locator(".session-head > button.quiet").click();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await page.reload();
  await expect(page.locator(".session-head > div > span")).toContainText("Серия · 2/8");

  for (let index = 1; index < 8; index += 1) await answerCurrentSpot(page);

  await expect(page.getByText("ИТОГ СЕРИИ")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Восемь решений без названий тем." })).toBeVisible();
  const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(persisted.activeSession?.mode).toBe("mixed");
  expect(persisted.activeSession?.drillIds).toHaveLength(8);
  expect(persisted.schemaVersion).toBe(2);
});

test("fast series stays usable without horizontal overflow at 390x844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBurst(page);
  await expect(page.locator(".decision-card")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await answerCurrentSpot(page);
  await expect(page.locator(".session-head > div > span")).toContainText("Серия · 2/8");
  const feedbackOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(feedbackOverflow).toBeLessThanOrEqual(1);
});
