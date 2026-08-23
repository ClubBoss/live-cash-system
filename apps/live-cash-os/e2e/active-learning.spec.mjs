import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function seedModuleLesson(page, moduleId, drillIds, step = 1) {
  await page.evaluate(({ key, moduleId, drillIds, step }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = {
      mode: "lesson",
      moduleId,
      step,
      drillIds,
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
  }, { key: STORAGE_KEY, moduleId, drillIds, step });
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
}

async function seedLesson(page, step = 1) {
  await seedModuleLesson(page, "geometry", ["geo-01", "geo-02", "geo-04"], step);
}

async function seedWorkedExample(page, moduleId, drillIds) {
  await seedModuleLesson(page, moduleId, drillIds, 4);
}

async function delayFirstSessionPrimaryOnNextNavigation(page, delayMs = 180) {
  await page.addInitScript((delay) => {
    window.__n1DelayedPrimaryObserved = false;
    document.addEventListener("DOMContentLoaded", () => {
      let delayed = false;
      const observer = new MutationObserver(() => {
        if (delayed) return;
        const button = document.querySelector("main .session > .primary");
        if (!(button instanceof HTMLElement) || !button.parentElement) return;
        delayed = true;
        window.__n1DelayedPrimaryObserved = true;
        const parent = button.parentElement;
        const nextSibling = button.nextSibling;
        button.remove();
        window.setTimeout(() => {
          if (!button.isConnected && parent.isConnected) {
            parent.insertBefore(button, nextSibling?.isConnected ? nextSibling : null);
          }
          observer.disconnect();
        }, delay);
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }, { once: true });
  }, delayMs);
}

async function chooseOption(page, text) {
  await page.getByRole("button", { name: text, exact: true }).click();
}

async function revealOrderingAfterBoundedMisses(page) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.getByRole("button", { name: "Проверить", exact: true }).click();
  }
  await expect(page.locator("[data-g4-ordering-state='revealed']")).toContainText("Показан рабочий порядок");
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("lesson teaches terms, recognition, decision order and a guided Cold Check before controlled application", async ({ page }) => {
  await seedLesson(page, 1);

  await expect(page.getByText("ЗАПОМНИ", { exact: true })).toBeVisible();
  await expect(page.getByText("Рабочая ставка → эффективный стек → банк и стек после действия.", { exact: true })).toBeVisible();
  const extraTheory = page.getByText("В мультивей-банке эффективный стек считается отдельно против каждого соперника.", { exact: true });
  await expect(extraTheory).not.toBeVisible();
  await page.getByText("Дополнительное объяснение", { exact: true }).click();
  await expect(extraTheory).toBeVisible();

  const scaffold = page.locator("[data-novice-scaffold='geometry']");
  await expect(scaffold).toBeVisible();
  await expect(scaffold.getByText("Эффективный стек", { exact: true })).toBeVisible();
  await expect(scaffold.getByText("SPR", { exact: true })).toBeVisible();
  await expect(scaffold.getByText("Что замечать за столом", { exact: true })).toBeVisible();
  await expect(scaffold.getByText("В каком порядке проверять", { exact: true })).toBeVisible();
  await expect(scaffold.locator("[data-guided-cold-example='geo-01']")).toBeVisible();

  const applyButton = page.getByRole("button", { name: /^Сразу применить/ });
  await expect(applyButton).toBeHidden();
  await scaffold.getByRole("button", { name: /^Я решил — разобрать Cold Check/ }).click();
  await expect(scaffold.locator("[data-guided-cold-example='geo-01'] .answer-panel")).toBeVisible();
  await expect(applyButton).toBeVisible();
  await applyButton.click();

  await expect(page.getByRole("heading", { name: "Как правильно описать эффективный стек?" })).toBeVisible();
  await chooseOption(page, "$270 против A и $900 против B");
  await chooseOption(page, "Эффективный стек считается отдельно против каждого соперника");
  await page.getByRole("button", { name: /^Ответить/ }).click();
  const feedback = page.locator("[data-g4-feedback-state='correct']");
  await expect(feedback).toContainText("Верно");
  await expect(feedback.getByText("Твой выбор", { exact: true })).toHaveCount(0);
  await feedback.getByRole("button", { name: /^Продолжить/ }).click();

  await expect(page.getByRole("heading", { name: "Собери шаги в рабочем порядке" })).toBeVisible();
  await revealOrderingAfterBoundedMisses(page);
  const solveExample = page.getByRole("button", { name: /^Сначала решить пример/ });
  await expect(solveExample).toBeVisible();
  await solveExample.click();

  await expect(page.getByRole("heading", { name: "$2/$5/$10 с обязательным страддлом. У Hero и соперника по $1,400." })).toBeVisible();
  await expect(page.getByText("Что нужно решить сейчас:", { exact: true })).toBeVisible();
  await expect(page.getByText(/в каких единицах считать глубину при обязательном страддле/i)).toBeVisible();
  await expect(page.getByText(/Сначала выбери линию в голове/i)).not.toBeVisible();
  await expect(page.getByText("Сначала 140 страддлов, затем эффективный стек против соперника и SPR после действия.", { exact: true })).not.toBeVisible();
  await page.getByRole("button", { name: /^Я решил — показать разбор/ }).click();
  await expect(page.getByText("Сначала 140 страддлов, затем эффективный стек против соперника и SPR после действия.", { exact: true })).toBeVisible();
});

test("novice scaffold mounts after a deliberately delayed direct Apply host", async ({ page }) => {
  await delayFirstSessionPrimaryOnNextNavigation(page);
  await seedLesson(page, 1);

  await expect.poll(async () => page.evaluate(() => Boolean(window.__n1DelayedPrimaryObserved))).toBe(true);
  const scaffold = page.locator("[data-novice-scaffold='geometry']");
  await expect(scaffold).toBeVisible();
  await expect(page.locator("main .session > [data-novice-scaffold-slot]")).toHaveCount(1);
  await expect(page.getByRole("button", { name: /^Сразу применить/ })).toBeHidden();
});

test("LCM-02 defines modern vocabulary and call price before its first post-cold application", async ({ page }) => {
  await seedModuleLesson(page, "preflop", ["pre-01", "pre-02", "pre-03"], 1);

  const scaffold = page.locator("[data-novice-scaffold='preflop']");
  await expect(scaffold).toBeVisible();
  for (const term of ["Диапазон", "Эквити", "Реализация эквити", "Доминация", "Блокер", "Полярный сквиз"]) {
    await expect(scaffold.getByText(term, { exact: true })).toBeVisible();
  }
  const price = scaffold.locator("[data-call-price-prerequisite='true']");
  await expect(price).toContainText("Цена колла = колл / (банк после ставки соперника + твой колл).");
  await expect(price).toContainText("50 / 200 = 25%");
  await expect(price).toContainText("четверть итогового банка");
  await expect(price).toContainText("сама формула не выбирает покерное действие");

  const applyButton = page.getByRole("button", { name: /^Сразу применить/ });
  await expect(applyButton).toBeHidden();
  await scaffold.getByRole("button", { name: /^Я решил — разобрать Cold Check/ }).click();
  await expect(applyButton).toBeVisible();
});

test("LCM-08 primary lesson scaffold does not require raw MDF vocabulary", async ({ page }) => {
  await seedModuleLesson(page, "multiway", ["mul-01", "mul-02", "mul-04"], 1);
  await expect(page.locator("main .session")).not.toContainText(/\bMDF\b/);
  await expect(page.getByText("Не считай, что один игрок обязан нести всю защиту как в игре один на один.", { exact: true })).toBeVisible();
});

test("worked examples state the concrete task in modules that are not betting-line decisions", async ({ page }) => {
  await seedWorkedExample(page, "blinds", ["bli-01", "bli-02", "bli-04"]);

  await expect(page.getByText("Что нужно решить сейчас:", { exact: true })).toBeVisible();
  await expect(page.getByText(/Сравни план на одном и том же флопе против BB-защиты и SB-колла/i)).toBeVisible();
  await expect(page.getByText(/как это меняет план/i)).toBeVisible();
  await expect(page.getByText(/Сначала выбери линию в голове/i)).not.toBeVisible();
  await expect(page.getByRole("button", { name: /^Я решил — показать разбор/ })).toBeVisible();
});

test("lesson summary says what was checked and keeps delayed retention explicitly pending", async ({ page }) => {
  await seedLesson(page, 9);

  await expect(page.getByText("Что уже проверено", { exact: true })).toBeVisible();
  await expect(page.getByText(/Этот урок не проверял удержание после паузы/)).toBeVisible();
  await expect(page.getByRole("heading", { name: /Теперь её нужно закрепить/i })).toBeVisible();
});

test("active-learning scaffold remains bilingual without Cyrillic fallback in English", async ({ page }) => {
  await seedLesson(page, 1);
  await page.getByRole("button", { name: "EN", exact: true }).click();

  await expect(page.getByText("REMEMBER", { exact: true })).toBeVisible();
  const scaffold = page.locator("[data-novice-scaffold='geometry']");
  await expect(scaffold.getByText("Effective stack", { exact: true })).toBeVisible();
  await expect(scaffold.getByText("SPR", { exact: true })).toBeVisible();
  const applyButton = page.getByRole("button", { name: /^Apply it now/ });
  await expect(applyButton).toBeHidden();
  await expect(page.locator("main .session")).not.toContainText(/[А-Яа-яЁё]/);
  await scaffold.getByRole("button", { name: /^I decided — review the Cold Check/ }).click();
  await expect(applyButton).toBeVisible();
});

test("novice scaffold has no horizontal overflow at 390x844", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await seedModuleLesson(page, "preflop", ["pre-01", "pre-02", "pre-03"], 1);
  await expect(page.locator("[data-novice-scaffold='preflop']")).toBeVisible();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
});