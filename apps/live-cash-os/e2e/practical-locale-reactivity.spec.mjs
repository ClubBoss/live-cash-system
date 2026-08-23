import { expect, test } from "@playwright/test";

test("Practical locale reactively synchronizes lesson and shared navigation on the same mounted page", async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local locale fixture" }) });
  });

  await page.goto("/mastery/journey");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  const canonicalUrl = page.url();
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });

  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Справочник", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Реальные руки →", exact: true })).toHaveAttribute("href", "/tools?tab=field");

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page).toHaveURL(canonicalUrl);
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByText(/QUICK START · STEP 1 OF 8/i)).toBeVisible();
  await expect(nav.getByRole("link", { name: "Learn", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Home", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Table reading", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "After play", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Reference", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Real hands →", exact: true })).toHaveAttribute("href", "/tools?tab=field");
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveCount(0);

  await page.getByRole("button", { name: "RU", exact: true }).click();
  await expect(page).toHaveURL(canonicalUrl);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Справочник", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Реальные руки →", exact: true })).toHaveAttribute("href", "/tools?tab=field");
  await expect(nav.getByRole("link", { name: "Learn", exact: true })).toHaveCount(0);
});
