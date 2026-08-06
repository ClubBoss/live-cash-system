import { expect, test } from "@playwright/test";

async function resetAnonymousState(page) {
  await page.goto("/");
  await page.evaluate(() => {
    localStorage.removeItem("live-cash-os:learner-state");
    localStorage.removeItem("live-cash-os:locale");
  });
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await resetAnonymousState(page);
  await expect(page.getByRole("heading", { name: /Учись коротко/i })).toBeVisible();
  await expect(page.getByRole("button", { name: "RU" })).toHaveAttribute("aria-pressed", "true");
});

test("completes the Russian cold decision and reaches the teaching layer", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await expect(page.getByText("1 · ВОПРОС БЕЗ ПОДСКАЗКИ")).toBeVisible();
  await page.getByRole("button", { name: /140.*280/u }).click();
  await page.getByRole("button", { name: /\$10/u }).click();
  await page.getByRole("button", { name: /Зафиксировать решение/ }).click();
  await expect(page.getByText(/РАЗБОР РЕШЕНИЯ · CLASS A/)).toBeVisible();
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(page.getByText("2 · ПОНЯТНОЕ ОБЪЯСНЕНИЕ")).toBeVisible();
});

test("switches RU and EN without resetting or losing the active session", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await page.getByRole("button", { name: /140.*280/u }).click();
  await page.getByRole("button", { name: /\$10/u }).click();
  await page.getByRole("button", { name: /Зафиксировать решение/ }).click();
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

test("offers T1 without blocking the first lesson in both languages", async ({ page }) => {
  await expect(page.getByText(/T1 — дополнительная диагностика без подсказок/)).toBeVisible();
  await page.getByRole("button", { name: "EN" }).click();
  await expect(page.getByText(/T1 — optional cold diagnostic/)).toBeVisible();
  await page.getByRole("button", { name: "Learn" }).click();
  await expect(page.getByRole("button", { name: /^Learn$/ }).first()).toBeEnabled();
});

test("supports keyboard navigation and visible focus", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
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
    await page.getByRole("button", { name: learnLabel }).click();
    const learn = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
    expect(learn.scroll).toBeLessThanOrEqual(learn.client + 1);
    await page.getByRole("button", { name: locale === "RU" ? "Сегодня" : "Today" }).click();
  }
});
