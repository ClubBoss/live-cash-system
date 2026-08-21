import { expect, test } from "@playwright/test";

const MASTERY_KEY = "live-cash-os:practical-mastery:v3";
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
  const dimensions = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }));
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

test("canonical home exposes Practical Mastery as the primary learning route", async ({ page }) => {
  test.skip(crossMatrix, "canonical Chromium coverage is sufficient for the legacy-shell bridge");
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local acceptance fixture" }) });
  });
  await page.goto("/");
  const gateway = page.getByRole("region", { name: "Основной маршрут Practical Mastery" });
  await expect(gateway).toBeVisible();
  const start = gateway.getByRole("link", { name: /Продолжить Practical Mastery/ });
  await expect(start).toHaveAttribute("href", "/mastery/journey");
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

test("Practical Mastery remains usable at phone width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of masteryRoutes) {
    await openMastery(page, route);
    await expectNoHorizontalOverflow(page);
    const mainBox = await page.locator("main").boundingBox();
    expect(mainBox?.width ?? 999).toBeLessThanOrEqual(390);
  }
});

test("First Journey creates schema-v3 evidence and preserves it across mastery routes", async ({ page }) => {
  test.skip(crossMatrix, "state semantics are covered once in canonical Chromium");
  await page.goto("/mastery/journey");
  await expect(page.getByLabel("Твой прогноз")).toBeVisible();
  await page.getByLabel("Твой прогноз").fill("Сначала определяю механизм и переменную, которая меняет решение.");
  await page.getByRole("button", { name: /Показать механизм/ }).click();

  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const state = JSON.parse(raw);
    return { schemaVersion: state.schemaVersion, conceptTaught: state.skills?.["FND-01"]?.conceptTaught };
  }, MASTERY_KEY)).toEqual({ schemaVersion: 3, conceptTaught: true });

  await page.goto("/mastery");
  await expect.poll(async () => page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).skills?.["FND-01"]?.conceptTaught : false;
  }, MASTERY_KEY)).toBe(true);
});

test("BL-11 stays visibly fail-closed instead of masquerading as full mastery", async ({ page }) => {
  test.skip(crossMatrix, "source-ceiling semantics are covered once in canonical Chromium");
  await page.goto("/mastery");
  const bl11 = page.getByRole("button", { name: /^BL-11\b/ });
  await expect(bl11).toHaveCount(1);
  await bl11.evaluate((element) => element.click());
  await expect(page.getByText("SOURCE PARTIAL", { exact: true })).toBeVisible();
  await expect(page.getByText(/POSITIVE_EV_SOURCE_ACCESS_REQUIRED/)).toBeVisible();
});

test("Study Loop points back to the existing Real Hands surface rather than duplicating capture", async ({ page }) => {
  test.skip(crossMatrix, "navigation contract is covered once in canonical Chromium");
  await page.goto("/mastery/study");
  const realHands = page.getByRole("link", { name: "Real Hands · Live Cash OS", exact: true });
  await expect(realHands).toBeVisible();
  await expect(realHands).toHaveAttribute("href", "/");
});
