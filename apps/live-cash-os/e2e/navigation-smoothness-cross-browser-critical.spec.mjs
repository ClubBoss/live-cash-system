import { expect, test } from "@playwright/test";

const unloadKey = "__practical_nav_unload_count";
const shellMarkerKey = "__practicalNavigationShellMarker";

async function installUnloadCounter(page) {
  await page.addInitScript(({ key }) => {
    if (location.origin !== "http://127.0.0.1:5173") return;
    if (sessionStorage.getItem(key) === null) sessionStorage.setItem(key, "0");
    addEventListener("beforeunload", () => {
      const current = Number.parseInt(sessionStorage.getItem(key) || "0", 10) || 0;
      sessionStorage.setItem(key, String(current + 1));
    }, { once: true });
  }, { key: unloadKey });
}

async function stampShell(page) {
  return page.evaluate(({ markerKey }) => {
    const marker = crypto.randomUUID();
    window[markerKey] = marker;
    return marker;
  }, { markerKey: shellMarkerKey });
}

async function expectContinuousShell(page, marker) {
  await expect.poll(() => page.evaluate(({ markerKey }) => window[markerKey] || null, { markerKey: shellMarkerKey })).toBe(marker);
  await expect.poll(() => page.evaluate(({ key }) => Number.parseInt(sessionStorage.getItem(key) || "0", 10), { key: unloadKey })).toBe(0);
}

test("Practical route sequence stays in one document and preserves locale, history, and active navigation", async ({ page }, testInfo) => {
  await installUnloadCounter(page);
  await page.goto("/mastery/journey");
  if (testInfo.project.name === "mobile") {
    expect(await page.evaluate(() => innerWidth)).toBeLessThanOrEqual(400);
  }

  const marker = await stampShell(page);
  let nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Чтение стола", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/perception$/);
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Чтение стола", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);

  await nav.getByRole("link", { name: "После игры", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/study$/);
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "После игры", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "After play", exact: true })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Reference", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/reference$/);
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Reference", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Learn", exact: true })).toBeVisible();
  await expectContinuousShell(page, marker);

  await nav.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Learn", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expectContinuousShell(page, marker);

  await page.goBack();
  await expect(page).toHaveURL(/\/mastery\/reference$/);
  await expect(page.getByRole("link", { name: "Reference", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);

  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("link", { name: "Learn", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);
});

test("keyboard navigation and the historical prerequisite CTA use the reliable client path", async ({ page }) => {
  await installUnloadCounter(page);
  await page.goto("/mastery");
  const marker = await stampShell(page);
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  const learn = nav.getByRole("link", { name: "Учиться", exact: true });

  let reachedLearn = false;
  for (let step = 0; step < 20; step += 1) {
    await page.keyboard.press("Tab");
    reachedLearn = await learn.evaluate((element) => element === document.activeElement);
    if (reachedLearn) break;
  }
  expect(reachedLearn, "Tab order must reach the primary Learn link").toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("link", { name: "Учиться", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);

  await page.getByRole("link", { name: "Чтение стола", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/perception$/);
  const start = page.getByRole("link", { name: /Старт обучения/i });
  await expect(start).toBeVisible();
  await start.click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await expectContinuousShell(page, marker);
});

test("direct mastery reload remains valid while Real Hands stays a document-navigation boundary", async ({ page }) => {
  await page.goto("/mastery/study");
  await expect(page).toHaveURL(/\/mastery\/study$/);
  await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();
  await page.reload();
  await expect(page).toHaveURL(/\/mastery\/study$/);
  await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();

  await installUnloadCounter(page);
  await page.evaluate(({ key }) => sessionStorage.setItem(key, "0"), { key: unloadKey });
  const marker = await stampShell(page);
  const realHands = page.getByRole("navigation", { name: "Practical Mastery navigation" }).getByRole("link", { name: "Реальные руки →", exact: true });
  await expect(realHands).toHaveAttribute("href", "/tools?tab=field");
  await realHands.click();
  await expect(page).toHaveURL(/\/tools\?tab=field$/);
  await expect.poll(() => page.evaluate(({ key }) => Number.parseInt(sessionStorage.getItem(key) || "0", 10), { key: unloadKey })).toBe(1);
  expect(await page.evaluate(({ markerKey }) => window[markerKey] || null, { markerKey: shellMarkerKey })).not.toBe(marker);
});
