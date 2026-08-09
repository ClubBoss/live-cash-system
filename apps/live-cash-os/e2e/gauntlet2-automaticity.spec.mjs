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
  await page.getByRole("button", { name: /Table Burst · 8 быстрых решений/ }).click();
  await expect(page.locator(".session-head > div > span")).toContainText("Table Burst · 1/8");
  const card = page.locator(".decision-card");
  await expect(card).toHaveAttribute("aria-label", "Смешанная задача");
  await expect(card.locator(":scope > .eyebrow")).toHaveAttribute("aria-hidden", "true");
}

async function answerCurrentSpot(page) {
  const card = page.locator(".decision-card");
  await card.locator(".answer-set").nth(0).getByRole("button").first().click();
  await card.locator(".answer-set").nth(1).getByRole("button").first().click();
  await card.getByRole("button", { name: /^Ответить/ }).click();

  // G2 owns the bounded eight-decision progression contract. G4 owns the exact
  // correct/partial/wrong feedback composition and has dedicated coverage for it.
  // Under CI load the G4 portal can briefly reacquire the Core feedback host, so
  // advance through whichever learner-visible Continue control is present.
  const g4Continue = page.locator("[data-g4-feedback-state]").getByRole("button", { name: /^Продолжить/ });
  const coreContinue = page.locator(".feedback-view > button.primary");
  await expect.poll(async () => {
    if (await g4Continue.isVisible().catch(() => false)) return "g4";
    if (await coreContinue.isVisible().catch(() => false)) return "core";
    return "";
  }, { timeout: 15_000 }).not.toBe("");

  if (await g4Continue.isVisible().catch(() => false)) await g4Continue.click();
  else await coreContinue.click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedBurstEligibility(page);
});

test("Table Burst runs eight concealed mixed decisions and resumes without a shadow session", async ({ page }) => {
  await openBurst(page);
  await answerCurrentSpot(page);
  await expect(page.locator(".session-head > div > span")).toContainText("Table Burst · 2/8");

  await page.locator(".session-head > button.quiet").click();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await page.reload();
  await expect(page.locator(".session-head > div > span")).toContainText("Table Burst · 2/8");

  for (let index = 1; index < 8; index += 1) await answerCurrentSpot(page);

  await expect(page.getByText("ИТОГ СЕРИИ")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Восемь решений без названий тем." })).toBeVisible();
  const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(persisted.activeSession?.mode).toBe("mixed");
  expect(persisted.activeSession?.drillIds).toHaveLength(8);
  expect(persisted.schemaVersion).toBe(2);
});

test("Table Burst stays usable without horizontal overflow at 390x844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openBurst(page);
  await expect(page.locator(".decision-card")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await answerCurrentSpot(page);
  await expect(page.locator(".session-head > div > span")).toContainText("Table Burst · 2/8");
  const feedbackOverflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(feedbackOverflow).toBeLessThanOrEqual(1);
});
