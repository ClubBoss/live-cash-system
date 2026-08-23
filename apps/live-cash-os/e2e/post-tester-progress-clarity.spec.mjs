import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";
const EVIDENCE_DIR = "test-results/post-tester-wave-a";

async function seedLesson(page, step) {
  await page.evaluate(({ key, lessonStep }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step: lessonStep,
      drillIds: ["geo-04", "geo-04", "geo-04"],
      currentIndex: 0,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: now,
      itemStartedAt: now,
      explainBack: "",
    };
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, lessonStep: step });
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
}

async function saveEvidence(page, filename) {
  await mkdir(EVIDENCE_DIR, { recursive: true });
  await page.screenshot({ path: `${EVIDENCE_DIR}/${filename}`, fullPage: true });
  console.log(`[post-tester-wave-a evidence] ${EVIDENCE_DIR}/${filename}`);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("completed lesson and repair-required skill are both explicit in RU and EN", async ({ page }) => {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = null;
    state.modules.geometry.contentCompleted = true;
    state.modules.geometry.state = "REPAIR_REQUIRED";
    state.modules.geometry.highConfidenceError = true;
    state.reviewQueue.push({
      id: "repair-wave-a",
      moduleId: "geometry",
      sourceDrillId: "geo-04",
      variantGroup: "geometry-wave-a",
      kind: "repair",
      dueAt: now,
      attempts: 0,
      sourceInteractionId: "interaction-wave-a",
    });
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);
  await page.reload();

  await page.locator(".tabs button").nth(1).click();
  const firstModule = page.locator(".module-list article").first();
  await expect(firstModule).toContainText("Урок: пройден");
  await expect(firstModule).toContainText("Навык: нуждается в работе");
  await expect(firstModule).toContainText("Урок завершён. В самостоятельной проверке была ошибка, поэтому отдельное задание добавлено в Повтор.");
  await saveEvidence(page, "completed-repair-ru.png");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(firstModule).toContainText("Lesson: completed");
  await expect(firstModule).toContainText("Skill: needs repair");
  await expect(firstModule).toContainText("Lesson completed. A self-check found a mistake, so a separate repair task was added to Review.");
});

test("lesson header exposes actual step 1, middle and 10", async ({ page }) => {
  await seedLesson(page, 0);
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Урок · шаг 1 из 10");

  await seedLesson(page, 4);
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Урок · шаг 5 из 10");

  await seedLesson(page, 9);
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Урок · шаг 10 из 10");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Lesson · step 10 of 10");
});

test("real learner mutation is Saving until localStorage persists it, then shows saved-on-device", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const baseline = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);

  await page.evaluate((key) => {
    const originalSetItem = Storage.prototype.setItem;
    window.__waveASaveProbe = [];
    Storage.prototype.setItem = function patchedSetItem(storageKey, value) {
      if (this === localStorage && storageKey === key) {
        let parsed = null;
        try { parsed = JSON.parse(value); } catch { /* not learner state JSON */ }
        window.__waveASaveProbe.push({
          revision: parsed?.revision ?? null,
          updatedAt: parsed?.updatedAt ?? null,
          indicator: document.querySelector('[data-testid="session-save"]')?.textContent?.trim() ?? null,
          saveState: document.querySelector('[data-testid="session-save"]')?.getAttribute("data-save-state") ?? null,
        });
      }
      return originalSetItem.call(this, storageKey, value);
    };
  }, STORAGE_KEY);

  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  const save = page.getByTestId("session-save");
  await expect(page.locator(".session-head > div > span:first-of-type")).toHaveText("LCM-01 · Урок · шаг 1 из 10");
  await expect(save).toHaveAttribute("data-save-state", "saved_local");
  await expect(save).toHaveText("Сохранено на устройстве");

  const persisted = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
  expect(persisted.revision).toBeGreaterThan(baseline.revision);
  expect(persisted.activeSession?.mode).toBe("lesson");
  expect(persisted.activeSession?.moduleId).toBe("geometry");

  const probe = await page.evaluate(() => window.__waveASaveProbe);
  const mutationWrite = probe.find((entry) => entry.revision === persisted.revision && entry.updatedAt === persisted.updatedAt);
  expect(mutationWrite).toBeTruthy();
  expect(mutationWrite.indicator).toBe("Сохраняем…");
  expect(mutationWrite.saveState).toBe("saving");

  await expect(save).toHaveCSS("text-transform", "none");
  await expect(save).toHaveCSS("white-space", "nowrap");
  await expect(save).toHaveCSS("border-top-width", "0px");
  await expect(save).toHaveCSS("font-size", "11px");
  const saveBox = await save.boundingBox();
  expect(saveBox?.height ?? 99).toBeLessThanOrEqual(18);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  await saveEvidence(page, "session-header-390x844-saved-local.png");
});

test("fresh Today labels zero as reviews due rather than all tasks", async ({ page }) => {
  const metrics = page.locator(".metrics");
  await expect(metrics).toContainText("0");
  await expect(metrics).toContainText("повторений на сегодня");
  await expect(metrics).not.toContainText("заданий на сегодня");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(metrics).toContainText("0");
  await expect(metrics).toContainText("reviews due");
});

test("in-progress Diagnostic has continuation eyebrow, survives exit and resumes from the fourth question", async ({ page }) => {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = null;
    state.diagnostic = {
      status: "IN_PROGRESS",
      runId: "t1-wave-a",
      startedAt: now,
      submittedAt: null,
      responses: [
        { item_id: "LD-001", answer: "geo-04-a0", reasoning: "geo-04-r0", confidence: 65, time_seconds: 12, locale: "ru" },
        { item_id: "LD-002", answer: "pre-04-a0", reasoning: "pre-04-r0", confidence: 65, time_seconds: 12, locale: "ru" },
        { item_id: "LD-003", answer: "bli-03-a0", reasoning: "bli-03-r0", confidence: 65, time_seconds: 12, locale: "ru" },
      ],
      priorityModules: [],
      importedAt: null,
      measurementContext: "COLD_BASELINE",
      learningExposureAtStart: false,
      localeAtStart: "ru",
    };
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);
  await page.reload();

  await expect(page.getByText("ДИАГНОСТИКА · ПРОДОЛЖЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.getByText("НЕОБЯЗАТЕЛЬНО ПЕРЕД СТАРТОМ", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: "Диагностика · 3/10 сохранено" })).toBeVisible();
  await expect(page.getByText("Сохранённые ответы не потеряны. Продолжишь с 4-го вопроса.")).toBeVisible();
  await saveEvidence(page, "diagnostic-continuation-eyebrow-ru.png");

  await page.getByRole("button", { name: "Продолжить", exact: true }).click();
  await expect(page.locator(".session-head")).toContainText("Диагностика · 4/10");
  await expect(page.getByText("LD-004", { exact: false })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).diagnostic.responses.length, STORAGE_KEY)).toBe(3);

  await page.locator(".session-head button.quiet").click();
  await expect(page.getByText("ДИАГНОСТИКА · ПРОДОЛЖЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Диагностика · 3/10 сохранено" })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).diagnostic.responses.length, STORAGE_KEY)).toBe(3);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByText("DIAGNOSTIC · CONTINUE", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Diagnostic · 3/10 saved" })).toBeVisible();
  await expect(page.getByText("Your saved answers are still here. Continue with question 4.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
});
