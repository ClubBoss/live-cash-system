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
  expect(pageErrors, `${route} emitted browser errors`).toEqual([]);
  page.off("pageerror", listener);
}

test("canonical home exposes one primary learning route", async ({ page }) => {
  test.skip(crossMatrix, "canonical Chromium coverage is sufficient for the legacy-shell bridge");
  await page.route("**/api/state", async (route) => route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local acceptance fixture" }) }));
  await page.goto("/");
  const gateway = page.getByRole("region", { name: "Основной маршрут обучения" });
  await expect(gateway).toBeVisible();
  await expect(gateway.getByRole("link", { name: /Продолжить обучение/ })).toHaveAttribute("href", "/mastery/journey");
  await expect(gateway).toContainText("Один маршрут");
  const legacyHeading = page.getByRole("heading", { name: /Учись понемногу/i });
  await expect(legacyHeading).toBeVisible();
  const gatewayBox = await gateway.boundingBox();
  const legacyBox = await legacyHeading.boundingBox();
  expect(gatewayBox?.y ?? 9999).toBeLessThan(legacyBox?.y ?? 0);
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
  await expect(nav.getByRole("link", { name: "Карта", exact: true })).toHaveAttribute("aria-current", "page");
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

test("First Journey writes schema-v3 evidence inside the reliable learner profile", async ({ page }) => {
  test.skip(crossMatrix, "state semantics are covered once in canonical Chromium");
  await page.goto("/mastery/journey");
  await expect(page.getByLabel("Твой прогноз")).toBeVisible();
  await page.getByLabel("Твой прогноз").fill("Сначала определяю механизм и переменную, которая меняет решение.");
  await page.getByRole("button", { name: /Показать механизм/ }).click();

  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const root = JSON.parse(raw);
    return { rootSchema: root.schemaVersion, practicalSchema: root._practicalProfile?.mastery?.schemaVersion, conceptTaught: root._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught };
  }, LEARNER_KEY)).toEqual({ rootSchema: 2, practicalSchema: 3, conceptTaught: true });

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

test("BL-11 stays visibly fail-closed instead of masquerading as full mastery", async ({ page }) => {
  test.skip(crossMatrix, "source-ceiling semantics are covered once in canonical Chromium");
  await page.goto("/mastery");
  const bl11Group = page.locator("details").filter({ has: page.locator("button").filter({ hasText: /^BL-11\b/ }) });
  await expect(bl11Group).toHaveCount(1);
  await bl11Group.locator("summary").click();
  const bl11 = bl11Group.getByRole("button", { name: /^BL-11\b/ });
  await expect(bl11).toBeVisible();
  await bl11.click();
  await expect(page.getByText("ОГРАНИЧЕНИЕ ИСТОЧНИКА", { exact: true })).toBeVisible();
  await expect(page.getByText(/недостаточно, чтобы честно задавать точные частоты/i)).toBeVisible();
});

test("After-play flow deep-links to the existing Real Hands tool rather than the legacy home default", async ({ page }) => {
  test.skip(crossMatrix, "navigation contract is covered once in canonical Chromium");
  await page.goto("/mastery/study");
  const realHands = page.getByRole("link", { name: "Реальные руки →", exact: true });
  await expect(realHands).toBeVisible();
  await expect(realHands).toHaveAttribute("href", "/?tab=field");
  await realHands.click();

  const legacyNav = page.getByRole("navigation", { name: "Основная навигация" });
  await expect(legacyNav.getByRole("button", { name: "Руки", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page).toHaveURL(/\/$/);
});
