import { expect, test } from "@playwright/test";

async function resetAnonymousState(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("live-cash-os:learner-state");
    localStorage.removeItem("live-cash-os:locale");
  });
  await page.reload();
}

function mainNav(page) {
  return page.getByRole("navigation", { name: /Основная навигация|Main navigation/ });
}

async function openFirstLesson(page, locale = "ru") {
  await mainNav(page).getByRole("button", { name: locale === "ru" ? "Учиться" : "Learn", exact: true }).click();
  await page.locator(".module-list article").first().getByRole("button", { name: locale === "ru" ? "Изучить" : "Learn", exact: true }).click();
}

async function answerFirstColdDecision(page) {
  await page.getByRole("button", { name: /140.*280/u }).click();
  await page.getByRole("button", { name: /\$10/u }).click();
  await page.getByRole("button", { name: /Зафиксировать решение/ }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await resetAnonymousState(page);
  await expect(page.getByRole("heading", { name: /Учись коротко/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "RU" })).toHaveAttribute("aria-pressed", "true");
});

test("shows an explicit route from zero to field validation", async ({ page }) => {
  await expect(page.getByRole("heading", { name: /Что означает путь 0.*100%/i })).toBeVisible();
  await expect(page.locator(".route-grid article")).toHaveCount(9);
  await expect(page.locator(".route-grid article").first()).toContainText("0%");
  await expect(page.locator(".route-grid article").last()).toContainText("100%");
});

test("completes the Russian cold decision and reaches the teaching layer", async ({ page }) => {
  await openFirstLesson(page, "ru");
  await expect(page.getByText("1 · ВОПРОС БЕЗ ПОДСКАЗКИ")).toBeVisible();
  await answerFirstColdDecision(page);
  await expect(page.getByText(/РАЗБОР РЕШЕНИЯ · CLASS A/)).toBeVisible();
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(page.getByText("2 · ПОНЯТНОЕ ОБЪЯСНЕНИЕ")).toBeVisible();
});

test("recovers submitted feedback after reload without duplicating evidence", async ({ page }) => {
  await openFirstLesson(page, "ru");
  await answerFirstColdDecision(page);
  await expect(page.getByText(/РАЗБОР РЕШЕНИЯ · CLASS A/)).toBeVisible();
  await page.waitForTimeout(900);
  const before = await page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state") ?? "{}").interactions?.length ?? 0);
  expect(before).toBe(1);

  await page.reload();
  await expect(page.getByText(/РАЗБОР РЕШЕНИЯ · CLASS A/)).toBeVisible();
  await expect(page.getByRole("button", { name: /Зафиксировать решение/ })).toHaveCount(0);
  const after = await page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state") ?? "{}").interactions?.length ?? 0);
  expect(after).toBe(1);

  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(page.getByText("2 · ПОНЯТНОЕ ОБЪЯСНЕНИЕ")).toBeVisible();
});

test("switches RU and EN without resetting or losing the active session", async ({ page }) => {
  await openFirstLesson(page, "ru");
  await answerFirstColdDecision(page);
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(page.getByText("2 · ПОНЯТНОЕ ОБЪЯСНЕНИЕ")).toBeVisible();

  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("2 · PLAIN EXPLANATION")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");

  await page.waitForTimeout(900);
  await page.reload();
  await expect(page.getByRole("button", { name: "EN" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByText("2 · PLAIN EXPLANATION")).toBeVisible();

  await page.getByRole("button", { name: "RU" }).click();
  await expect(page.getByText("2 · ПОНЯТНОЕ ОБЪЯСНЕНИЕ")).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
});

test("locks T1 context at start and invalidates a cold run after learning exposure", async ({ page }) => {
  await mainNav(page).getByRole("button", { name: "T1", exact: true }).click();
  await page.getByRole("button", { name: /Начать T1/ }).click();
  let context = await page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state") ?? "{}").diagnostic?.measurementContext);
  expect(context).toBe("COLD_BASELINE");

  await openFirstLesson(page, "ru");
  await answerFirstColdDecision(page);
  await page.waitForTimeout(900);
  context = await page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state") ?? "{}").diagnostic?.measurementContext);
  expect(context).toBe("MIXED_EXPOSURE_INVALID_FOR_BASELINE");

  await mainNav(page).getByRole("button", { name: "T1", exact: true }).click();
  await expect(page.getByText(/нельзя считать исходным замером/i)).toBeVisible();
});

test("offers T1 without blocking the first lesson in both languages", async ({ page }) => {
  await expect(page.getByText(/T1 — дополнительная диагностика без подсказок/)).toBeVisible();
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.getByText(/T1 — optional cold diagnostic/)).toBeVisible();
  await mainNav(page).getByRole("button", { name: "Learn", exact: true }).click();
  await expect(page.locator(".module-list article").first().getByRole("button", { name: "Learn", exact: true })).toBeEnabled();
});

test("supports keyboard navigation and visible focus", async ({ page }) => {
  await openFirstLesson(page, "ru");
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  await expect(focused).toHaveCSS("outline-style", "solid");
});

test("mobile layout has no horizontal overflow in RU or EN", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile fixture only");
  for (const locale of ["RU", "EN"]) {
    await page.getByRole("button", { name: locale }).click();
    const home = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(home.scroll).toBeLessThanOrEqual(home.client + 1);
    const learnLabel = locale === "RU" ? "Учиться" : "Learn";
    await mainNav(page).getByRole("button", { name: learnLabel, exact: true }).click();
    const learn = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(learn.scroll).toBeLessThanOrEqual(learn.client + 1);
    await mainNav(page).getByRole("button", { name: locale === "RU" ? "Сегодня" : "Today", exact: true }).click();
  }
});
