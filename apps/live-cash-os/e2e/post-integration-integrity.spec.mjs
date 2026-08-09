import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function localState(page) {
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
}

async function saveState(page, state) {
  state.revision += 1;
  state.updatedAt = new Date().toISOString();
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: STORAGE_KEY, value: state });
  await page.reload();
}

async function clickStableContinue(page) {
  const semantic = page.locator("[data-g4-feedback-state]").getByRole("button", { name: /^Продолжить/ });
  const core = page.locator(".feedback-view > button.primary");
  let lastError;
  for (let attempt = 0; attempt < 60; attempt += 1) {
    if (await semantic.isVisible().catch(() => false)) {
      try { await semantic.click({ timeout: 500 }); return; } catch (error) { lastError = error; }
    }
    if (await core.isVisible().catch(() => false)) {
      try { await core.click({ timeout: 500 }); return; } catch (error) { lastError = error; }
    }
    await page.waitForTimeout(100);
  }
  throw lastError ?? new Error("No learner-visible Continue control appeared after the answer");
}

async function fillRequiredHandFields(page) {
  await page.getByLabel("Лимиты").fill("2/5");
  await page.getByLabel("Позиция Hero").fill("BB");
  await page.getByLabel("Позиции релевантных соперников").fill("BTN");
  await page.getByLabel("Эффективные стеки").fill("150bb");
  await page.getByLabel("Страддл / без страддла").fill("без страддла");
  await page.getByLabel("Последовательность действий").fill("BTN opens 3bb, BB calls; flop BTN bets 25%");
  await page.getByLabel("Борд (для префлопа: preflop)").fill("Qh 7d 4c");
  await page.getByLabel("Сайзинги").fill("3bb preflop; 25% flop");
  await page.getByLabel("Что заметил").fill("BTN uses a small wide flop bet");
  await page.getByLabel("Как сыграл").fill("Call");
  await page.getByLabel("Почему — до результата").fill("Keep weaker hands in and preserve the calling range before seeing the result.");
}

test.beforeEach(async ({ page }) => {
  await openLocal(page);
});

test("fresh Cards cannot leak material from uncompleted topics", async ({ page }) => {
  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await expect(page.getByText(/Карточки открываются только из завершённых тем/i)).toBeVisible();

  await page.getByRole("button", { name: "К повторению", exact: true }).click();
  await expect(page.getByText(/Карточки открываются только из завершённых тем/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Показать ответ/ })).toHaveCount(0);

  await page.getByRole("button", { name: "Все", exact: true }).click();
  await expect(page.getByText(/Карточки открываются только из завершённых тем/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Показать ответ/ })).toHaveCount(0);
});

test("Due Cards use a fixed snapshot, never skip after grading, and end without wrapping", async ({ page }) => {
  const seeded = await localState(page);
  seeded.modules.geometry.contentCompleted = true;
  seeded.modules.geometry.lessonStep = 10;
  seeded.cards = {};
  await saveState(page, seeded);

  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await page.getByRole("button", { name: "К повторению", exact: true }).click();

  const eyebrow = page.locator(".session .eyebrow").filter({ hasText: /ВСПОМНИ БЕЗ ПОДСКАЗКИ/ });
  await expect(eyebrow).toContainText("1/3");

  for (let index = 1; index <= 3; index += 1) {
    await expect(eyebrow).toContainText(`${index}/3`);
    await page.getByRole("button", { name: /^Показать ответ/ }).click();
    await page.getByRole("button", { name: "Легко", exact: true }).click();
  }

  await expect(page.getByRole("heading", { name: "Этот набор карточек закончен." })).toBeVisible();
  await expect(page.getByText("3/3 карточек пройдено.", { exact: true })).toBeVisible();
  const state = await localState(page);
  expect(Object.keys(state.cards).filter((id) => id.startsWith("geo-card-")).length).toBe(3);
});

test("Before Play keeps a saved learning session untouched and opens only completed-topic cards", async ({ page }) => {
  const startedAt = "2026-08-09T10:00:00.000Z";
  const seeded = await localState(page);
  seeded.modules.geometry.contentCompleted = true;
  seeded.modules.geometry.lessonStep = 10;
  seeded.activeSession = {
    mode: "practice",
    moduleId: "geometry",
    step: 0,
    drillIds: ["geo-04"],
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt,
    itemStartedAt: startedAt,
    explainBack: "",
  };
  await saveState(page, seeded);

  await page.getByRole("button", { name: "Сегодня", exact: true }).click();
  await page.getByRole("button", { name: "Перед игрой", exact: true }).click();
  await expect(page.getByText(/Сохранённая сессия останется ровно на месте/i)).toBeVisible();
  await page.getByRole("button", { name: "Начать", exact: true }).click();
  await expect(page.getByText(/Карточки нужны для быстрого вспоминания/i)).toBeVisible();
  await expect(page.locator("main .session")).toContainText(/ВСПОМНИ БЕЗ ПОДСКАЗКИ/);

  const state = await localState(page);
  expect(state.activeSession.mode).toBe("practice");
  expect(state.activeSession.moduleId).toBe("geometry");
  expect(state.activeSession.startedAt).toBe(startedAt);
  expect(state.activeSession.currentIndex).toBe(0);
});

test("Review runs one bounded item and returns to the updated Review queue", async ({ page }) => {
  const seeded = await localState(page);
  seeded.modules.geometry.contentCompleted = true;
  seeded.modules.geometry.lessonStep = 10;
  seeded.reviewQueue = [{
    id: "audit-review-1",
    moduleId: "geometry",
    sourceDrillId: "geo-01",
    variantGroup: "denominator",
    kind: "retention",
    dueAt: "2020-01-01T00:00:00.000Z",
    attempts: 0,
    sourceInteractionId: "audit-source-1",
  }];
  seeded.activeSession = null;
  await saveState(page, seeded);

  await page.getByRole("button", { name: "Повтор", exact: true }).click();
  await expect(page.getByText(/Каждый пункт запускается отдельно; после завершения приложение возвращает сюда/i)).toBeVisible();
  await page.getByRole("button", { name: "Начать", exact: true }).click();

  const card = page.locator(".decision-card");
  await card.locator(".answer-set").nth(0).getByRole("button").first().click();
  await card.locator(".answer-set").nth(1).getByRole("button").first().click();
  await card.getByRole("button", { name: /^Ответить/ }).click();
  await clickStableContinue(page);

  await expect(page.getByRole("button", { name: "Повтор", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText(/Пункт завершён. Очередь Review обновлена/i)).toBeVisible();
  await expect.poll(async () => (await localState(page)).activeSession).toBeNull();
});

test("Real Hands requires an explicit linked topic before a complete hand can be locked", async ({ page }) => {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  const form = page.locator(".field-form");
  const linkedTopic = form.getByLabel("Связанная тема");
  const lock = form.getByRole("button", { name: "Зафиксировать решение", exact: true });
  await expect(linkedTopic).toHaveValue("");
  await expect(form.getByText(/Связанная тема не выбрана/i)).toBeVisible();
  await expect(lock).toBeDisabled();

  await fillRequiredHandFields(page);
  await expect(form.getByText(/11\/11 обязательных полей заполнено/i)).toBeVisible();
  await expect(linkedTopic).toHaveValue("");
  await expect(lock).toBeDisabled();

  await linkedTopic.selectOption("geometry");
  await expect(linkedTopic).toHaveValue("geometry");
  await expect(lock).toBeEnabled();
  await lock.click();
  await expect.poll(async () => (await localState(page)).fieldNotes.at(-1)?.moduleId).toBe("geometry");
});
