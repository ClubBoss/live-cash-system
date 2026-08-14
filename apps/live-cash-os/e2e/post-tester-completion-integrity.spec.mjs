import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const RUNTIME = {
  appVersion: "1.2.0",
  contentVersion: "2026.08-wave7-integrity",
  schemaVersion: 2,
};

function stateApiController() {
  let remoteState = null;
  let posts = 0;
  let firstPostDelayMs = 0;
  let firstPostStartedResolve;
  const firstPostStarted = new Promise((resolve) => { firstPostStartedResolve = resolve; });
  return {
    setRemoteState(value) { remoteState = value; },
    remoteState() { return remoteState; },
    setFirstPostDelay(ms) { firstPostDelayMs = ms; },
    postCount() { return posts; },
    firstPostStarted,
    async handle(route) {
      const method = route.request().method();
      if (method === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ state: remoteState, cloudDeleted: false, cloudToken: remoteState ? `token-${remoteState.revision}` : null, revision: remoteState?.revision ?? 0, runtime: RUNTIME }) });
        return;
      }
      if (method === "POST") {
        posts += 1;
        const body = route.request().postDataJSON();
        if (posts === 1) {
          firstPostStartedResolve();
          if (firstPostDelayMs) await new Promise((resolve) => setTimeout(resolve, firstPostDelayMs));
        }
        remoteState = body.state;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ state: remoteState, cloudDeleted: false, cloudToken: `token-${remoteState.revision}`, revision: remoteState.revision, runtime: RUNTIME }) });
        return;
      }
      await route.fulfill({ status: 405, contentType: "application/json", body: "{}" });
    },
  };
}

async function localState(page) {
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY)).not.toBeNull();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), LEARNER_KEY);
}

async function seedLessonStep(page, step) {
  await page.evaluate(({ key, step }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = { mode: "lesson", moduleId: "geometry", step, drillIds: ["geo-01", "geo-02", "geo-04"], currentIndex: step >= 6 ? 2 : step >= 2 ? 1 : 0, selectedActionId: null, selectedReasonId: null, confidence: 65, startedAt: now, itemStartedAt: now, explainBack: "A completed explain-back draft that is long enough for this seeded summary." };
    state.modules.geometry.contentCompleted = false;
    state.modules.geometry.lessonStep = step;
    state.reviewQueue = state.reviewQueue.filter((item) => item.moduleId !== "geometry");
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: LEARNER_KEY, step });
}

async function completeExplainBackTransferCheck(page) {
  await expect(page.getByText("9 · СРАВНИ СВОЁ ОБЪЯСНЕНИЕ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Покрыл главное", exact: true }).click();
  await page.getByRole("button", { name: "Глубокий старт может превратиться в низкий postflop SPR", exact: true }).click();
  await page.getByRole("button", { name: "Длина будущего дерева зависит от оставшегося стека относительно сформированного банка", exact: true }).click();
  await page.getByRole("button", { name: "Зафиксировать решение", exact: true }).click();
  await expect(page.getByRole("button", { name: /^Открыть итог урока/ })).toBeVisible();
}

test.describe("Post-tester Wave D completed lesson integrity", () => {
  test.skip(process.env.LIVE_CASH_DEPLOY_TARGET === "test-mirror", "Completion ordering is isolated from the test-invite gate in the regular build.");

  test("learner-facing completion boundary matches canonical completion truth", async ({ page }) => {
    await page.route("**/api/state", async (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ code: "AUTH_REQUIRED" }) }));
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await seedLessonStep(page, 8);
    await page.reload();
    expect((await localState(page)).activeSession?.step).toBe(8);
    await completeExplainBackTransferCheck(page);
    await page.getByRole("button", { name: /^Открыть итог урока/ }).click();
    await expect(page.getByText("10 · Итог урока", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Завершить урок и вернуться/ })).toBeVisible();
    const summaryState = await localState(page);
    expect(summaryState.activeSession?.step).toBe(9);
    expect(summaryState.modules.geometry.contentCompleted).toBe(false);
    expect(summaryState.reviewQueue.filter((item) => item.kind === "repair")).toHaveLength(0);
    await page.getByRole("button", { name: /^Завершить урок и вернуться/ }).click();
    await expect.poll(async () => (await localState(page)).activeSession).toBeNull();
    const completed = await localState(page);
    expect(completed.modules.geometry.contentCompleted).toBe(true);
    expect(completed.modules.geometry.lessonStep).toBe(10);
    expect(completed.reviewQueue.filter((item) => item.kind === "repair")).toHaveLength(0);
    await page.getByRole("button", { name: "Сегодня", exact: true }).click();
    await expect(page.locator(".today-card")).not.toContainText("Продолжить сохранённую сессию");
  });

  test("slow pre-completion cloud ACK cannot resurrect a completed lesson", async ({ page }) => {
    const controller = stateApiController();
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    const baseline = await localState(page);
    controller.setRemoteState(baseline);
    await page.reload();
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await page.waitForTimeout(700);
    expect(controller.postCount()).toBe(0);
    await seedLessonStep(page, 9);
    controller.setFirstPostDelay(900);
    await page.reload();
    await expect(page.getByRole("button", { name: /^Завершить урок и вернуться/ })).toBeVisible();
    await controller.firstPostStarted;
    await page.getByRole("button", { name: /^Завершить урок и вернуться/ }).click();
    await expect.poll(async () => (await localState(page)).activeSession, { timeout: 5_000 }).toBeNull();
    const localCompleted = await localState(page);
    expect(localCompleted.modules.geometry.contentCompleted).toBe(true);
    expect(localCompleted.reviewQueue.filter((item) => item.kind === "repair")).toHaveLength(0);
    await expect.poll(() => controller.postCount(), { timeout: 5_000 }).toBe(2);
    await expect.poll(() => controller.remoteState()?.activeSession ?? null, { timeout: 5_000 }).toBeNull();
    expect(controller.remoteState()?.modules?.geometry?.contentCompleted).toBe(true);
    await page.reload();
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    const reloaded = await localState(page);
    expect(reloaded.activeSession).toBeNull();
    expect(reloaded.modules.geometry.contentCompleted).toBe(true);
    await expect(page.locator(".today-card")).not.toContainText("Продолжить сохранённую сессию");
  });
});
