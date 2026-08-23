import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function seedSession(page, overrides) {
  await page.evaluate(({ key, patch }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step: 0,
      drillIds: ["geo-04"],
      currentIndex: 0,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: now,
      itemStartedAt: now,
      explainBack: "",
      ...patch,
    };
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, patch: overrides });
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
}

async function expectVisibleSessionBody(page) {
  const body = page.locator("main .session > :not(.session-head):visible");
  await expect.poll(async () => body.count()).toBeGreaterThan(0);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("all ten lesson steps keep learner content inside the active session", async ({ page }) => {
  for (let step = 0; step <= 9; step += 1) {
    await seedSession(page, { step });
    await expectVisibleSessionBody(page);

    if (step === 5) {
      const gate = page.locator("main .session > [data-wave5-lab-module='geometry']");
      await expect(gate).toBeVisible();
      await expect(gate).toBeInViewport();
      await expect(gate.getByRole("heading", { name: "Сначала выбери одно изменение и предскажи SPR." })).toBeVisible();
      await expect(gate).toContainText("Старт: банк 42, стек до колла 158, ставка/колл 14, SPR ≈ 2.06");
      await expect(page.locator("body > [data-wave5-lab-module='geometry']")).toHaveCount(0);
    }
  }
});

test("practice, repair, review and mixed sessions cannot collapse to header-only shells", async ({ page }) => {
  for (const mode of ["practice", "repair", "review", "mixed"]) {
    await seedSession(page, { mode, step: 0, drillIds: ["geo-04"] });
    await expectVisibleSessionBody(page);
    await expect(page.locator("main .session .decision-card")).toBeVisible();
  }
});
