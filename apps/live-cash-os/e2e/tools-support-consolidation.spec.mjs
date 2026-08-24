import { expect, test } from "@playwright/test";

async function rawLearnerState(page) {
  return page.evaluate(() => localStorage.getItem("live-cash-os:learner-state"));
}

async function expectTab(page, tab, label, marker) {
  const nav = page.getByRole("navigation", { name: /Инструменты|Support tools/ });
  await expect(nav.getByRole("button", { name: label, exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText(marker, { exact: true })).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`[?&]tab=${tab}(?:&|$|#)`));
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
});

test("normal tools is a secondary support surface, not the legacy learning shell", async ({ page }) => {
  await page.goto("/tools?support=1");

  await expect(page.getByRole("heading", { name: "Инструменты", exact: true })).toBeVisible();
  await expect(page.getByText(/Основное обучение проходит в Practical Mastery/)).toBeVisible();
  await expect(page.getByRole("link", { name: /Вернуться в Practical Mastery/ })).toHaveAttribute("href", "/mastery/journey");

  const nav = page.getByRole("navigation", { name: "Инструменты" });
  await expect(nav.getByRole("button", { name: "Реальные руки", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Диагностика", exact: true })).toBeVisible();
  await expect(nav.getByRole("button", { name: "Данные и восстановление", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("ДАННЫЕ И ВОССТАНОВЛЕНИЕ", { exact: true })).toBeVisible();

  for (const legacyLabel of ["Сегодня", "Учиться", "Повтор", "Карточки", "Карта"]) {
    await expect(nav.getByRole("button", { name: legacyLabel, exact: true })).toHaveCount(0);
  }
});

test("Real Hands deep link remains explicit and support utilities work in both locales", async ({ page }) => {
  await page.goto("/tools?tab=field");
  await expect(page).toHaveURL(/\/tools\?tab=field$/);

  const ruNav = page.getByRole("navigation", { name: "Инструменты" });
  await expect(ruNav.getByRole("button", { name: "Реальные руки", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByText("РЕАЛЬНЫЕ РАЗДАЧИ", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Tools", exact: true })).toBeVisible();
  await expect(page.getByText(/Your primary learning path is Practical Mastery/)).toBeVisible();
  const enNav = page.getByRole("navigation", { name: "Support tools" });
  await expect(enNav.getByRole("button", { name: "Real Hands", exact: true })).toHaveAttribute("aria-current", "page");
  await enNav.getByRole("button", { name: "Data & Recovery", exact: true }).click();
  await expect(page).toHaveURL(/\/tools\?tab=data$/);
  await expect(page.getByText("DATA & RECOVERY", { exact: true })).toBeVisible();
});

test("support tabs keep URL, history, refresh, params and hash coherent", async ({ page }) => {
  await page.goto("/tools?support=1&keep=1&tab=data#support-anchor");
  await expectTab(page, "data", "Данные и восстановление", "ДАННЫЕ И ВОССТАНОВЛЕНИЕ");

  const nav = page.getByRole("navigation", { name: "Инструменты" });
  await nav.getByRole("button", { name: "Диагностика", exact: true }).click();
  await expectTab(page, "diagnostic", "Диагностика", "СТАРТОВАЯ ДИАГНОСТИКА");
  await expect(page).toHaveURL(/keep=1/);
  await expect(page).toHaveURL(/#support-anchor$/);

  await nav.getByRole("button", { name: "Реальные руки", exact: true }).click();
  await expectTab(page, "field", "Реальные руки", "РЕАЛЬНЫЕ РАЗДАЧИ");

  await page.goBack();
  await expectTab(page, "diagnostic", "Диагностика", "СТАРТОВАЯ ДИАГНОСТИКА");
  await page.goBack();
  await expectTab(page, "data", "Данные и восстановление", "ДАННЫЕ И ВОССТАНОВЛЕНИЕ");
  await page.goForward();
  await expectTab(page, "diagnostic", "Диагностика", "СТАРТОВАЯ ДИАГНОСТИКА");

  await page.reload();
  await expectTab(page, "diagnostic", "Диагностика", "СТАРТОВАЯ ДИАГНОСТИКА");
  await expect(page).toHaveURL(/keep=1/);
  await expect(page).toHaveURL(/#support-anchor$/);

  await page.getByRole("button", { name: "Начать диагностику" }).click();
  await page.getByRole("button", { name: "Сохранить и выйти" }).click();
  await expectTab(page, "data", "Данные и восстановление", "ДАННЫЕ И ВОССТАНОВЛЕНИЕ");

  await page.goBack();
  await expect(page).toHaveURL(/[?&]tab=diagnostic(?:&|$|#)/);
  await expect(page.getByText("Ситуация 1", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Инструменты" }).getByRole("button", { name: "Диагностика", exact: true })).toHaveAttribute("aria-current", "page");
});

test("stale support tab aliases fail closed to Data without opening a legacy learning surface", async ({ page }) => {
  await page.goto("/tools?support=1&keep=1&tab=review");
  await expect(page).toHaveURL(/tab=data/);
  await expect(page).toHaveURL(/keep=1/);
  await expect(page.getByText("ДАННЫЕ И ВОССТАНОВЛЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toHaveCount(0);
});

test("entering and leaving support tools does not mutate learner progress", async ({ page }) => {
  await page.goto("/tools?legacy=1");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  const before = await rawLearnerState(page);
  expect(before).not.toBeNull();

  await page.goto("/tools?support=1");
  await expect(page.getByRole("heading", { name: "Инструменты", exact: true })).toBeVisible();
  expect(await rawLearnerState(page)).toBe(before);

  await page.getByRole("link", { name: /Вернуться в Practical Mastery/ }).click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  expect(await rawLearnerState(page)).toBe(before);
});

test("support tools has no document-level horizontal overflow at representative mobile width", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile fixture only");
  await page.goto("/tools?support=1");
  await expect(page.getByRole("heading", { name: "Инструменты", exact: true })).toBeVisible();
  const geometry = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(geometry.scroll).toBeLessThanOrEqual(geometry.client + 1);
});
