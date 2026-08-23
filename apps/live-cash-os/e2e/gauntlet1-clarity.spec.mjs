import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function openFresh(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function seedGeometryComplete(page) {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    state.modules.geometry.contentCompleted = true;
    state.modules.geometry.lessonStep = 10;
    state.revision += 1;
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);
  await page.reload();
}

test("Today separates Time and Mode, shows actual plan volume, and fresh short modes have an actionable fallback", async ({ page }) => {
  await openFresh(page);

  await expect(page.getByText(/Время · сколько минут есть на обычную сессию/i)).toBeVisible();
  await expect(page.getByText(/Режим · особая цель вместо обычной сессии/i)).toBeVisible();
  await expect(page.getByText(/План на выбранное время: ≈8 из 15 минут\. Каждый пункт запускается отдельно/i)).toBeVisible();

  await page.getByRole("button", { name: "5 мин", exact: true }).click();
  await expect(page.getByText(/первый урок рассчитан примерно на 8 минут/i)).toBeVisible();
  const shortFallback = page.getByRole("button", { name: "Выбрать 15 минут", exact: true });
  await expect(shortFallback).toBeEnabled();
  await shortFallback.click();
  await expect(page.getByRole("button", { name: "Начать", exact: true })).toBeEnabled();

  await page.getByRole("button", { name: "Перед игрой", exact: true }).click();
  await expect(page.getByText(/использует только уже изученный материал/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Выбрать 15 минут", exact: true })).toBeEnabled();
  await expect(page.getByRole("heading", { name: /Быстрая разминка · до 2 минут/i })).toBeVisible();
});

test("locked modules name the concrete prerequisite, explain why, and route to it", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "Учиться", exact: true }).click();

  const preflop = page.locator(".module-list article").filter({ hasText: "LCM-02" }).first();
  await expect(preflop.locator("p.support").filter({ hasText: /Сначала LCM-01/i })).toBeVisible();
  await expect(preflop.getByText(/опирается на решения и термины/i)).toBeVisible();
  await preflop.getByRole("button", { name: /^Сначала LCM-01/ }).click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
});

test("disabled learning CTAs state what is missing", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "Учиться", exact: true }).click();

  await expect(page.getByText(/Практика откроется после завершения этого урока/i).first()).toBeVisible();
  await expect(page.getByText(/Смешанная практика и серия быстрых решений откроются после трёх пройденных тем. Сейчас: 0\/3/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Смешанная практика", exact: true })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Серия · 8 быстрых решений", exact: true })).toBeDisabled();
});

test("Cards has one role, blocks future material, and explains grading impact after a topic is completed", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "Карточки", exact: true }).click();

  await expect(page.getByRole("button", { name: "Разминка · до 2 мин", exact: true })).toBeVisible();
  await expect(page.getByText(/Оценка меняет только срок следующего показа карточки, а не статус навыка/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Открыть обучение/ })).toBeEnabled();
  await page.getByRole("button", { name: "Все", exact: true }).click();
  await expect(page.getByText(/Карточки открываются только из завершённых тем/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Показать ответ/ })).toHaveCount(0);

  await seedGeometryComplete(page);
  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await page.getByRole("button", { name: "Все", exact: true }).click();
  await page.getByRole("button", { name: /^Показать ответ/ }).click();
  await expect(page.getByText(/Не вспомнил → снова примерно через 10 минут/i)).toBeVisible();
  await expect(page.getByText(/Это не меняет статус навыка/i)).toBeVisible();
});

test("Review, Progress, Hands and Diagnostic each state one clear role", async ({ page }) => {
  await openFresh(page);

  await page.getByRole("button", { name: "Повтор", exact: true }).click();
  await expect(page.getByText(/Review показывает ограниченную очередь под выбранные 5\/15\/30 минут/i)).toBeVisible();
  await expect(page.getByText(/Каждый пункт запускается отдельно/i)).toBeVisible();

  await page.getByRole("button", { name: "Карта", exact: true }).click();
  await expect(page.getByText(/Прогресс показывает состояние темы, реальные попытки и следующий шаг/i)).toBeVisible();
  await expect(page.getByText(/не общий процент освоения навыка/i)).toBeVisible();

  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await expect(page.getByText(/Сначала быстро зафиксируй 1–3 решения до результата/i)).toBeVisible();
  await expect(page.getByText(/затем выбери одну руку и сделай самопроверку/i)).toBeVisible();

  await page.getByRole("button", { name: "Диагностика", exact: true }).click();
  await expect(page.getByText(/Диагностика — необязательная проверка текущего хода решения/i)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\bT1\b/);
});

test("Diagnostic confidence and disabled submit explain their contract", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "Диагностика", exact: true }).click();
  await page.getByRole("button", { name: "Начать диагностику", exact: true }).click();

  await expect(page.getByText(/Грубая самооценка до фидбека, не точная вероятность/i)).toBeVisible();
  await expect(page.getByText(/Чтобы сохранить ответ, выбери действие и причину/i)).toBeVisible();
  const submit = page.getByRole("button", { name: /^Зафиксировать ответ/ });
  await expect(submit).toBeDisabled();

  const answerSets = page.locator("fieldset.answer-set");
  await expect(answerSets).toHaveCount(2);
  await answerSets.nth(0).getByRole("button").first().click();
  await expect(page.getByText(/Чтобы сохранить ответ, выбери причину/i)).toBeVisible();
  await expect(submit).toBeDisabled();

  await answerSets.nth(1).getByRole("button").first().click();
  await expect(submit).toBeEnabled();
});

test("Real Hands shows completion count and exact missing required fields", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "Руки", exact: true }).click();

  await expect(page.getByText(/0\/11 обязательных полей заполнено/i)).toBeVisible();
  await expect(page.getByText(/Не хватает: Лимиты, Позиция Hero/i)).toBeVisible();
  await expect(page.getByText(/Связанная тема не выбрана/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Зафиксировать решение/ })).toBeDisabled();

  await page.getByLabel("Лимиты").fill("2/5");
  await page.getByLabel("Позиция Hero").fill("BB");
  await expect(page.getByText(/2\/11 обязательных полей заполнено/i)).toBeVisible();
  await expect(page.getByText(/Не хватает:/i)).toBeVisible();
});

test("mobile keeps the zero-guessing Today and Hands states usable without overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile fixture only");
  await openFresh(page);

  await page.getByRole("button", { name: "5 мин", exact: true }).click();
  await expect(page.getByRole("button", { name: "Выбрать 15 минут", exact: true })).toBeEnabled();
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await expect(page.getByText(/0\/11 обязательных полей заполнено/i)).toBeVisible();
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
});