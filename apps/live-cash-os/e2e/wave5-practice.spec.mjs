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

async function seedLab(page, moduleId, drillIds) {
  await page.evaluate(({ key, moduleId, drillIds }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = {
      mode: "lesson",
      moduleId,
      step: 5,
      drillIds,
      currentIndex: 1,
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
  }, { key: STORAGE_KEY, moduleId, drillIds });
  await page.reload();
  await expect(page.locator(`[data-wave5-lab-module='${moduleId}']`)).toBeVisible();
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

  const novice = page.locator("[data-novice-scaffold='geometry']");
  await expect(novice).toBeVisible();
  await novice.getByRole("button", { name: /^Я решил — разобрать Cold Check/ }).click();
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

test("SPR lab teaches the calculation and recovers from exploratory edits", async ({ page }) => {
  await openGeometryLab(page);

  const gate = page.locator("[data-wave5-lab-module='geometry']");
  await expect(gate).toBeVisible();
  await expect(gate.getByRole("heading", { name: "Сначала выбери одно изменение и предскажи SPR." })).toBeVisible();
  await expect(gate.getByText("SPR простыми словами", { exact: true })).toBeVisible();
  await expect(gate).toContainText("SPR — это отношение оставшегося стека к банку после действия");
  await expect(gate).toContainText("144 ÷ 70 = 2.06");
  await expect(gate.getByText(/Старт: банк 42, стек до колла 158, ставка\/колл 14, SPR ≈ 2\.06/)).toBeVisible();
  await expect(page.locator("main .spr-lab")).toBeHidden();

  const prediction = gate.getByRole("textbox", { name: "Сначала выбери одно изменение и предскажи SPR." });
  const continueToCheck = gate.getByRole("button", { name: /Перейти к проверке/ });
  await expect(continueToCheck).toBeDisabled();
  await expect(gate.getByText(/правильность здесь не оценивается автоматически/i)).toBeVisible();

  await prediction.fill("ниже ниже ниже ниже ниже ниже ниже ниже");
  await expect(continueToCheck).toBeDisabled();

  const predictionText = "SPR ниже: банк больше";
  await prediction.fill(predictionText);
  await expect(continueToCheck).toBeEnabled();
  await continueToCheck.click();

  await expect(gate.getByRole("heading", { name: "Теперь измени ровно одно значение." })).toBeVisible();
  await expect(gate.getByText("Твой прогноз", { exact: true })).toBeVisible();
  await expect(gate.getByText(predictionText, { exact: true })).toBeVisible();
  await expect(gate).toContainText("Стартовые значения: банк 42 · стек до колла 158 · ставка/колл 14.");

  const pot = gate.getByLabel("Банк до ставки");
  const stack = gate.getByLabel("Стек до колла");
  const bet = gate.getByLabel("Ставка / колл");
  const finish = gate.getByRole("button", { name: /Готово — продолжить/ });
  const reset = gate.getByRole("button", { name: "Сбросить к стартовым значениям" });
  await expect(reset).toHaveCount(0);
  await expect(finish).toBeDisabled();

  await stack.fill("20");
  await bet.fill("30");
  await expect(gate.getByRole("alert")).toContainText("не может быть больше");
  await expect(gate.locator(".spr-lab label[data-changed='true']")).toHaveCount(2);
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(pot).toHaveValue("42");
  await expect(stack).toHaveValue("158");
  await expect(bet).toHaveValue("14");
  await expect(gate.locator(".spr-lab label[data-changed='true']")).toHaveCount(0);
  await expect(reset).toHaveCount(0);

  await pot.fill("125");
  await stack.fill("124");
  await expect(gate.getByText(/Сейчас изменены: Банк до ставки, Стек до колла/)).toBeVisible();
  await expect(finish).toBeDisabled();
  await reset.click();
  await expect(pot).toHaveValue("42");
  await expect(stack).toHaveValue("158");
  await expect(bet).toHaveValue("14");

  await pot.fill("55");
  await expect(gate.locator(".spr-lab label[data-changed='true']")).toHaveCount(1);
  await expect(gate.getByText(/SPR 2\.06 →/)).toBeVisible();
  await expect(gate.getByText("Граница")).toBeVisible();
  await expect(finish).toBeEnabled();
  await finish.click();

  await expect(page.getByText("7 · НОВЫЕ УСЛОВИЯ")).toBeVisible();
  await expect(gate).toHaveCount(0);
});

test("compare lab asks about its actual two branches and remains reversible", async ({ page }) => {
  await seedLab(page, "preflop", ["pre-01", "pre-02", "pre-03"]);

  const gate = page.locator("[data-wave5-lab-module='preflop']");
  await expect(gate.getByRole("heading", { name: "Сначала сравни «Колл» и «3-бет»." })).toBeVisible();
  await expect(gate).toContainText("Сравни две ветки по тому, что они реально выигрывают и чем рискуют.");
  await expect(gate).not.toContainText("SPR станет");
  await expect(gate.getByText(/Назови один конкретный фактор/)).toBeVisible();

  const predictionText = "Колл сохраняет реализацию, а 3-бет должен отдельно выигрывать за счёт фолдов или вэлью.";
  await gate.getByRole("textbox", { name: "Сначала сравни «Колл» и «3-бет»." }).fill(predictionText);
  await gate.getByRole("button", { name: /Перейти к проверке/ }).click();

  await expect(gate.getByRole("heading", { name: "Теперь открой оба варианта и сравни." })).toBeVisible();
  await expect(gate.getByText("Твой прогноз", { exact: true })).toBeVisible();
  await expect(gate.getByText(predictionText, { exact: true })).toBeVisible();
  const finish = gate.getByRole("button", { name: /Готово — продолжить/ });
  const left = gate.getByRole("button", { name: "Колл", exact: true });
  const right = gate.getByRole("button", { name: "3-бет", exact: true });
  await expect(finish).toBeDisabled();
  await left.click();
  await expect(finish).toBeDisabled();
  await right.click();
  await expect(gate.getByText("Граница")).toBeVisible();
  await expect(finish).toBeEnabled();
  await left.click();
  await expect(left).toHaveAttribute("aria-pressed", "true");
  await expect(finish).toBeEnabled();
});
