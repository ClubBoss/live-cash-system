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
  await page.goto("/");
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

test("lesson header exposes actual step 1, middle and 10 plus reliable local save state", async ({ page }) => {
  await seedLesson(page, 0);
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Урок · шаг 1 из 10");
  await expect(page.getByTestId("session-save")).toHaveText("Сохранено на устройстве");

  await seedLesson(page, 4);
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Урок · шаг 5 из 10");
  await expect(page.getByTestId("session-save")).toHaveText("Сохранено на устройстве");
  await saveEvidence(page, "lesson-step-5-save-local-ru.png");

  await seedLesson(page, 9);
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Урок · шаг 10 из 10");
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator(".session-head")).toContainText("LCM-01 · Lesson · step 10 of 10");
  await expect(page.getByTestId("session-save")).toHaveText("Saved on device");
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

test("in-progress Diagnostic survives exit and resumes from the fourth question", async ({ page }) => {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = null;
    state.diagnostic = {
      status: "IN_PROGRESS",
      runId: "t1-wave-a",
      startedAt: now,
      submittedAt: null,
      responses: ["LD-001", "LD-002", "LD-003"].map((item_id, index) => ({
        item_id,
        answer: `saved action ${index + 1}`,
        reasoning: `saved reasoning ${index + 1}`,
        confidence: 65,
        time_seconds: 12,
        locale: "ru",
      })),
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

  await expect(page.getByRole("heading", { name: "Диагностика · 3/10 сохранено" })).toBeVisible();
  await expect(page.getByText("Сохранённые ответы не потеряны. Продолжишь с 4-го вопроса.")).toBeVisible();
  await saveEvidence(page, "diagnostic-3-of-10-ru.png");

  await page.getByRole("button", { name: "Продолжить", exact: true }).click();
  await expect(page.locator(".session-head")).toContainText("Диагностика · 4/10");
  await expect(page.getByText("LD-004", { exact: false })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).diagnostic.responses.length, STORAGE_KEY)).toBe(3);

  await page.locator(".session-head button.quiet").click();
  await expect(page.getByRole("heading", { name: "Диагностика · 3/10 сохранено" })).toBeVisible();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).diagnostic.responses.length, STORAGE_KEY)).toBe(3);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Diagnostic · 3/10 saved" })).toBeVisible();
  await expect(page.getByText("Your saved answers are still here. Continue with question 4.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Continue", exact: true })).toBeVisible();
});
