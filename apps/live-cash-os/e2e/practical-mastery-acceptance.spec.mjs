import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const crossMatrix = process.env.LIVE_CASH_MASTERY_CROSS === "1";
const masteryRoutes = [
  "/mastery",
  "/mastery/journey",
  "/mastery/session",
  "/mastery/perception",
  "/mastery/study",
  "/mastery/reference",
];

async function expectNoHorizontalOverflow(page) {
  const dimensions = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, clientWidth: document.documentElement.clientWidth }));
  expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth + 1);
}

async function openMastery(page, route) {
  const pageErrors = [];
  const listener = (error) => pageErrors.push(error.message);
  page.on("pageerror", listener);
  await page.goto(route);
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("main h1").first()).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/Application error|Internal Server Error/i);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key) !== null, LEARNER_KEY)).toBe(true);
  expect(pageErrors, `${route} emitted browser errors`).toEqual([]);
  page.off("pageerror", listener);
}

test("canonical root cuts over to the Practical Mastery learning route without rendering the legacy shell", async ({ page }) => {
  test.skip(crossMatrix, "canonical Chromium coverage is sufficient for the root cutover");
  await page.route("**/api/state", async (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local acceptance fixture" }) }));
  await page.goto("/");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toHaveCount(0);
});

test("all Practical Mastery learner routes render without runtime or horizontal-layout failure", async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 900 });
  for (const route of masteryRoutes) {
    await openMastery(page, route);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();
  }
});

test("shared navigation exposes one learning entry and secondary tools", async ({ page }) => {
  test.skip(crossMatrix, "navigation behavior is covered once in canonical Chromium");
  await page.goto("/mastery");
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Главная", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).not.toHaveAttribute("aria-current", "page");
  await expect(nav).not.toContainText("Старт обучения");
  await expect(nav).not.toContainText("Практика");

  await nav.getByRole("link", { name: "Учиться", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Чтение стола", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/perception$/);
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toHaveAttribute("aria-current", "page");
});

test("Practical Mastery remains usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of masteryRoutes) {
    await openMastery(page, route);
    await expectNoHorizontalOverflow(page);
    const mainBox = await page.locator("main").boundingBox();
    expect(mainBox?.width ?? 999).toBeLessThanOrEqual(390);
  }
});

test("Quick Start teaches the mechanism before scored practice and writes schema-v3 concept evidence", async ({ page }) => {
  test.skip(crossMatrix, "state semantics are covered once in canonical Chromium");
  await page.goto("/mastery/journey");
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await expect(page.getByText("ГДЕ ЭТО НУЖНО", { exact: true })).toBeVisible();
  await expect(page.getByText("МЕХАНИЗМ", { exact: true })).toBeVisible();
  await expect(page.locator("textarea")).toHaveCount(0);
  await expect(page.getByText(/1 \/ \(2 \+ 1\) = 33,3%/)).toBeVisible();
  await page.getByRole("button", { name: /Проверить на примере/ }).click();

  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const root = JSON.parse(raw);
    return { rootSchema: root.schemaVersion, practicalSchema: root._practicalProfile?.mastery?.schemaVersion, conceptTaught: root._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught };
  }, LEARNER_KEY)).toEqual({ rootSchema: 2, practicalSchema: 3, conceptTaught: true });
  await expect(page.getByText("ТЕПЕРЬ ТЫ", { exact: true })).toBeVisible();

  await page.goto("/mastery");
  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw)._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught : false;
  }, LEARNER_KEY)).toBe(true);
});

test("mastery locale persists across route changes and localizes shared navigation", async ({ page }) => {
  test.skip(crossMatrix, "locale persistence is covered once in canonical Chromium");
  await page.goto("/mastery");
  await expect(page.getByRole("link", { name: "Учиться", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await page.goto("/mastery/study");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("heading", { name: /Play → review → repair → retest/i })).toBeVisible();
  await expect(page.getByRole("link", { name: "After play", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Learn", exact: true })).toBeVisible();
});

test("BvB 3-bet source ceiling stays visibly fail-closed instead of masquerading as full mastery", async ({ page }) => {
  test.skip(crossMatrix, "source-ceiling semantics are covered once in canonical Chromium");
  await page.goto("/mastery");
  const bl11Group = page.locator("details").filter({ has: page.locator("button").filter({ hasText: /BvB 3-bet pots/i }) });
  await expect(bl11Group).toHaveCount(1);
  await bl11Group.locator("summary").click();
  const bl11 = bl11Group.getByRole("button", { name: /BvB 3-bet pots/i });
  await expect(bl11).toBeVisible();
  await bl11.click();
  await expect(page.getByText("ПОКА ЕСТЬ ОГРАНИЧЕНИЕ", { exact: true })).toBeVisible();
  await expect(page.getByText(/недостаточно, чтобы честно задавать точные частоты/i)).toBeVisible();
});

test("After-play flow deep-links to Real Hands on the secondary tools route without restoring the legacy canonical home", async ({ page }) => {
  test.skip(crossMatrix, "navigation contract is covered once in canonical Chromium");
  await page.goto("/mastery/study");
  const realHands = page.getByRole("link", { name: "Реальные руки →", exact: true });
  await expect(realHands).toBeVisible();
  await expect(realHands).toHaveAttribute("href", "/tools?tab=field");
  await realHands.click();

  const legacyNav = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(legacyNav.getByRole("button", { name: "Руки", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveURL(/\/tools$/);
});
