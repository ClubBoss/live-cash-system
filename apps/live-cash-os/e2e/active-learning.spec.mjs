import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function seedLesson(page, step = 1) {
  await page.evaluate(({ key, step }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step,
      drillIds: ["geo-01", "geo-02", "geo-04"],
      currentIndex: step >= 6 ? 2 : step >= 2 ? 1 : 0,
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
  }, { key: STORAGE_KEY, step });
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
}

async function chooseOption(page, text) {
  await page.getByRole("button", { name: text, exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("new lesson rhythm moves from one compact explanation directly into application", async ({ page }) => {
  await seedLesson(page, 1);

  await expect(page.getByText("ЗАПОМНИ", { exact: true })).toBeVisible();
  await expect(page.getByText("Единица → эффективный стек → банк после действия.", { exact: true })).toBeVisible();
  const extraTheory = page.getByText("В multiway-банке нет одной общей эффективной глубины: против каждого релевантного стека она своя.", { exact: true });
  await expect(extraTheory).not.toBeVisible();
  await page.getByText("Дополнительное объяснение", { exact: true }).click();
  await expect(extraTheory).toBeVisible();

  await page.getByRole("button", { name: /^Сразу применить/ }).click();
  await expect(page.getByText("ПРИМЕНИ СРАЗУ", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Как описать эффективную глубину?" })).toBeVisible();

  await chooseOption(page, "$270 против A и $900 против B");
  await chooseOption(page, "Effective stack считается отдельно для каждой релевантной пары");
  await page.getByRole("button", { name: "Ответить", exact: true }).click();
  await expect(page.getByText("Effective stack считается отдельно для каждой релевантной пары", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Продолжить/ }).click();

  await expect(page.getByText("КАРТА РЕШЕНИЯ", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: /^Сначала решить пример/ }).click();

  await expect(page.getByRole("heading", { name: "$2/$5/$10 mandatory straddle. Hero и Villain имеют по $1,400." })).toBeVisible();
  await expect(page.getByText("Сначала 140 straddle-BB, затем pairwise depth и post-action SPR.", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await expect(page.getByText("Сначала 140 straddle-BB, затем pairwise depth и post-action SPR.", { exact: true })).toBeVisible();
});

test("lesson summary says what was checked and keeps delayed retention explicitly pending", async ({ page }) => {
  await seedLesson(page, 9);

  await expect(page.getByText("Что уже проверено", { exact: true })).toBeVisible();
  await expect(page.getByText(/Проверка после паузы ещё не проводилась/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Теперь её нужно закрепить/i })).toBeVisible();
});

test("active-learning hierarchy remains bilingual without exposing hidden Russian detail in English", async ({ page }) => {
  await seedLesson(page, 1);
  await page.getByRole("button", { name: "EN", exact: true }).click();

  await expect(page.getByText("REMEMBER", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: /^Apply it now/ })).toBeVisible();
  await expect(page.getByText("More explanation", { exact: true })).toBeVisible();
  await expect(page.locator("main .session")).not.toContainText("Дополнительное объяснение");
});
