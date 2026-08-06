import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись коротко/i })).toBeVisible();
});

test("completes the cold check and reaches the teaching layer", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await expect(page.getByText("1 · COLD CHECK")).toBeVisible();
  await page.getByRole("button", { name: "140 straddle-BB; отдельно отметить 280 обычных BB" }).click();
  await page.getByRole("button", { name: "$10 задаёт текущую цену preflop-дерева" }).click();
  await page.getByRole("button", { name: /Зафиксировать решение/ }).click();
  await expect(page.getByText(/DECISION REVIEW · CLASS A/)).toBeVisible();
  await page.getByRole("button", { name: /Продолжить/ }).click();
  await expect(page.getByText("2 · ПРОСТАЯ ТЕОРИЯ")).toBeVisible();
  await expect(page.getByRole("heading", { name: /Понимать, сколько денег реально разыгрывается/ })).toBeVisible();
});

test("T1 is optional and does not block the first lesson", async ({ page }) => {
  await expect(page.getByText(/T1 — дополнительный cold diagnostic/)).toBeVisible();
  await page.getByRole("button", { name: "Учиться" }).click();
  await expect(page.getByRole("button", { name: /^Изучить/ }).first()).toBeEnabled();
});

test("supports keyboard selection and visible focus", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться" }).click();
  await page.getByRole("button", { name: /^Изучить/ }).first().click();
  await page.keyboard.press("Tab");
  const focused = page.locator(":focus");
  await expect(focused).toBeVisible();
  await expect(focused).toHaveCSS("outline-style", "solid");
});

test("mobile layout has no document-level horizontal overflow", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "mobile", "mobile fixture only");
  const widths = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(widths.scroll).toBeLessThanOrEqual(widths.client + 1);
  await page.getByRole("button", { name: "Учиться" }).click();
  const after = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(after.scroll).toBeLessThanOrEqual(after.client + 1);
});
