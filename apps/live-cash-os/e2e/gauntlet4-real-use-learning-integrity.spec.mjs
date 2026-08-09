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

async function seedLessonOnce(page, { step = 0, confidence = 65 } = {}) {
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

async function expectLearnerBody(page, expectedStep) {
  const session = page.locator("main .session");
  await expect(session).toBeVisible();
  await expect.poll(async () => session.locator(":scope > :not(.session-head):visible").count()).toBeGreaterThan(0);
  await expect(session.locator(".session-head")).toBeVisible();
  await expect(session.locator(".session-head")).toContainText(`${(expectedStep + 1) * 10}%`);
}

async function answer(page, action, reason) {
  await page.getByRole("button", { name: action, exact: true }).click();
  await page.getByRole("button", { name: reason, exact: true }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
}

async function continueFeedback(page) {
  await page.locator("[data-g4-feedback-state]").getByRole("button", { name: /^Продолжить/ }).click();
}

async function solveOrdering(page) {
  const list = page.locator(".g4-order-list > li");
  for (let target = 0; target < RU_ORDER.length; target += 1) {
    for (;;) {
      const texts = await list.locator(".g4-order-text").allTextContents();
      const current = texts.indexOf(RU_ORDER[target]);
      if (current === target) break;
      if (current < target) {
        await list.nth(current).getByRole("button", { name: /^Вниз:/ }).click();
      } else {
        await list.nth(current).getByRole("button", { name: /^Вверх:/ }).click();
      }
    }
  }
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.locator("[data-g4-ordering-state='correct']")).toContainText("Верно. Порядок собран.");
}

async function screenshot(page, testInfo, name) {
  await page.screenshot({ path: testInfo.outputPath(`${name}.png`), fullPage: true });
}

async function setConfidence(page, value) {
  await page.locator("label.confidence input[type='range']").fill(String(value));
}

test.beforeEach(async ({ page }) => {
  await disableCloud(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("LCM-01 progresses 0 through 9 through real UI transitions without a header-only shell", async ({ page }, testInfo) => {
  await seedLessonOnce(page);

  await expectLearnerBody(page, 0);
  await answer(page, "140 страддлов; отдельно отметить 280 обычных BB", "Именно страддл $10 задаёт цену всех префлоп-действий");
  await expect(page.locator("[data-g4-feedback-state='correct']")).toContainText("Верно");
  await screenshot(page, testInfo, "desktop-feedback-correct");
  await continueFeedback(page);

  await expectLearnerBody(page, 1);
  await expect(page.getByRole("heading", { name: /Сначала определи, против какого стека/i })).toBeVisible();
  await expect(page.getByText(/Само по себе это правило не говорит, какие руки нужно открывать/)).toBeVisible();
  await page.getByRole("button", { name: /^Сразу применить/ }).click();

  await expectLearnerBody(page, 2);
  await answer(page, "$270 против A и $900 против B", "Эффективный стек считается отдельно против каждого соперника");
  await continueFeedback(page);

  await expectLearnerBody(page, 3);
  await expect(page.locator(".g4-ordering")).toBeVisible();
  await page.getByRole("button", { name: "Проверить", exact: true }).click();
  await expect(page.locator("[data-g4-ordering-state='wrong']")).toContainText("Порядок пока не собран");
  await screenshot(page, testInfo, "desktop-ordering-wrong");
  await solveOrdering(page);
  await screenshot(page, testInfo, "desktop-ordering-correct");
  await page.getByRole("button", { name: /^Сначала решить пример/ }).click();

  await expectLearnerBody(page, 4);
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await expect(page.getByText(/Сохрани эту цифру как дополнительное описание/)).toBeVisible();
  await page.getByRole("button", { name: /тренаж/i }).click();

  await expectLearnerBody(page, 5);
  const gate = page.locator("main .session > [data-wave5-lab-module='geometry']");
  await expect(gate).toBeVisible();
  await expect(gate.evaluate((element) => element.parentElement?.matches("main .session") && element.parentElement?.isConnected)).resolves.toBe(true);
  await screenshot(page, testInfo, "desktop-repaired-lab-transition");
  await gate.locator("textarea").fill("SPR должен измениться, потому что меняются банк и остаток стека после действия.");
  await gate.getByRole("button", { name: /^Зафиксировать прогноз/ }).click();
  await gate.getByLabel("Ставка / колл").fill("15");
  await gate.getByRole("button", { name: /^Зафиксировать вывод/ }).click();

  await expectLearnerBody(page, 6);
  await expect(page.locator("main .session > [data-wave5-lab-module='geometry']")).toHaveCount(0);
  await answer(page, "Нет — сначала нужно оценить банк, остаток стека и будущий SPR", "Стартовая глубина без размера банка не показывает, сколько решений останется после действия");
  await continueFeedback(page);

  await expectLearnerBody(page, 7);
  await page.locator("main .session textarea").fill("Стартовая глубина задаёт исходный масштаб, эффективный стек ограничивает сумму против конкретного соперника, а SPR показывает длину решений после действия.");
  await page.locator("main .session > button.primary").click();

  await expectLearnerBody(page, 8);
  await page.locator("main .session > button.primary").click();

  await expectLearnerBody(page, 9);
  await expect(page.locator("main .session .summary")).toBeVisible();
});

test("feedback matrix shows only the material difference and never duplicates a fully correct answer", async ({ page }, testInfo) => {
  const cases = [
    {
      name: "full",
      action: "140 страддлов; отдельно отметить 280 обычных BB",
      reason: "Именно страддл $10 задаёт цену всех префлоп-действий",
      state: "correct",
      title: "Верно",
    },
    {
      name: "action-only",
      action: "140 страддлов; отдельно отметить 280 обычных BB",
      reason: "Чем больше число в BB, тем точнее оно описывает ситуацию",
      state: "partial",
      title: "Действие верное",
    },
    {
      name: "reason-only",
      action: "Только 280 обычных BB",
      reason: "Именно страддл $10 задаёт цену всех префлоп-действий",
      state: "partial",
      title: "Причина верная",
    },
    {
      name: "both-wrong",
      action: "Только 280 обычных BB",
      reason: "Чем больше число в BB, тем точнее оно описывает ситуацию",
      state: "wrong",
      title: "Нужно исправить решение",
    },
  ];

  for (const entry of cases) {
    await seedLessonOnce(page);
    await answer(page, entry.action, entry.reason);
    const card = page.locator(`[data-g4-feedback-state='${entry.state}']`);
    await expect(card).toContainText(entry.title);
    if (entry.name === "full") {
      await expect(card.getByText("Твой выбор", { exact: true })).toHaveCount(0);
      await expect(card.getByText("Рабочий выбор", { exact: true })).toHaveCount(0);
      await expect(card.getByText(entry.action, { exact: true })).toHaveCount(1);
      await screenshot(page, testInfo, "desktop-feedback-correct-compact");
    } else if (entry.name === "action-only") {
      await expect(card).toContainText("Твоя причина");
      await expect(card).toContainText("Рабочая причина");
      await expect(card).not.toContainText("Твоё действие");
      await screenshot(page, testInfo, "desktop-feedback-partial");
    } else if (entry.name === "reason-only") {
      await expect(card).toContainText("Твоё действие");
      await expect(card).toContainText("Рабочее действие");
      await expect(card).not.toContainText("Твоя причина");
    } else {
      await expect(card).toContainText("Твой выбор");
      await expect(card).toContainText("Рабочий выбор");
      await screenshot(page, testInfo, "desktop-feedback-wrong");
    }
  }
});

test("low-confidence correct feedback remains semantically correct but reinforces the mechanism", async ({ page }) => {
  await seedLessonOnce(page);
  await setConfidence(page, 35);
  await answer(page, "140 страддлов; отдельно отметить 280 обычных BB", "Именно страддл $10 задаёт цену всех префлоп-действий");
  const card = page.locator("[data-g4-feedback-state='correct']");
  await expect(card).toContainText("Верно");
  await expect(card).toContainText("уверенность была низкой");
});

test("ordering is keyboard-operable, bounded after repeated misses, and does not create evidence", async ({ page }) => {
  await seedLessonOnce(page, { step: 3 });
  const before = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { revision: state.revision, interactions: state.interactions.length, module: state.modules.geometry };
  }, STORAGE_KEY);

  const firstUp = page.locator(".g4-order-list > li").nth(1).getByRole("button", { name: /^Вверх:/ });
  await firstUp.focus();
  await page.keyboard.press("Enter");
  await expect(firstUp).toBeFocused();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole("button", { name: "Проверить", exact: true }).click();
  }
  await expect(page.locator("[data-g4-ordering-state='revealed']")).toContainText("Показан рабочий порядок");

  const after = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { revision: state.revision, interactions: state.interactions.length, module: state.modules.geometry };
  }, STORAGE_KEY);
  expect(after).toEqual(before);
});

test("mobile 390x844 keeps partial feedback, ordering and repaired lab transition usable", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedLessonOnce(page);
  await answer(page, "140 страддлов; отдельно отметить 280 обычных BB", "Чем больше число в BB, тем точнее оно описывает ситуацию");
  const partial = page.locator("[data-g4-feedback-state='partial']");
  await expect(partial).toBeVisible();
  await screenshot(page, testInfo, "mobile-feedback-partial");
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);

  await seedLessonOnce(page, { step: 3 });
  await expect(page.locator(".g4-ordering")).toBeVisible();
  await screenshot(page, testInfo, "mobile-ordering");
  for (const button of await page.locator(".g4-order-controls button").all()) {
    const box = await button.boundingBox();
    if (box) expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
  }

  await seedLessonOnce(page, { step: 4 });
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await page.getByRole("button", { name: /тренаж/i }).click();
  await expectLearnerBody(page, 5);
  await expect(page.locator("main .session > [data-wave5-lab-module='geometry']")).toBeVisible();
  await screenshot(page, testInfo, "mobile-repaired-lab-transition");
  await expect.poll(async () => page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("shared feedback and ordering copy remains coherent after switching to English", async ({ page }) => {
  await seedLessonOnce(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await answer(page, "140 straddle big blinds; also note 280 ordinary BB", "$10 sets the current price of the preflop decision tree");
  await expect(page.locator("[data-g4-feedback-state='correct']")).toContainText("Correct");
  await page.locator("[data-g4-feedback-state='correct']").getByRole("button", { name: /^Continue/ }).click();
  await page.getByRole("button", { name: /^Apply it now/ }).click();
  await answer(page, "$270 against A and $900 against B", "Effective stack is calculated separately for each relevant pair of players");
  await page.locator("[data-g4-feedback-state='correct']").getByRole("button", { name: /^Continue/ }).click();
  await expect(page.getByRole("heading", { name: "Put the steps in working order" })).toBeVisible();
  await expect(page.locator("main .session")).not.toContainText("Собери");
});
