import { expect, test } from "@playwright/test";

const masteryRoutes = [
  "/mastery",
  "/mastery/journey",
  "/mastery/session",
  "/mastery/perception",
  "/mastery/study",
  "/mastery/reference",
];

const sourceIdPattern = /\b(?:FTGU-E\d+|SLC-[A-Z0-9-]+|LCM-\d+|CP-G\d+-L\d+|REF-[A-Z0-9-]+)\b/i;
const internalReferencePattern = /SOURCE_SUPPORTED_SHAPE|EXACT_VISUAL_AUTHORITY_PENDING|sourceRefs|repository|registry/i;
const sourceLabelPattern = /(?:Источники|Sources)\s*:/i;

test("learner surfaces hide provenance IDs while keeping source ceilings understandable", async ({ page }) => {
  for (const route of masteryRoutes) {
    await page.goto(route);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("main")).not.toContainText(sourceIdPattern);
    await expect(page.locator("main")).not.toContainText(internalReferencePattern);
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
  await expect(page.getByText(/В банке 1bb, соперник ставит 1bb\. Hero должен доставить 1bb/i)).toBeVisible();
  await expect(page.getByText(/пот-оддсы 1:2.*около одной трети/i)).toBeVisible();
  await expect(page.getByText("ИЗМЕНИ ОДНО УСЛОВИЕ", { exact: true })).toBeVisible();
  await expect(page.getByText(/В банке 2bb, соперник ставит 2bb\. Hero должен доставить 2bb/i)).toBeVisible();
  await expect(page.getByText(/Нет: порог остаётся около 33%/i)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/нужно ли выигрывать более 50% раздач/i);
  await expect(page.locator("main")).not.toContainText(/50%: требуемая equity выросла/i);
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

test("Skill Map keeps generic Learn distinct from teachable/focus-admissible recommendations and rejects invalid or locked focus", async ({ page }) => {
  await page.goto("/mastery");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  const generic = nav.getByRole("link", { name: "Продолжить обучение", exact: true });
  await expect(generic).toHaveAttribute("href", "/mastery/journey");
  await expect(page.locator("main .hero").getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("href", "/mastery/journey");

  let recommendation = page.locator("section.today-card").filter({ hasText: "СЕЙЧАС ПОЛЕЗНЕЕ ВСЕГО" }).first();
  await expect(recommendation).toBeVisible();
  const teachFirst = recommendation.getByRole("link", { name: "Продолжить обучение", exact: true });
  await expect(teachFirst).toHaveAttribute("href", "/mastery/journey?focus=FND-01");
  await expect(recommendation.locator("[data-focus-unavailable]")).toHaveCount(0);

  await generic.click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await page.getByRole("button", { name: /Проверить на примере/i }).click();
  await expect(page.getByText("ТЕПЕРЬ ТЫ", { exact: true })).toBeVisible();
  await page.goto("/mastery");

  recommendation = page.locator("section.today-card").filter({ hasText: "СЕЙЧАС ПОЛЕЗНЕЕ ВСЕГО" }).first();
  await expect(recommendation).toBeVisible();
  const focused = recommendation.getByRole("link", { name: "Продолжить обучение", exact: true });
  await expect(focused).toHaveAttribute("href", "/mastery/session?focus=FND-01");
  await focused.click();
  await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-01$/);
  await expect(page.locator("main")).toContainText(/ПРАКТИКА|ВЫБРАННЫЙ ФОКУС/);

  await page.goto("/mastery/session?focus=NOT-A-SKILL");
  await expect(page.getByRole("heading", { name: "Этот навык пока недоступен", exact: true })).toBeVisible();
  await expect(page.getByText(/не подменит его другой темой молча/i)).toBeVisible();

  await page.goto("/mastery/session?focus=BL-11");
  await expect(page).toHaveURL(/\/mastery\/session\?focus=BL-11$/);
  await expect(page.getByText("ВЫБРАННЫЙ ФОКУС", { exact: true })).toBeVisible();
  await expect(page.getByRole("heading", { name: "BvB 3-bet pots", exact: true })).toBeVisible();
  await expect(page.getByText(/Сейчас этот навык нельзя честно поставить в самостоятельную практику/i)).toBeVisible();
  await expect(page.getByText(/не подменит его другой темой молча/i)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/ПРАКТИКА · \d+\/\d+/i);
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
  await expect(journeyNav.getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("aria-current", "page");
  await journeyNav.getByRole("link", { name: "После игры", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/study$/);
  await expect(page.getByRole("heading", { name: /Играй.*разбирай.*исправляй.*проверяй снова/i })).toBeVisible();

  const studyNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await studyNav.getByRole("link", { name: "Справочник", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/reference$/);
  await expect(page.getByRole("heading", { name: /Не запоминать сотни картинок/i })).toBeVisible();
  await expect(page.getByText("Форма диапазона подтверждена", { exact: true }).first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText(sourceIdPattern);
  await expect(page.locator("main")).not.toContainText(internalReferencePattern);
  await expect(page.locator("main")).not.toContainText(/A5s\s*=\s*\d+(?:[.,]\d+)?%/i);

  const referenceNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await referenceNav.getByRole("link", { name: "Главная", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery$/);
  await expect(page.getByRole("heading", { name: /Смотри прогресс/i })).toBeVisible();
});

test("navigation exposes one primary learning action and keeps tools secondary", async ({ page }) => {
  await page.goto("/mastery/journey");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toBeVisible();
  await expect(nav.getByRole("link", { name: "Справочник", exact: true })).toBeVisible();
  await expect(nav).not.toContainText("Карта");
  await expect(nav).not.toContainText("Старт обучения");
  await expect(nav).not.toContainText("Смешанная практика");
  await expect(page.locator("main")).not.toContainText(/Первый круг/i);
});
