import { expect, test } from "@playwright/test";

const unloadKey = "__practical_nav_unload_count";
const shellMarkerKey = "__practicalNavigationShellMarker";
const learnerStateKey = "live-cash-os:learner-state";
const localeKey = "live-cash-os:locale";
const e2eLegacyToolsKey = "live-cash-os:e2e-legacy-tools";
const futureStateRaw = JSON.stringify({ schemaVersion: 999, sentinel: "recovery-escape-must-not-mutate" });

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

async function armCurrentDocumentUnloadCounter(page) {
  await page.evaluate(({ key }) => {
    sessionStorage.setItem(key, "0");
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
  await expect(nav.getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("aria-current", "page");

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

  await nav.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "After play", exact: true })).toHaveAttribute("aria-current", "page");

  await nav.getByRole("link", { name: "Reference", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/reference$/);
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Reference", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(nav.getByRole("link", { name: "Continue learning", exact: true })).toBeVisible();
  await expectContinuousShell(page, marker);

  await nav.getByRole("link", { name: "Continue learning", exact: true }).click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Continue learning", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expectContinuousShell(page, marker);

  await page.goBack();
  await expect(page).toHaveURL(/\/mastery\/reference$/);
  await expect(page.getByRole("link", { name: "Reference", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);

  await page.goForward();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("link", { name: "Continue learning", exact: true })).toHaveAttribute("aria-current", "page");
  await expectContinuousShell(page, marker);
});

test("keyboard navigation and the historical prerequisite CTA use the reliable client path", async ({ page }) => {
  await installUnloadCounter(page);
  await page.goto("/mastery");
  const marker = await stampShell(page);
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  const learn = nav.getByRole("link", { name: "Продолжить обучение", exact: true });

  let reachedLearn = false;
  for (let step = 0; step < 20; step += 1) {
    await page.keyboard.press("Tab");
    reachedLearn = await learn.evaluate((element) => element === document.activeElement);
    if (reachedLearn) break;
  }
  expect(reachedLearn, "Tab order must reach the primary Learn link").toBe(true);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  await expect(page.getByRole("link", { name: "Продолжить обучение", exact: true })).toHaveAttribute("aria-current", "page");
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

  await armCurrentDocumentUnloadCounter(page);
  const marker = await stampShell(page);
  const realHands = page.getByRole("navigation", { name: "Practical Mastery navigation" }).getByRole("link", { name: "Реальные руки →", exact: true });
  await expect(realHands).toHaveAttribute("href", "/tools?tab=field");
  await realHands.click();
  await expect(page).toHaveURL(/\/tools\?tab=field$/);
  const toolsNav = page.getByRole("navigation", { name: "Инструменты" });
  await expect(toolsNav.getByRole("button", { name: "Реальные руки", exact: true })).toHaveAttribute("aria-current", "page");
  await expect.poll(() => page.evaluate(({ key }) => Number.parseInt(sessionStorage.getItem(key) || "0", 10), { key: unloadKey })).toBe(1);
  expect(await page.evaluate(({ markerKey }) => window[markerKey] || null, { markerKey: shellMarkerKey })).not.toBe(marker);
});

test("every recovery-blocked Practical surface escapes to Data & Recovery without mutating learner state", async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ code: "AUTH_REQUIRED" }) });
  });
  await page.addInitScript(({ key, raw, languageKey, legacyKey }) => {
    if (location.origin !== "http://127.0.0.1:5173" || !location.pathname.startsWith("/mastery")) return;
    localStorage.removeItem(legacyKey);
    localStorage.setItem(key, raw);
    if (localStorage.getItem(languageKey) === null) localStorage.setItem(languageKey, "ru");
  }, { key: learnerStateKey, raw: futureStateRaw, languageKey: localeKey, legacyKey: e2eLegacyToolsKey });

  const surfaces = [
    { route: "/mastery/journey", locale: "ru", heading: "Прогресс требует восстановления", link: "Открыть данные и восстановление", data: "Данные и восстановление" },
    { route: "/mastery", locale: "en", heading: "Progress needs recovery", link: "Open Data & Recovery", data: "Data & Recovery" },
    { route: "/mastery/session", locale: "ru", heading: "Прогресс требует восстановления", link: "Открыть данные и восстановление", data: "Данные и восстановление" },
    { route: "/mastery/perception", locale: "en", heading: "Progress needs recovery", link: "Open Data & Recovery", data: "Data & Recovery" },
    { route: "/mastery/study", locale: "ru", heading: "Прогресс требует восстановления", link: "Открыть данные и восстановление", data: "Данные и восстановление" },
  ];

  for (const surface of surfaces) {
    if (page.url().startsWith("http://127.0.0.1:5173")) {
      await page.evaluate(({ languageKey, locale }) => localStorage.setItem(languageKey, locale), { languageKey: localeKey, locale: surface.locale });
    }
    await page.goto(surface.route);
    await expect(page.getByRole("heading", { name: surface.heading, exact: true })).toBeVisible();
    const recovery = page.getByRole("link", { name: new RegExp(surface.link, "i") });
    await expect(recovery).toHaveAttribute("href", "/tools");
    expect(await page.evaluate(({ key }) => localStorage.getItem(key), { key: learnerStateKey })).toBe(futureStateRaw);

    await recovery.click();
    await expect(page).toHaveURL(/\/tools$/);
    await expect(page.getByRole("navigation", { name: surface.locale === "ru" ? "Инструменты" : "Support tools" }).getByRole("button", { name: surface.data, exact: true })).toHaveAttribute("aria-current", "page");
    expect(await page.evaluate(({ key }) => localStorage.getItem(key), { key: learnerStateKey })).toBe(futureStateRaw);
  }
});
