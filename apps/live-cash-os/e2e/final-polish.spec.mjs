import { expect, test } from "@playwright/test";

async function openFresh(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

test("final shell uses one Diagnostic term and honest warm-up timing", async ({ page }) => {
  await openFresh(page);
  await expect(page.getByRole("button", { name: "Диагностика", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Стартовая диагностика", exact: true })).toBeVisible();
  await expect(page.getByText(/Быстрая разминка · до 2 минут/i)).toBeVisible();

  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await expect(page.getByRole("button", { name: "До 2 мин", exact: true })).toBeVisible();
});

test("build identity is present without affecting the learner flow", async ({ page }) => {
  await openFresh(page);
  const build = page.locator("[data-build-sha]");
  await expect(build).toBeVisible();
  await expect(build).toHaveAttribute("data-build-sha", /.+/);
  await expect(build).toHaveAttribute("data-app-version", /^\d+\.\d+\.\d+$/);
  await expect(build).toContainText(/^Live Cash OS v\d+\.\d+\.\d+ · Build /);
});

test("English shell keeps the same terminology and warm-up contract", async ({ page }) => {
  await openFresh(page);
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("button", { name: "Diagnostic", exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Starting Diagnostic", exact: true })).toBeVisible();
  await expect(page.getByText(/Quick warm-up · up to 2 minutes/i)).toBeVisible();
});