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
const sourceLabelPattern = /(?:Источники|Sources)\s*:/i;

test("learner surfaces hide provenance IDs while keeping source ceilings understandable", async ({ page }) => {
  for (const route of masteryRoutes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(sourceIdPattern);
    await expect(page.locator("main p:visible, main small:visible").filter({ hasText: sourceLabelPattern })).toHaveCount(0);
  }

  await page.goto("/mastery");
  const bl11Button = page.locator("button").filter({ hasText: /BvB 3-bet pots/i });
  const bl11Group = page.locator("details").filter({ has: bl11Button });
  await expect(bl11Group).toHaveCount(1);
  await bl11Group.locator("summary").click();
  const visibleBl11Button = bl11Group.getByRole("button", { name: /BvB 3-bet pots/i });
  await expect(visibleBl11Button).toBeVisible();
  await visibleBl11Button.click();
  await expect(page.getByText("ПОКА ЕСТЬ ОГРАНИЧЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.getByText(/недостаточно, чтобы честно задавать точные частоты/i)).toBeVisible();
});

test("Quick Start teaches pot odds as a calculation and immediately contrasts a changed price", async ({ page }) => {
  await page.goto("/mastery/journey");
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);
  await expect(page.getByText(/В банке 2 единицы\. Hero должен доплатить 1 единицу/i)).toBeVisible();
  await expect(page.getByText(/1 \/ \(2 \+ 1\) = 33,3%/i)).toBeVisible();
  await expect(page.getByText("ИЗМЕНИ ОДНО УСЛОВИЕ", { exact: true })).toBeVisible();
  await expect(page.getByText(/новый порог безубыточности/i)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/нужно ли выигрывать более 50% раздач/i);
  await page.getByRole("button", { name: /Проверить на примере/i }).click();
  await expect(page.getByText("ТЕПЕРЬ ТЫ", { exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(sourceIdPattern);
});

test("skill map reads as progress, not an internal content dashboard", async ({ page }) => {
  await page.goto("/mastery");
  await expect(page.getByRole("heading", { name: /Смотри прогресс/i })).toBeVisible();
  await expect(page.locator("main .hero").getByRole("link", { name: "Продолжить обучение", exact: true })).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\bFND-01\b|\bW1_FOUNDATION\b|scored decisions|Corpus: R/i);
  await expect(page.getByText("База решений", { exact: false })).toBeVisible();
});

test("navigation exposes one primary learning action and keeps tools secondary", async ({ page }) => {
  await page.goto("/mastery/journey");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Карта", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Справочник", exact: true })).toBeVisible();
  await expect(nav).not.toContainText("Старт обучения");
  await expect(nav).not.toContainText("Смешанная практика");
  await expect(page.locator("main")).not.toContainText(/Первый круг/i);
});
