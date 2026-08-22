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

test("skill map is the canonical home and reads as progress, not an internal content dashboard", async ({ page }) => {
  await page.goto("/mastery");
  await expect(page.getByRole("heading", { name: /Смотри прогресс/i })).toBeVisible();
  await expect(page.locator("main .hero").getByRole("link", { name: "Продолжить обучение", exact: true })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toHaveAttribute("href", "/mastery");
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Карта", exact: true })).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(/\bFND-01\b|\bW1_FOUNDATION\b|scored decisions|Corpus: R/i);
  await expect(page.getByText("База решений", { exact: false })).toBeVisible();
});

test("top navigation and prerequisite CTA reach deterministic learner destinations", async ({ page }) => {
  await page.goto("/mastery");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });

  await nav.getByRole("link", { name: "Чтение стола", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/perception$/);
  await expect(page.getByRole("heading", { name: /Сначала познакомься с механизмами/i })).toBeVisible();

  const start = page.getByRole("link", { name: /Старт обучения/i });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();

  const journeyNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(journeyNav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
  await journeyNav.getByRole("link", { name: "После игры", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/study$/);
  await expect(page.getByRole("heading", { name: /Играй.*разбирай.*исправляй.*проверяй снова/i })).toBeVisible();

  const studyNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await studyNav.getByRole("link", { name: "Справочник", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/reference$/);
  await expect(page.getByRole("heading", { name: /Не запоминать 980 картинок/i })).toBeVisible();

  const referenceNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await referenceNav.getByRole("link", { name: "Главная", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery$/);
  await expect(page.getByRole("heading", { name: /Смотри прогресс/i })).toBeVisible();
});

test("navigation exposes one primary learning action and keeps tools secondary", async ({ page }) => {
  await page.goto("/mastery/journey");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Справочник", exact: true })).toBeVisible();
  await expect(nav).not.toContainText("Карта");
  await expect(nav).not.toContainText("Старт обучения");
  await expect(nav).not.toContainText("Смешанная практика");
  await expect(page.locator("main")).not.toContainText(/Первый круг/i);
});
