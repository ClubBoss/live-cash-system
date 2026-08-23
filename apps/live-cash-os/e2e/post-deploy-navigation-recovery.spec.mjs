import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const liveOrigin = "https://live-cash-os-mobile-test.blufferus.workers.dev";
const exactMainSha = "232d2056b9b619ca5176a449cb071ecb87abe8ef";
const portableCodeKey = "live-cash-os:portable-profile-code";
const learnerStateKey = "live-cash-os:learner-state";
const localeKey = "live-cash-os:locale";
const unloadKey = "__pr122_post_deploy_unloads";
const shellMarkerKey = "__pr122PostDeployShellMarker";
const futureStateRaw = JSON.stringify({ schemaVersion: 999, sentinel: "deployed-recovery-escape-must-not-mutate" });

const access = JSON.parse(readFileSync(new URL("../test-invites/tester-access.private.json", import.meta.url), "utf8"));
const testerCode = access.testers?.find((tester) => tester.label === "tester-01" && tester.active)?.code;
if (!testerCode) throw new Error("Active tester-01 code is required for deployed probe");

async function applyTesterCode(page) {
  await page.addInitScript(({ key, code }) => localStorage.setItem(key, code), { key: portableCodeKey, code: testerCode });
}

async function isolateRemoteLearnerState(page) {
  await page.route(`${liveOrigin}/api/state`, async (route) => {
    if (route.request().method() === "GET") {
      const response = await route.fetch();
      if (!response.ok()) {
        await route.fulfill({ response });
        return;
      }
      const payload = await response.json();
      await route.fulfill({ response, json: { ...payload, state: null } });
      return;
    }
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ code: "AUTH_REQUIRED", error: "post-deploy probe is read-only" }),
    });
  });
}

async function waitForExactDeployment(page) {
  let observed = null;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    await page.goto(`${liveOrigin}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });
    const badge = page.locator("[data-build-sha]").first();
    await badge.waitFor({ timeout: 15_000 });
    observed = await badge.getAttribute("data-build-sha");
    if (observed === exactMainSha) return;
    await page.waitForTimeout(15_000);
  }
  throw new Error(`Exact-main deployment did not converge: expected ${exactMainSha}, observed ${observed ?? "missing"}`);
}

async function stampContinuousShell(page) {
  return page.evaluate(({ unloadStorageKey, markerKey }) => {
    sessionStorage.setItem(unloadStorageKey, "0");
    addEventListener("beforeunload", () => {
      const current = Number.parseInt(sessionStorage.getItem(unloadStorageKey) || "0", 10) || 0;
      sessionStorage.setItem(unloadStorageKey, String(current + 1));
    }, { once: true });
    const marker = crypto.randomUUID();
    window[markerKey] = marker;
    return marker;
  }, { unloadStorageKey: unloadKey, markerKey: shellMarkerKey });
}

async function expectContinuousShell(page, marker) {
  await expect.poll(() => page.evaluate(({ markerKey }) => window[markerKey] || null, { markerKey: shellMarkerKey })).toBe(marker);
  await expect.poll(() => page.evaluate(({ key }) => Number.parseInt(sessionStorage.getItem(key) || "0", 10), { key: unloadKey })).toBe(0);
}

async function armBoundaryUnload(page) {
  return page.evaluate(({ unloadStorageKey, markerKey }) => {
    sessionStorage.setItem(unloadStorageKey, "0");
    addEventListener("beforeunload", () => {
      const current = Number.parseInt(sessionStorage.getItem(unloadStorageKey) || "0", 10) || 0;
      sessionStorage.setItem(unloadStorageKey, String(current + 1));
    }, { once: true });
    const marker = crypto.randomUUID();
    window[markerKey] = marker;
    return marker;
  }, { unloadStorageKey: unloadKey, markerKey: shellMarkerKey });
}

test("exact deployed PR122 build closes navigation continuity and recovery escape", async ({ browser, request }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "One production Chromium probe is sufficient after cross-browser exact-head certification");
  test.setTimeout(240_000);

  const unknown = await request.get(`${liveOrigin}/api/state`, {
    headers: { "x-live-cash-profile-code": "LCO-AAAAAAAAAAAAAAAAAAAA" },
  });
  expect(unknown.status()).toBe(401);
  expect((await unknown.json()).code).toBe("AUTH_REQUIRED");

  const lockedContext = await browser.newContext();
  const locked = await lockedContext.newPage();
  await locked.goto(`${liveOrigin}/`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await expect(locked.getByRole("heading", { name: "Вход для тестирования" })).toBeVisible();
  await lockedContext.close();

  const context = await browser.newContext();
  const page = await context.newPage();
  await applyTesterCode(page);
  await isolateRemoteLearnerState(page);
  await waitForExactDeployment(page);

  await expect(page).toHaveURL(`${liveOrigin}/mastery/journey`);
  await expect(page.locator("[data-build-sha]").first()).toHaveAttribute("data-build-sha", exactMainSha);
  await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  let nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Learn", exact: true })).toHaveAttribute("aria-current", "page");

  const marker = await stampContinuousShell(page);
  await nav.getByRole("link", { name: "Table reading", exact: true }).click();
  await expect(page).toHaveURL(`${liveOrigin}/mastery/perception`);
  await expectContinuousShell(page, marker);

  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await nav.getByRole("link", { name: "After play", exact: true }).click();
  await expect(page).toHaveURL(`${liveOrigin}/mastery/study`);
  await expectContinuousShell(page, marker);

  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await nav.getByRole("link", { name: "Reference", exact: true }).click();
  await expect(page).toHaveURL(`${liveOrigin}/mastery/reference`);
  await expectContinuousShell(page, marker);

  nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await nav.getByRole("link", { name: "Learn", exact: true }).click();
  await expect(page).toHaveURL(`${liveOrigin}/mastery/journey`);
  await expectContinuousShell(page, marker);

  await page.goBack();
  await expect(page).toHaveURL(`${liveOrigin}/mastery/reference`);
  await expectContinuousShell(page, marker);
  await page.goForward();
  await expect(page).toHaveURL(`${liveOrigin}/mastery/journey`);
  await expectContinuousShell(page, marker);

  await page.goto(`${liveOrigin}/mastery/study`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  const realHands = page.getByRole("navigation", { name: "Practical Mastery navigation" }).getByRole("link", { name: "Real hands →", exact: true });
  await expect(realHands).toHaveAttribute("href", "/tools?tab=field");
  const realHandsMarker = await armBoundaryUnload(page);
  await realHands.click();
  await expect(page).toHaveURL(`${liveOrigin}/tools`);
  await expect(page.getByRole("navigation", { name: "Primary navigation" }).getByRole("button", { name: "Hands", exact: true })).toHaveAttribute("aria-current", "page");
  await expect.poll(() => page.evaluate(({ key }) => Number.parseInt(sessionStorage.getItem(key) || "0", 10), { key: unloadKey })).toBe(1);
  expect(await page.evaluate(({ markerKey }) => window[markerKey] || null, { markerKey: shellMarkerKey })).not.toBe(realHandsMarker);

  await page.evaluate(({ stateKey, raw, languageKey }) => {
    localStorage.setItem(stateKey, raw);
    localStorage.setItem(languageKey, "ru");
  }, { stateKey: learnerStateKey, raw: futureStateRaw, languageKey: localeKey });
  await page.goto(`${liveOrigin}/mastery/journey`, { waitUntil: "domcontentloaded", timeout: 45_000 });
  await expect(page.getByRole("heading", { name: "Прогресс требует восстановления", exact: true })).toBeVisible();
  const recovery = page.getByRole("link", { name: /Открыть данные и восстановление/i });
  await expect(recovery).toHaveAttribute("href", "/tools");
  expect(await page.evaluate(({ key }) => localStorage.getItem(key), { key: learnerStateKey })).toBe(futureStateRaw);

  const recoveryMarker = await armBoundaryUnload(page);
  await recovery.click();
  await expect(page).toHaveURL(`${liveOrigin}/tools`);
  await expect(page.getByRole("button", { name: "Данные", exact: true })).toBeVisible();
  expect(await page.evaluate(({ key }) => localStorage.getItem(key), { key: learnerStateKey })).toBe(futureStateRaw);
  await expect.poll(() => page.evaluate(({ key }) => Number.parseInt(sessionStorage.getItem(key) || "0", 10), { key: unloadKey })).toBe(1);
  expect(await page.evaluate(({ markerKey }) => window[markerKey] || null, { markerKey: shellMarkerKey })).not.toBe(recoveryMarker);

  await context.close();
});
