import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function learnerSnapshot(page) {
  return page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY);
}

async function expectAboveFold(locator, viewport) {
  await expect(locator).toBeVisible();
  const box = await locator.boundingBox();
  expect(box).not.toBeNull();
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local p2 utility fixture" }) });
  });
});

for (const viewport of [
  { name: "desktop-1440x900", width: 1440, height: 900 },
  { name: "mobile-390x844", width: 390, height: 844 },
]) {
  test(`P2-04/P2-05 canonical utilities and Continue learning are above fold on ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/mastery");

    const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
    const continueLearning = nav.getByRole("link", { name: "Продолжить обучение", exact: true });
    const dataEntry = nav.getByTestId("data-recovery-entry");
    const syncStatus = nav.getByTestId("practical-sync-status");
    const ru = nav.getByRole("button", { name: "RU", exact: true });
    const en = nav.getByRole("button", { name: "EN", exact: true });

    for (const locator of [continueLearning, dataEntry, syncStatus, ru, en]) {
      await expectAboveFold(locator, viewport);
    }

    await expect(continueLearning).toHaveAttribute("href", "/mastery/journey");
    await expect(dataEntry).toHaveAttribute("href", "/tools?tab=data");
    await expect(syncStatus).toHaveText(/Облако|На устройстве/);

    const beforeUtilityUse = await learnerSnapshot(page);
    await en.click();
    await expect(en).toHaveAttribute("aria-pressed", "true");
    expect(await learnerSnapshot(page)).toBe(beforeUtilityUse);

    await page.reload();
    const reloadedNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
    await expect(reloadedNav.getByRole("button", { name: "EN", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(reloadedNav.getByRole("link", { name: "Continue learning", exact: true })).toHaveAttribute("href", "/mastery/journey");
    await expect(reloadedNav.getByTestId("data-recovery-entry")).toHaveText("Data");
    await expect(reloadedNav.getByTestId("practical-sync-status")).toHaveText(/Cloud|On device/);
    expect(await learnerSnapshot(page)).toBe(beforeUtilityUse);

    const documentWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(documentWidth).toBeLessThanOrEqual(viewport.width);

    await reloadedNav.getByRole("link", { name: "Continue learning", exact: true }).click();
    await expect(page).toHaveURL(/\/mastery\/journey$/);
    expect(await learnerSnapshot(page)).toBe(beforeUtilityUse);
  });
}

test("P2-04 Data utility reaches existing Data & Recovery without learner-state mutation", async ({ page }) => {
  await page.goto("/mastery");
  const before = await learnerSnapshot(page);
  await page.getByRole("navigation", { name: "Practical Mastery navigation" }).getByTestId("data-recovery-entry").click();
  await expect(page).toHaveURL(/\/tools\?tab=data$/);
  const toolsNav = page.getByRole("navigation", { name: "Инструменты" });
  await expect(toolsNav.getByRole("button", { name: "Данные", exact: true })).toHaveAttribute("aria-current", "page");
  expect(await learnerSnapshot(page)).toBe(before);
});
