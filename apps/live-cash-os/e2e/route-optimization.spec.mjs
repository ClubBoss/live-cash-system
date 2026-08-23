import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function seedRouteState(page, completed, priorityModules) {
  await page.evaluate(({ key, completed, priorityModules }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = null;
    state.interactions = [];
    state.reviewQueue = [];
    state.diagnostic.status = priorityModules.length ? "ROUTED" : "NOT_STARTED";
    state.diagnostic.priorityModules = priorityModules;
    state.diagnostic.importedAt = priorityModules.length ? now : null;
    for (const [moduleId, progress] of Object.entries(state.modules)) {
      progress.contentCompleted = completed.includes(moduleId);
      progress.lessonStep = progress.contentCompleted ? 10 : 0;
      progress.state = progress.contentCompleted ? "INTRODUCED" : "UNEXPOSED";
      progress.recentClasses = [];
      progress.highConfidenceError = false;
      for (const cell of Object.values(progress.evidence)) {
        cell.exposures = 0;
        cell.successes = 0;
        cell.distinctNodes = [];
        cell.lastAt = null;
      }
      if (progress.contentCompleted) {
        progress.evidence.variant_transfer.exposures = 2;
        progress.evidence.variant_transfer.successes = 2;
        progress.evidence.boundary_control.exposures = 1;
        progress.evidence.boundary_control.successes = 1;
      }
    }
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, completed, priorityModules });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function startToday(page) {
  await page.getByRole("button", { name: /^Начать/ }).click();
  await expect(page.locator("main .session")).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local route test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("priority cannot route LCM-10 before its audited preflop foundation", async ({ page }) => {
  await seedRouteState(page, ["geometry"], ["evidence"]);
  await startToday(page);
  await expect(page.locator("main .session .session-head")).toContainText("LCM-02");
});

test("eligible LCM-10 priority can move earlier without changing the default curriculum spine", async ({ page }) => {
  await seedRouteState(page, ["geometry", "preflop"], ["evidence"]);
  await startToday(page);
  await expect(page.locator("main .session .session-head")).toContainText("LCM-10");
});

test("default learner still receives the canonical next module when no priority asks for a safe detour", async ({ page }) => {
  await seedRouteState(page, ["geometry", "preflop"], []);
  await startToday(page);
  await expect(page.locator("main .session .session-head")).toContainText("LCM-03");
});

test("evidence hygiene is visible before the dedicated LCM-10 lesson", async ({ page }) => {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await expect(page.getByText(/Одна раздача — наблюдение, а не доказательство частоты/i)).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByText(/One hand is an observation, not proof of a frequency/i)).toBeVisible();
});
