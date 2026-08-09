import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "cross-browser local fixture" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function seedGeometryComplete(page) {
  await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    state.modules.geometry.contentCompleted = true;
    state.modules.geometry.lessonStep = 10;
    state.activeSession = null;
    state.revision += 1;
    state.updatedAt = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(state));
  }, STORAGE_KEY);
  await page.reload();
}

async function continueFeedback(page) {
  const semantic = page.locator("[data-g4-feedback-state]").getByRole("button", { name: /^Продолжить/ });
  try {
    await semantic.waitFor({ state: "visible", timeout: 8_000 });
    await semantic.click();
    return;
  } catch {
    const core = page.locator(".feedback-view > button.primary");
    await expect(core).toBeVisible();
    await core.click();
  }
}

test.beforeEach(async ({ page }) => {
  await openLocal(page);
});

test("critical lesson shell, semantic feedback and locale switch work", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await expect(page.getByText("1 · РЕШИ БЕЗ ПОДСКАЗКИ")).toBeVisible();

  const decision = page.locator(".decision-card");
  await decision.locator(".answer-set").nth(0).getByRole("button").first().click();
  await decision.locator(".answer-set").nth(1).getByRole("button").first().click();
  await decision.getByRole("button", { name: /^Ответить/ }).click();
  await continueFeedback(page);
  await expect(page.getByRole("heading", { name: /Сначала определи, против какого стека/i })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator(".session")).toBeVisible();
  await expect(page.locator(".session")).not.toContainText(/[А-Яа-яЁё]/u);
});

test("critical Cards contract blocks future material and uses studied cards", async ({ page }) => {
  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await page.getByRole("button", { name: "Все", exact: true }).click();
  await expect(page.getByText(/Карточки открываются только из завершённых тем/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Показать ответ/ })).toHaveCount(0);

  await seedGeometryComplete(page);
  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await page.getByRole("button", { name: "Все", exact: true }).click();
  await expect(page.locator(".session .eyebrow")).toContainText("1/3");
  await page.getByRole("button", { name: /^Показать ответ/ }).click();
  await expect(page.getByRole("button", { name: "Легко", exact: true })).toBeEnabled();
});

test("critical Real Hands contract requires explicit linked topic", async ({ page }) => {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  const select = page.getByLabel("Связанная тема");
  await expect(select).toHaveValue("");
  await expect(page.getByText(/Связанная тема не выбрана/i)).toBeVisible();
  await expect(page.getByRole("button", { name: /^Зафиксировать решение/ })).toBeDisabled();
  await select.selectOption("geometry");
  await expect(select).toHaveValue("geometry");
});
