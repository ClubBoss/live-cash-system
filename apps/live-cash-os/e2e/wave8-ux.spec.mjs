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

async function seedExplainBack(page) {
  const state = await localState(page);
  await page.evaluate(({ key, value }) => {
    value.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step: 7,
      drillIds: ["geo-01", "geo-04"],
      currentIndex: 0,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: new Date().toISOString(),
      itemStartedAt: new Date().toISOString(),
      explainBack: "",
    };
    localStorage.setItem(key, JSON.stringify(value));
  }, { key: STORAGE_KEY, value: state });
  await page.reload();
}

async function fillHand(page) {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await page.getByLabel("Связанная тема").selectOption("geometry");
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
  await page.getByLabel("Почему — до результата").fill("Keep weaker hands in and avoid turning the hand into a raise without enough reason.");
}

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
}

test("390px Today stays focused, tappable and overflow-free", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLocal(page);
  await expectNoHorizontalOverflow(page);

  const start = page.getByRole("button", { name: "Начать", exact: true });
  await expect(start).toBeVisible();
  const startBox = await start.boundingBox();
  expect(startBox?.height ?? 0).toBeGreaterThanOrEqual(44);
  expect(startBox?.width ?? 0).toBeGreaterThanOrEqual(44);

  for (const name of ["5 мин", "15 мин", "30 мин", "Перед игрой", "После игры"]) {
    const control = page.getByRole("button", { name, exact: true });
    const box = await control.boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  }
});

test("long real-hand capture is labeled, reachable and overflow-free at 390px", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openLocal(page);
  await fillHand(page);
  await expectNoHorizontalOverflow(page);

  const lock = page.getByRole("button", { name: "Зафиксировать решение" });
  await expect(lock).toBeVisible();
  await lock.scrollIntoViewIfNeeded();
  await expect(lock).toBeInViewport();
  await lock.click();
  await expect(page.getByText(/Решение зафиксировано до результата/)).toBeVisible();
  await expectNoHorizontalOverflow(page);
});

test("explain-back has an accessible name and focus moves to the next meaningful context", async ({ page }) => {
  await openLocal(page);
  await seedExplainBack(page);

  const textarea = page.locator("textarea.large-input");
  await expect(textarea).toHaveAttribute("aria-labelledby", /w8-textarea-heading-/);
  await textarea.fill("Сначала определяю эффективный стек и рабочую единицу ставок, затем строю решение из этой геометрии, а не из номинального числа BB.");
  await page.getByRole("button", { name: "Сохранить объяснение" }).click();
  await expect(page.getByText("9 · СРАВНИ СВОЁ ОБЪЯСНЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Сверь механизм, а не отдельные слова." })).toBeVisible();
  await expect(page.locator(":focus")).toHaveAttribute("tabindex", "-1");
});

test("session progress exposes progressbar semantics", async ({ page }) => {
  await openLocal(page);
  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  const progress = page.getByRole("progressbar");
  await expect(progress).toHaveAttribute("aria-valuemin", "0");
  await expect(progress).toHaveAttribute("aria-valuemax", "100");
  await expect(progress).toHaveAttribute("aria-valuenow", /\d+/);
});

test("primary controls have visible focus treatment", async ({ page }) => {
  await openLocal(page);
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  const outline = await focused.evaluate((element) => getComputedStyle(element).outlineStyle);
  expect(outline).not.toBe("none");
});

test("reduced motion suppresses meaningful transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openLocal(page);
  const duration = await page.getByRole("button", { name: "Начать", exact: true }).evaluate((element) => getComputedStyle(element).transitionDuration);
  const seconds = duration.endsWith("ms")
    ? Number.parseFloat(duration) / 1000
    : Number.parseFloat(duration);
  expect(seconds).toBeLessThanOrEqual(0.000001);
});

test("key primary surfaces remain overflow-free across target viewport sanity matrix", async ({ page }) => {
  await openLocal(page);
  for (const viewport of [
    { width: 375, height: 667 },
    { width: 390, height: 844 },
    { width: 430, height: 932 },
    { width: 360, height: 800 },
    { width: 844, height: 390 },
    { width: 768, height: 1024 },
  ]) {
    await page.setViewportSize(viewport);
    await page.getByRole("button", { name: "Сегодня", exact: true }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Учиться", exact: true }).click();
    await expectNoHorizontalOverflow(page);
    await page.getByRole("button", { name: "Карта", exact: true }).click();
    await expectNoHorizontalOverflow(page);
  }
});
