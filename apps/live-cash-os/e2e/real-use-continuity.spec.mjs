import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function seedGeometryLesson(page, step = 0) {
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
}

async function viewportAnchorTop(locator) {
  return locator.evaluate((node) => node.getBoundingClientRect().top);
}

test("valid local lesson renders while cloud reconciliation is deliberately blocked", async ({ page }) => {
  await localOnly(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedGeometryLesson(page, 4);

  await page.unroute("**/api/state");
  let remoteStarted = false;
  let remoteFinished = false;
  let releaseRemote;
  const gate = new Promise((resolve) => { releaseRemote = resolve; });
  await page.route("**/api/state", async (route) => {
    if (route.request().method() !== "GET") {
      await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
      return;
    }
    remoteStarted = true;
    await gate;
    remoteFinished = true;
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "delayed cloud" }) });
  });

  await page.reload();
  await expect(page.locator("main .session")).toBeVisible({ timeout: 1000 });
  await expect(page.getByText("Что нужно решить сейчас:")).toBeVisible({ timeout: 1000 });
  await expect.poll(() => remoteStarted, { timeout: 1000 }).toBe(true);
  expect(remoteFinished).toBe(false);

  releaseRemote();
  await expect.poll(() => remoteFinished).toBe(true);
});

test("previous-step recap is read-only and preserves the current lesson step", async ({ page }) => {
  await localOnly(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedGeometryLesson(page, 6);
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();

  const before = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { revision: state.revision, step: state.activeSession.step };
  }, STORAGE_KEY);

  await page.getByRole("button", { name: "← Предыдущий шаг" }).click();
  await expect(page.getByRole("dialog", { name: "Предыдущий шаг" })).toContainText("только просмотр");
  await expect(page.getByRole("dialog", { name: "Предыдущий шаг" })).toContainText("ничего не пересчитывает");
  await page.getByRole("button", { name: "Вернуться к текущему шагу" }).click();

  const after = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { revision: state.revision, step: state.activeSession.step };
  }, STORAGE_KEY);
  expect(after).toEqual(before);
});

test("Cold Check reveal preserves the learner viewport on desktop and mobile", async ({ page }) => {
  await localOnly(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();

  for (const viewport of [{ width: 1280, height: 720 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await seedGeometryLesson(page, 1);
    await page.reload();

    const guided = page.locator("[data-guided-cold-example='geo-01']");
    const reveal = guided.getByRole("button", { name: "Я решил — разобрать Cold Check" });
    await expect(reveal).toBeVisible();
    await reveal.scrollIntoViewIfNeeded();
    await page.evaluate(() => window.scrollBy(0, 120));
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
    const beforeTop = await viewportAnchorTop(guided);

    await reveal.click();
    await expect(guided.locator(".answer-panel")).toBeVisible();
    await expect.poll(async () => Math.abs((await viewportAnchorTop(guided)) - beforeTop)).toBeLessThan(4);
  }
});

test("worked-example reveal does not reset the current viewport", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localOnly(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedGeometryLesson(page, 4);
  await page.reload();

  const reveal = page.getByRole("button", { name: "Я решил — показать разбор" });
  await expect(reveal).toBeVisible();
  await reveal.scrollIntoViewIfNeeded();
  const before = await page.evaluate(() => window.scrollY);
  await reveal.click();
  await expect(page.locator("main .session .answer-panel")).toBeVisible();
  const after = await page.evaluate(() => window.scrollY);
  expect(Math.abs(after - before)).toBeLessThan(80);
});

test("SPR lab explains the calculation, normalizes input and can reset on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localOnly(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedGeometryLesson(page, 5);
  await page.reload();

  const gate = page.locator("main .session > [data-wave5-lab-module='geometry']");
  await expect(gate).toBeVisible();
  await expect(gate).toContainText("Сначала выбери одно изменение и предскажи SPR.");
  await expect(gate).toContainText("SPR простыми словами");
  await expect(gate).toContainText("SPR — это отношение оставшегося стека к банку после действия");
  await expect(gate).toContainText("144 ÷ 70 = 2.06");
  await expect(gate).toContainText("Старт: банк 42, стек до колла 158, ставка/колл 14, SPR ≈ 2.06");
  await expect(gate).toContainText("станет SPR выше, ниже или примерно тем же и почему");
  await gate.locator("textarea").fill("SPR станет ниже, потому что банк после действия станет больше.");
  const labAnchorBefore = await viewportAnchorTop(gate);
  await gate.getByRole("button", { name: /^Перейти к проверке/ }).click();
  await expect.poll(async () => Math.abs((await viewportAnchorTop(gate)) - labAnchorBefore)).toBeLessThan(80);

  const pot = gate.getByLabel("Банк до ставки");
  const stack = gate.getByLabel("Стек до колла");
  const reset = gate.getByRole("button", { name: "Сбросить к стартовым значениям" });
  await pot.fill("055");
  await expect(pot).toHaveValue("55");
  await stack.fill("170");
  await expect(gate.getByText(/Сейчас изменены: Банк до ставки, Стек до колла/)).toBeVisible();
  await expect(reset).toBeVisible();
  await reset.click();
  await expect(pot).toHaveValue("42");
  await expect(stack).toHaveValue("158");
  await expect(gate.getByLabel("Ставка / колл")).toHaveValue("14");
  await expect(reset).toHaveCount(0);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test("correct feedback paints one compact result and one visible Continue", async ({ page }) => {
  await localOnly(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await seedGeometryLesson(page, 0);
  await page.reload();

  await page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB", exact: true }).click();
  await page.getByRole("button", { name: "Именно страддл $10 задаёт цену всех префлоп-действий", exact: true }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();

  const feedback = page.locator("[data-g4-feedback-state='correct']");
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText("Действие и причина верны");
  await expect(feedback.getByText("Твой выбор", { exact: true })).toHaveCount(0);
  await expect(feedback.getByText("Рабочий выбор", { exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: /^Продолжить/ })).toHaveCount(1);
});