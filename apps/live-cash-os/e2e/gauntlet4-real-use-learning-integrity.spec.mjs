import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";
const RU_ORDER = [
  "Определи обязательную ставку или страддл, который задаёт рабочую единицу.",
  "Определи эффективный стек отдельно против каждого важного соперника.",
  "Представь новый размер банка и остаток стека после следующего действия.",
  "Оцени будущий SPR.",
  "Только после этого выбирай линию.",
];

async function disableCloud(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function seedLesson(page, { step = 0, confidence = 65 } = {}) {
  await page.evaluate(({ key, step, confidence }) => {
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
      confidence,
      startedAt: now,
      itemStartedAt: now,
      explainBack: "",
    };
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: STORAGE_KEY, step, confidence });
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
}

async function assertBody(page) {
  const session = page.locator("main .session");
  await expect(session).toBeVisible();
  await expect.poll(async () => session.locator(":scope > :not(.session-head):visible").count()).toBeGreaterThan(0);
}

async function answerRu(page, action, reason) {
  await page.getByRole("button", { name: action, exact: true }).click();
  await page.getByRole("button", { name: reason, exact: true }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
}

async function continueRu(page) {
  await page.locator("[data-g4-feedback-state]").getByRole("button", { name: /^Продолжить/ }).click();
}

async function revealOrdering(page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole("button", { name: "Проверить", exact: true }).click();
  }
  await expect(page.locator("[data-g4-ordering-state='revealed']")).toContainText("Показан рабочий порядок");
}

async function solveOrderingBounded(page) {
  const list = page.locator(".g4-order-list > li");
  let moves = 0;
  for (let target = 0; target < RU_ORDER.length; target += 1) {
    const item = list.filter({ hasText: RU_ORDER[target] });
    while (moves < 30) {
      const texts = await list.locator(".g4-order-text").allTextContents();
      const current = texts.indexOf(RU_ORDER[target]);
      if (current === target) break;
      if (current < 0) throw new Error(`Ordering item missing: ${RU_ORDER[target]}`);
      const direction = current > target ? /^Вверх:/ : /^Вниз:/;
      await item.getByRole("button", { name: direction }).click();
      moves += 1;
    }
    const texts = await list.locator(".g4-order-text").allTextContents();
    expect(texts[target]).toBe(RU_ORDER[target]);
  }
  expect(moves).toBeLessThan(30);
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.locator("[data-g4-ordering-state='correct']")).toContainText("Верно. Порядок собран.");
}

async function shot(page, testInfo, name) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

test.beforeEach(async ({ page }) => {
  await disableCloud(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("LCM-01 transition-driven progression reaches every lesson step without a header-only shell", async ({ page }, testInfo) => {
  await seedLesson(page);
  await assertBody(page);

  await answerRu(page, "140 страддлов; отдельно отметить 280 обычных BB", "Именно страддл $10 задаёт цену всех префлоп-действий");
  await expect(page.locator("[data-g4-feedback-state='correct']")).toContainText("Верно");
  await shot(page, testInfo, "desktop-feedback-correct");
  await continueRu(page);

  await assertBody(page);
  await expect(page.getByRole("heading", { name: /Сначала определи, против какого стека/i })).toBeVisible();
  await expect(page.getByText(/Само по себе это правило не говорит, какие руки нужно открывать/)).toBeVisible();
  const novice = page.locator("[data-novice-scaffold='geometry']");
  const apply = page.getByRole("button", { name: /^Сразу применить/ });
  await expect(novice).toBeVisible();
  await expect(apply).toBeHidden();
  await novice.getByRole("button", { name: /^Я решил — разобрать Cold Check/ }).click();
  await expect(apply).toBeVisible();
  await apply.click();

  await assertBody(page);
  await answerRu(page, "$270 против A и $900 против B", "Эффективный стек считается отдельно против каждого соперника");
  await continueRu(page);

  await assertBody(page);
  await expect(page.locator(".g4-ordering")).toBeVisible();
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.locator("[data-g4-ordering-state='wrong']")).toContainText("Порядок пока не собран");
  await shot(page, testInfo, "desktop-ordering-wrong");
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.locator("[data-g4-ordering-state='revealed']")).toBeVisible();
  await page.getByRole("button", { name: /^Сначала решить пример/ }).click();

  await assertBody(page);
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await expect(page.getByText(/Сохрани эту цифру как дополнительное описание/)).toBeVisible();
  await page.getByRole("button", { name: /тренаж/i }).click();

  await assertBody(page);
  const gate = page.locator("main .session > [data-wave5-lab-module='geometry']");
  await expect(gate).toBeVisible();
  expect(await gate.evaluate((element) => Boolean(element.parentElement?.matches("main .session") && element.parentElement?.isConnected))).toBe(true);
  await shot(page, testInfo, "desktop-repaired-lab-transition");
  await gate.locator("textarea").fill("SPR должен измениться, потому что меняются банк и остаток стека после действия.");
  await gate.getByRole("button", { name: /^Перейти к проверке/ }).click();
  await gate.getByLabel("Ставка / колл").fill("15");
  await gate.getByRole("button", { name: /^Готово — продолжить/ }).click();

  await assertBody(page);
  await expect(page.locator("main .session > [data-wave5-lab-module='geometry']")).toHaveCount(0);
  await answerRu(page, "Нет — сначала нужно оценить банк, остаток стека и будущий SPR", "Стартовая глубина без размера банка не показывает, сколько решений останется после действия");
  await continueRu(page);

  await assertBody(page);
  await page.locator("main .session textarea").fill("Стартовая глубина задаёт исходный масштаб, эффективный стек ограничивает сумму против конкретного соперника, а SPR показывает длину решений после действия.");
  await page.locator("main .session > button.primary").click();
  await assertBody(page);
  await page.locator("main .session > button.primary").click();
  await assertBody(page);
  await expect(page.locator("main .session .summary")).toBeVisible();
});

test("feedback matrix distinguishes correct partial and wrong while comparing only the differing part", async ({ page }, testInfo) => {
  const cases = [
    ["correct", "Верно", "140 страддлов; отдельно отметить 280 обычных BB", "Именно страддл $10 задаёт цену всех префлоп-действий"],
    ["partial", "Действие верное", "140 страддлов; отдельно отметить 280 обычных BB", "Чем больше число в BB, тем точнее оно описывает ситуацию"],
    ["partial", "Причина верная", "Только 280 обычных BB", "Именно страддл $10 задаёт цену всех префлоп-действий"],
    ["wrong", "Нужно исправить решение", "Только 280 обычных BB", "Чем больше число в BB, тем точнее оно описывает ситуацию"],
  ];
  for (const [state, title, action, reason] of cases) {
    await seedLesson(page);
    await answerRu(page, action, reason);
    const card = page.locator(`[data-g4-feedback-state='${state}']`);
    await expect(card).toContainText(title);
    if (title === "Верно") {
      await expect(card.getByText("Твой выбор", { exact: true })).toHaveCount(0);
      await expect(card.getByText("Рабочий выбор", { exact: true })).toHaveCount(0);
      const text = await card.innerText();
      expect(text.split(action).length - 1).toBe(1);
      await shot(page, testInfo, "desktop-feedback-correct-compact");
    } else if (title === "Действие верное") {
      await expect(card).toContainText("Твоя причина");
      await expect(card).toContainText("Рабочая причина");
      await expect(card).not.toContainText("Твоё действие");
      await shot(page, testInfo, "desktop-feedback-partial");
    } else if (title === "Причина верная") {
      await expect(card).toContainText("Твоё действие");
      await expect(card).toContainText("Рабочее действие");
      await expect(card).not.toContainText("Твоя причина");
    } else {
      await expect(card).toContainText("Твой выбор");
      await expect(card).toContainText("Рабочий выбор");
      await shot(page, testInfo, "desktop-feedback-wrong");
    }
  }
});

test("low-confidence correct feedback stays correct while adding calibration reinforcement", async ({ page }) => {
  await seedLesson(page, { confidence: 35 });
  await answerRu(page, "140 страддлов; отдельно отметить 280 обычных BB", "Именно страддл $10 задаёт цену всех префлоп-действий");
  const card = page.locator("[data-g4-feedback-state='correct']");
  await expect(card).toContainText("Верно");
  await expect(card).toContainText("уверенность была низкой");
});

test("ordering supports a correct keyboard path and never creates mastery or field evidence", async ({ page }, testInfo) => {
  await seedLesson(page, { step: 3 });
  const before = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { revision: state.revision, interactions: state.interactions.length, module: state.modules.geometry, fieldNotes: state.fieldNotes };
  }, STORAGE_KEY);

  const list = page.locator(".g4-order-list > li");
  const beforeOrder = await list.locator(".g4-order-text").allTextContents();
  const second = list.nth(1);
  await second.getByRole("button", { name: /^Вверх:/ }).focus();
  await page.keyboard.press("Enter");
  const afterKeyboardOrder = await list.locator(".g4-order-text").allTextContents();
  expect(afterKeyboardOrder).not.toEqual(beforeOrder);

  await solveOrderingBounded(page);
  await shot(page, testInfo, "desktop-ordering-correct");
  const after = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { revision: state.revision, interactions: state.interactions.length, module: state.modules.geometry, fieldNotes: state.fieldNotes };
  }, STORAGE_KEY);
  expect(after).toEqual(before);
});

test("ordering reload and repeated wrong attempts recover without a dead end", async ({ page }) => {
  await seedLesson(page, { step: 3 });
  await expect(page.locator(".g4-ordering")).toBeVisible();
  await page.reload();
  await expect(page.locator(".g4-ordering")).toBeVisible();
  await revealOrdering(page);
  await expect(page.getByRole("button", { name: /^Сначала решить пример/ })).toBeEnabled();
});

test("mobile 390x844 keeps partial feedback ordering and repaired lab transition usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedLesson(page);
  await answerRu(page, "140 страддлов; отдельно отметить 280 обычных BB", "Чем больше число в BB, тем точнее оно описывает ситуацию");
  await expect(page.locator("[data-g4-feedback-state='partial']")).toBeVisible();
  await shot(page, testInfo, "mobile-feedback-partial");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await seedLesson(page, { step: 3 });
  await expect(page.locator(".g4-ordering")).toBeVisible();
  await shot(page, testInfo, "mobile-ordering");
  const controls = page.locator(".g4-order-controls button");
  for (let index = 0; index < await controls.count(); index += 1) {
    const box = await controls.nth(index).boundingBox();
    if (box) expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
  }

  await seedLesson(page, { step: 4 });
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await page.getByRole("button", { name: /тренаж/i }).click();
  await assertBody(page);
  await expect(page.locator("main .session > [data-wave5-lab-module='geometry']")).toBeVisible();
  await shot(page, testInfo, "mobile-repaired-lab-transition");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});
