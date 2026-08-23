import { expect, test } from "@playwright/test";

async function openFresh(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
}

async function expectPrimaryTabs(page, names) {
  const nav = page.getByRole("navigation", { name: /Основная навигация|Primary navigation/ });
  const buttons = nav.getByRole("button");
  await expect(buttons).toHaveCount(7);
  for (const name of names) await expect(nav.getByRole("button", { name, exact: true })).toBeVisible();
}

test("fresh RU first use exposes purpose, one next action, seven destinations and a direct first lesson", async ({ page }) => {
  await openFresh(page);

  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await expect(page.getByText(/Открой одно задание на сегодня/i)).toBeVisible();
  await expect(page.getByText(/Это не общий процент мастерства/i)).toBeVisible();
  await expectPrimaryTabs(page, ["Сегодня", "Учиться", "Повтор", "Карточки", "Карта", "Руки", "Диагностика"]);

  const start = page.getByRole("button", { name: "Начать", exact: true });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();
});

test("fresh EN first use preserves the same information architecture and direct lesson path", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();

  await expect(page.getByRole("heading", { name: /Learn in small blocks/i })).toBeVisible();
  await expect(page.getByText(/Open one useful task for today/i)).toBeVisible();
  await expect(page.getByText(/not one overall mastery score/i)).toBeVisible();
  await expectPrimaryTabs(page, ["Today", "Learn", "Review", "Cards", "Map", "Hands", "Diagnostic"]);

  const start = page.getByRole("button", { name: "Start", exact: true });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page.getByText("1 · COLD CHECK")).toBeVisible();
});

test("fresh Review empty state explains state and next source of work in RU and EN", async ({ page }) => {
  await openFresh(page);

  await page.getByRole("button", { name: "Повтор", exact: true }).click();
  await expect(page.getByText("На сегодня повторений нет.", { exact: true })).toBeVisible();
  await expect(page.getByText(/После уроков и самостоятельной практики/i)).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await page.getByRole("button", { name: "Review", exact: true }).click();
  await expect(page.getByText(/nothing.*due|no.*review.*due/i)).toBeVisible();
});

test("fresh RU skill map renders learner labels rather than raw state enums", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "Карта", exact: true }).click();

  const main = page.locator("main");
  await expect(main).toContainText("не начато");
  await expect(main).not.toContainText(/UNEXPOSED|INTRODUCED|FRAGILE|WORKING|RETAINED|FIELD_TEST_PENDING|FIELD_VALIDATED|REPAIR_REQUIRED/u);
});

test("starting diagnostic exposes purpose, optionality, duration, output, skip path and separate-review boundary", async ({ page }) => {
  await openFresh(page);

  await expect(page.getByRole("heading", { name: "Стартовая диагностика" })).toBeVisible();
  await expect(page.getByText(/10 решений без подсказок, около 15 минут/i)).toBeVisible();
  await expect(page.getByText(/После отдельного разбора/i)).toBeVisible();
  await expect(page.getByText(/Можно пропустить и сразу начать первый урок/i)).toBeVisible();

  await page.getByRole("button", { name: "Диагностика", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Проверь, как принимаешь решения сейчас/i })).toBeVisible();
  await expect(page.getByText(/10 ситуаций · около 15 минут · можно пропустить/i)).toBeVisible();
  await expect(page.getByText(/Ответы сохранятся для отдельного разбора/i)).toBeVisible();
  await expect(page.getByRole("button", { name: "Начать диагностику", exact: true })).toBeVisible();
});

test("mobile fresh first use keeps the primary action and all seven destinations reachable without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile fixture only");
  await openFresh(page);

  await expect(page.getByRole("button", { name: "Начать", exact: true })).toBeVisible();
  await expectPrimaryTabs(page, ["Сегодня", "Учиться", "Повтор", "Карточки", "Карта", "Руки", "Диагностика"]);
  const width = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(width.scroll).toBeLessThanOrEqual(width.client + 1);
});
