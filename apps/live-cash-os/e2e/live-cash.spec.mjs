import { expect, test } from "@playwright/test";

async function localState(page) {
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("live-cash-os:learner-state"))).not.toBeNull();
  return page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state")));
}

async function openGeometryColdCheck(page) {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
}

async function answerGeometryColdCheck(page) {
  await page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" }).click();
  await page.getByRole("button", { name: "Именно страддл $10 задаёт цену всех префлоп-действий" }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
  await expect(page.getByText(/(?:РАЗБОР РЕШЕНИЯ|DECISION REVIEW)/)).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("shows a natural evidence-backed route in both locales", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Что означает путь 0.*100%/i })).toBeVisible();
  await expect(page.locator(".route-grid article")).toHaveCount(9);
  await expect(page.locator(".route-grid")).toContainText("0%");
  await expect(page.locator(".route-grid")).toContainText("100%");
  await expect(page.locator(".route-grid")).not.toContainText(/evidence|probe|repair|retention|field validated|state machine/i);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: /What the 0.*100% route means/i })).toBeVisible();
  await expect(page.locator(".route-grid article")).toHaveCount(9);
  await expect(page.locator(".route-grid")).not.toContainText(/evidence gate|probe|field validation|learner state|state machine/i);
});

test("completes the cold check and reaches the plain explanation", async ({ page }) => {
  await openGeometryColdCheck(page);
  await answerGeometryColdCheck(page);
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(page.getByText("2 · ГЛАВНАЯ ИДЕЯ")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Быстро определять эффективный стек/ })).toBeVisible();
});

test("the starting check explains its purpose and remains optional", async ({ page }) => {
  await expect(page.getByRole("heading", { name: "Стартовая проверка мышления" })).toBeVisible();
  await expect(page.getByText(/10 решений без подсказок, около 15 минут/i)).toBeVisible();
  await expect(page.getByText(/Можно пропустить и сразу начать первый урок/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Проверка", exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Учиться" }).click();
  await expect(page.getByRole("button", { name: /^Изучить/ }).first()).toBeEnabled();
});

test("the starting check has natural T1 copy in both locales", async ({ page }) => {
  await page.getByRole("button", { name: "Проверка", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Проверь, как принимаешь решения сейчас/i })).toBeVisible();
  await expect(page.getByText(/10 ситуаций · около 15 минут · можно пропустить/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Начать проверку" })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Check how you make decisions now/i })).toBeVisible();
  await expect(page.getByText(/10 spots · about 15 minutes · optional/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Start the check" })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/EN REVIEW REQUIRED|editorial review required/i);

  await page.getByRole("button", { name: "Start the check" }).click();
  await expect(page.getByText(/LD-001 · Depth with a straddle/i)).toBeVisible();
  await expect(page.locator(".session")).not.toContainText(/Straddle denominator|Pairwise multiway depth|compensation test|directional raise incentive|MDF burden|credible bluff supply/i);
  await expect(page.locator(".session")).not.toContainText(/[А-Яа-яЁё]/u);
});

test("approved EN module cards use final poker-native headings", async ({ page }) => {
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("button", { name: "Learn", exact: true }).click();
  const list = page.locator(".module-list");
  await expect(list).toContainText("How bet size changes your response");
  await expect(list).toContainText("Trace the range through the hand");
  await expect(list).toContainText("From understanding to real-table use");
  await expect(list).not.toContainText(/Range ancestry|Bet size and response shape|EN REVIEW REQUIRED|translation pending/i);
  await expect(list).not.toContainText(/[А-Яа-яЁё]/u);
});

test("language persists without changing learner state", async ({ page }) => {
  const before = await localState(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Learn in small blocks/i })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  const afterSwitch = await localState(page);
  expect(afterSwitch.revision).toBe(before.revision);
  expect(afterSwitch.interactions).toEqual(before.interactions);

  await page.reload();
  await expect(page.getByRole("heading", { name: /Learn in small blocks/i })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("RU to EN to RU preserves the active decision and learner identity", async ({ page }) => {
  await openGeometryColdCheck(page);
  const russianChoice = page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" });
  await russianChoice.click();
  await expect(russianChoice).toHaveAttribute("aria-pressed", "true");
  const before = await localState(page);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Which unit should describe the depth first/i })).toBeVisible();
  const englishChoice = page.getByRole("button", { name: "140 straddle big blinds; also note 280 ordinary BB" });
  await expect(englishChoice).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator(".session")).not.toContainText(/[А-Яа-яЁё]/u);

  await page.getByRole("button", { name: "RU", exact: true }).click();
  await expect(page.getByRole("heading", { name: /В каких единицах сначала оценить глубину/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" })).toHaveAttribute("aria-pressed", "true");
  const afterRoundTrip = await localState(page);
  expect(afterRoundTrip.revision).toBe(before.revision);
  expect(afterRoundTrip.activeSession.selectedActionId).toBe(before.activeSession.selectedActionId);
  expect(afterRoundTrip.interactions).toEqual(before.interactions);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.reload();
  await expect(page.getByRole("heading", { name: /Which unit should describe the depth first/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "140 straddle big blinds; also note 280 ordinary BB" })).toHaveAttribute("aria-pressed", "true");
});

test("submitted feedback survives reload without duplicate evidence", async ({ page }) => {
  await openGeometryColdCheck(page);
  await answerGeometryColdCheck(page);
  const before = await localState(page);
  expect(before.interactions).toHaveLength(1);

  await page.reload();
  await expect(page.getByText(/(?:РАЗБОР РЕШЕНИЯ|DECISION REVIEW)/)).toBeVisible();
  const after = await localState(page);
  expect(after.interactions).toHaveLength(1);
});

test("the starting check freezes the start locale, item locale and real first-item timer", async ({ page }) => {
  await page.getByRole("button", { name: "Проверка", exact: true }).click();
  await page.waitForTimeout(5_000);
  await page.getByRole("button", { name: "Начать проверку" }).click();
  await page.getByLabel("Как бы ты сыграл?").fill("140 страддлов");
  await page.getByLabel("Почему?").fill("Страддл задаёт рабочую ставку.");
  await page.getByRole("button", { name: /^Ответить/ }).click();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByLabel("How would you play?").fill("270 and 900 pairwise");
  await page.getByLabel("Why?").fill("Effective depth is opponent-specific in a multiway pot.");
  await page.getByRole("button", { name: /^Answer/ }).click();

  const state = await localState(page);
  expect(state.diagnostic.localeAtStart).toBe("ru");
  expect(state.diagnostic.measurementContext).toBe("COLD_BASELINE");
  expect(state.diagnostic.responses.map((item) => item.locale)).toEqual(["ru", "en"]);
  expect(state.diagnostic.responses[0].time_seconds).toBeLessThanOrEqual(4);
});

test("learning during a cold starting check invalidates baseline interpretation", async ({ page }) => {
  await page.getByRole("button", { name: "Проверка", exact: true }).click();
  await page.getByRole("button", { name: "Начать проверку" }).click();
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await answerGeometryColdCheck(page);
  const state = await localState(page);
  expect(state.diagnostic.measurementContext).toBe("MIXED_EXPOSURE_INVALID_FOR_BASELINE");
});

test("direct learner labels do not expose raw internal statuses", async ({ page }) => {
  await page.getByRole("button", { name: "Карточки" }).click();
  await expect(page.getByText(/ВСПОМНИ БЕЗ ПОДСКАЗКИ/)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/ACTIVE RECALL|PENDING_REVIEW|REVIEWED_VALID|REVIEWED_REPAIR|FIELD_VALIDATED/);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByText(/RECALL WITHOUT HINTS/)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/ACTIVE RECALL|PENDING_REVIEW|REVIEWED_VALID|REVIEWED_REPAIR|FIELD_VALIDATED/);
});

test("supports keyboard focus", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await page.keyboard.press("Tab");
  await expect(page.locator(":focus")).toBeVisible();
});

test("mobile layout has no document-level horizontal overflow in both locales", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile fixture only");
  for (const locale of ["ru", "en"]) {
    if (locale === "en") await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.locator(".route-grid article")).toHaveCount(9);
    const home = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(home.scroll).toBeLessThanOrEqual(home.client + 1);
    await page.getByRole("button", { name: locale === "ru" ? "Учиться" : "Learn" }).click();
    const learn = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(learn.scroll).toBeLessThanOrEqual(learn.client + 1);
    await page.getByRole("button", { name: locale === "ru" ? "Сегодня" : "Today" }).click();
  }
});


test("W6 Today exposes bounded session budgets in both locales", async ({ page }) => {
  for (const label of ["5 мин", "15 мин", "30 мин", "Перед игрой", "После игры"]) {
    await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
  await page.getByRole("button", { name: "5 мин", exact: true }).click();
  await expect(page.getByText(/≈\d+ мин/u).first()).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  for (const label of ["5 min", "15 min", "30 min", "Before play", "After play"]) {
    await expect(page.getByRole("button", { name: label, exact: true })).toBeVisible();
  }
});

test("Save and exit preserves the unfinished session across Today and reload", async ({ page }) => {
  await openGeometryColdCheck(page);
  await page.getByRole("button", { name: /Выйти и сохранить/u }).click();
  await expect(page.getByRole("heading", { name: /Продолжить сохранённую сессию/u })).toBeVisible();
  const saved = await localState(page);
  expect(saved.activeSession).not.toBeNull();
  expect(saved.activeSession.moduleId).toBe("geometry");
  await page.reload();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
  const restored = await localState(page);
  expect(restored.activeSession.moduleId).toBe("geometry");
  expect(restored.activeSession.step).toBe(saved.activeSession.step);
});
