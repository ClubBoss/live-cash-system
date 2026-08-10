import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function seedCompletedModules(page, moduleIds) {
  await page.evaluate(({ key, ids }) => {
    const state = JSON.parse(localStorage.getItem(key));
    for (const module of Object.values(state.modules)) module.contentCompleted = false;
    for (const id of ids) state.modules[id].contentCompleted = true;
    state.activeSession = null;
    state.revision += 1;
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, ids: moduleIds });
  await page.reload();
}

async function continueSemanticFeedback(page) {
  const feedback = page.locator("[data-g4-feedback-state]");
  await expect(feedback).toBeVisible();
  await feedback.getByRole("button", { name: /^Продолжить/ }).click();
}

async function passOrderingByBoundedReveal(page) {
  const ordering = page.locator(".g4-ordering");
  await expect(ordering).toBeVisible();
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await ordering.getByRole("button", { name: "Проверить", exact: true }).click();
  }
  await expect(ordering).toHaveAttribute("data-g4-ordering-state", "revealed");
  await ordering.getByRole("button", { name: /^Сначала решить пример/ }).click();
}

async function openGeometryLab(page) {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" }).click();
  await page.getByRole("button", { name: "Именно страддл $10 задаёт цену всех префлоп-действий" }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
  await continueSemanticFeedback(page);

  await page.getByRole("button", { name: /^Сразу применить/ }).click();
  await page.getByRole("button", { name: "Глубокий старт может превратиться в низкий SPR уже на флопе" }).click();
  await page.getByRole("button", { name: "Длина дальнейшего розыгрыша зависит от остатка стека относительно уже построенного банка" }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
  await continueSemanticFeedback(page);

  await passOrderingByBoundedReveal(page);
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await page.getByRole("button", { name: /^Открыть тренажёр/ }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("mixed practice requires three completed topics and conceals the topic before the decision", async ({ page }) => {
  await seedCompletedModules(page, ["geometry", "preflop"]);
  await page.getByRole("button", { name: "Учиться" }).click();
  const mixed = page.getByRole("button", { name: "Смешанная практика" });
  await expect(page.getByText(/Смешанная практика и серия быстрых решений откроются после трёх пройденных тем. Сейчас: 2\/3/i)).toBeVisible();
  await expect(mixed).toBeDisabled();

  await seedCompletedModules(page, ["geometry", "preflop", "blinds"]);
  await page.getByRole("button", { name: "Учиться" }).click();
  await expect(mixed).toBeEnabled();
  await mixed.click();

  const decision = page.locator(".decision-card");
  await expect(decision).toHaveAttribute("aria-label", "Смешанная задача");
  const eyebrow = decision.locator(":scope > .eyebrow");
  await expect(eyebrow).toHaveAttribute("aria-hidden", "true");
  await expect(eyebrow).toHaveCSS("font-size", "0px");
  await expect(page.locator(".session-head > div > span:first-of-type")).toContainText(/^СМЕШАННАЯ ПРАКТИКА · 1\//);
});

test("lesson lab requires a prediction, validates inputs and tests a material change before continuing", async ({ page }) => {
  await openGeometryLab(page);

  const gate = page.locator("[data-wave5-lab-module='geometry']");
  await expect(gate).toBeVisible();
  await expect(gate.getByRole("heading", { name: "Сначала спрогнозируй результат." })).toBeVisible();
  await expect(page.locator("main .spr-lab")).toBeHidden();

  const prediction = gate.getByRole("textbox", { name: "Сначала спрогнозируй результат." });
  const lockPrediction = gate.getByRole("button", { name: /Зафиксировать прогноз/ });
  await expect(lockPrediction).toBeDisabled();
  await expect(gate.getByText(/сформулируй и ожидаемое изменение, и причину своими словами/i)).toBeVisible();
  await expect(gate).not.toContainText(/символ/i);
  await prediction.fill("SPR снизится");
  await expect(lockPrediction).toBeDisabled();
  await expect(gate.getByText(/сформулируй и ожидаемое изменение, и причину своими словами/i)).toBeVisible();

  await prediction.fill("Если банк растёт быстрее остатка стека, будущий SPR должен уменьшиться.");
  await lockPrediction.click();

  await expect(gate.getByRole("heading", { name: "Измени хотя бы одну важную переменную." })).toBeVisible();
  await gate.getByLabel("Оставшийся стек").fill("20");
  await gate.getByLabel("Ставка / колл").fill("30");
  await expect(gate.getByLabel("Оставшийся стек")).toHaveValue("20");
  await expect(gate.getByLabel("Ставка / колл")).toHaveValue("30");
  await expect(gate.getByRole("alert")).toContainText("не может быть больше");
  await expect(gate.getByRole("button", { name: /Зафиксировать вывод/ })).toBeDisabled();

  await gate.getByLabel("Ставка / колл").fill("10");
  await expect(gate.locator(".spr-result b")).not.toHaveText("—");
  await expect(gate.getByText("Граница")).toBeVisible();
  await gate.getByRole("button", { name: /Зафиксировать вывод/ }).click();

  await expect(page.getByText("7 · НОВЫЕ УСЛОВИЯ")).toBeVisible();
  await expect(gate).toHaveCount(0);
});
