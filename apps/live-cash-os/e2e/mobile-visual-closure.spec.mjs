import { expect, test } from "@playwright/test";

async function disableCloud(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function openTools(page) {
  await disableCloud(page);
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function expectNoDocumentOverflow(page) {
  const dimensions = await page.evaluate(() => ({
    scroll: document.documentElement.scrollWidth,
    client: document.documentElement.clientWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
}

test("canonical mobile root lands in Practical Mastery without leaking the legacy shell", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await disableCloud(page);
  await page.goto("/");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();
  const quickStart = page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i);
  await expect(quickStart).toBeVisible();
  await expect(quickStart).toBeInViewport();
  await expect(page.getByRole("navigation", { name: "Основная навигация" })).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toHaveCount(0);
  await expectNoDocumentOverflow(page);
});

test("legacy support tools keep the approved mobile visual closure and primary action above the fold at 390x844", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openTools(page);

  const marker = await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--mobile-visual-closure").trim());
  expect(marker).toBe("closure-20260808");

  const start = page.getByRole("button", { name: "Начать", exact: true });
  await expect(start).toBeVisible();
  await expect(start).toBeInViewport();

  const topbar = page.locator(".topbar");
  const topbarBox = await topbar.boundingBox();
  expect(topbarBox?.height ?? 999).toBeLessThan(80);

  const heading = page.getByRole("heading", { name: /Учись понемногу/i });
  const headingSize = Number.parseFloat(await heading.evaluate((element) => getComputedStyle(element).fontSize));
  expect(headingSize).toBeLessThanOrEqual(50);

  const tabs = page.getByRole("navigation", { name: "Основная навигация" });
  const tabCue = await tabs.evaluate((element) => ({
    mask: getComputedStyle(element).maskImage || getComputedStyle(element).webkitMaskImage,
    snap: getComputedStyle(element).scrollSnapType,
    scrollWidth: element.scrollWidth,
    clientWidth: element.clientWidth,
  }));
  expect(tabCue.scrollWidth).toBeGreaterThan(tabCue.clientWidth);
  expect(tabCue.mask).not.toBe("none");
  expect(tabCue.snap).toContain("x");

  const card = page.locator(".today-card");
  const radius = Number.parseFloat(await card.evaluate((element) => getComputedStyle(element).borderTopLeftRadius));
  expect(radius).toBeGreaterThanOrEqual(18);

  await expectNoDocumentOverflow(page);
  await page.screenshot({ path: testInfo.outputPath("today-390x844.png"), fullPage: true });
});

test("mobile support header remains compact without horizontal document overflow at 360px", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await openTools(page);
  await expectNoDocumentOverflow(page);

  for (const name of ["RU", "EN"]) {
    const box = await page.getByRole("button", { name, exact: true }).boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
    expect(box?.width ?? 0).toBeGreaterThanOrEqual(44);
  }
});
