import { expect, test } from "@playwright/test";

const masteryRoutes = [
  "/mastery",
  "/mastery/journey",
  "/mastery/session",
  "/mastery/perception",
  "/mastery/study",
  "/mastery/reference",
];

const sourceIdPattern = /\b(?:FTGU-E\d+|SLC-M\d+-L\d+|LCM-\d+|CP-G\d+-L\d+)\b/i;

test("Practical Mastery learner surfaces hide provenance IDs while keeping source ceilings visible", async ({ page }) => {
  for (const route of masteryRoutes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(sourceIdPattern);
    await expect(page.locator("main")).not.toContainText(/(?:Источники|Sources)\s*:/i);
  }

  await page.goto("/mastery");
  const bl11Group = page.locator("details").filter({ has: page.locator("button").filter({ hasText: /^BL-11\b/ }) });
  await bl11Group.locator("summary").click();
  await bl11Group.getByRole("button", { name: /^BL-11\b/ }).click();
  await expect(page.getByText("ОГРАНИЧЕНИЕ ИСТОЧНИКА", { exact: true })).toBeVisible();
});

test("foundation pot-odds teaching requires an explicit calculation and a changed-price recalculation", async ({ page }) => {
  await page.goto("/mastery");
  await expect(page.getByText(/В банке 2 единицы\. Hero должен доплатить 1 единицу/i)).toBeVisible();
  await expect(page.getByText(/1 \/ \(2 \+ 1\) = 33,3%/i)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/нужно ли выигрывать более 50% раздач/i);

  const foundation = page.locator("details").filter({ has: page.locator("button").filter({ hasText: /^FND-01\b/ }) });
  if (!(await foundation.getAttribute("open"))) await foundation.locator("summary").click();
  await foundation.getByRole("button", { name: /^FND-01\b/ }).click();
  await page.getByRole("button", { name: /Механизм понятен — к практике/i }).click();

  // The actual scored corpus remains separate from teaching anchors; this guard
  // proves the learner-facing mechanism itself no longer teaches a yes/no shortcut.
  await expect(page.locator("main")).not.toContainText(sourceIdPattern);
});

test("new navigation names describe actions instead of internal project terminology", async ({ page }) => {
  await page.goto("/mastery/journey");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Старт обучения", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Практика", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Справочник", exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/Первый круг/i);
});
