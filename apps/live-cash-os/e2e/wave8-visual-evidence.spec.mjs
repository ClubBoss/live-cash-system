import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function shot(page, testInfo, name) {
  const body = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body, contentType: "image/png" });
}

async function state(page) {
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).not.toBeNull();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), STORAGE_KEY);
}

async function fillHand(page) {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
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

test("captures the Wave 8 visual QA evidence set", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "single canonical evidence pass");
  await openLocal(page);

  await page.setViewportSize({ width: 1440, height: 900 });
  await shot(page, testInfo, "01-today-desktop");

  await page.setViewportSize({ width: 390, height: 844 });
  await shot(page, testInfo, "02-today-390x844");

  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await shot(page, testInfo, "03-learning-decision");

  await page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" }).click();
  await page.getByRole("button", { name: "Именно страддл $10 задаёт цену всех префлоп-действий" }).click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
  await shot(page, testInfo, "04-decision-feedback");

  await page.getByRole("button", { name: "Карта", exact: true }).click();
  await shot(page, testInfo, "05-skill-map-progress");

  await fillHand(page);
  await shot(page, testInfo, "06-real-hand-pre-result");
  await page.getByRole("button", { name: "Зафиксировать решение" }).click();
  const current = await state(page);
  const noteId = current.fieldNotes.at(-1).id;
  const card = page.locator(".field-list article").filter({ hasText: "Keep weaker hands in" }).first();
  await card.getByLabel("Результат").fill("Villain showed AQ and won");
  await card.getByLabel("Шоудаун (если был)").fill("AQ");
  await card.getByRole("button", { name: "Добавить результат" }).click();
  await card.getByLabel(new RegExp(`Самопроверка ${noteId}`)).fill("Line reviewed after the result; pre-result reasoning remains locked separately.");
  await shot(page, testInfo, "07-real-hand-post-result-self-review");

  const seeded = await state(page);
  await page.evaluate(({ key, value }) => {
    value.explainBackRecords = [
      {
        id: "w8-evidence-earlier",
        at: new Date(Date.now() - 86400000).toISOString(),
        moduleId: "geometry",
        promptKey: "geometry.explainBack",
        text: "Сначала смотрю на номинальные BB и только потом вспоминаю про страддл.",
        status: "REVIEWED_REPAIR",
        reviewerNote: "Нужно начинать с рабочей единицы ставок.",
        reviewedAt: new Date(Date.now() - 86000000).toISOString(),
      },
      {
        id: "w8-evidence-latest",
        at: new Date().toISOString(),
        moduleId: "geometry",
        promptKey: "geometry.explainBack",
        text: "Сначала определяю рабочую ставку и эффективный стек в ней, затем отдельно перевожу глубину в обычные BB.",
        status: "PENDING_REVIEW",
        reviewerNote: "",
      },
    ];
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
  }, { key: STORAGE_KEY, value: seeded });
  await page.reload();
  await shot(page, testInfo, "08-explain-back-history");
});
