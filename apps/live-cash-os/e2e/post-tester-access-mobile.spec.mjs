import { expect, test } from "@playwright/test";

const PROFILE_KEY = "live-cash-os:portable-profile-code";
const LOCALE_KEY = "live-cash-os:locale";
const LEARNER_KEY = "live-cash-os:learner-state";
const ONLINE_TEST_KEY = "wave-c:test-online";
const TEST_CODE = "LCO-AAAAAAAAAAAAAAAAAAAA";
const RUNTIME = {
  appVersion: "1.2.0",
  contentVersion: "2026.08-wave7-integrity",
  schemaVersion: 2,
};

function apiController() {
  let mode = "401";
  let getRequests = 0;

  return {
    setMode(next) {
      mode = next;
    },
    getRequests() {
      return getRequests;
    },
    async handle(route) {
      if (route.request().method() !== "GET") {
        await route.fulfill({
          status: 401,
          contentType: "application/json",
          body: JSON.stringify({ error: "local test", code: "AUTH_REQUIRED", runtime: RUNTIME }),
        }).catch(() => undefined);
        return;
      }

      getRequests += 1;
      if (mode === "abort") {
        await route.abort("failed").catch(() => undefined);
        return;
      }
      if (mode === "delay-401") {
        await new Promise((resolve) => setTimeout(resolve, 250));
      }
      if (mode === "delay-200") {
        await new Promise((resolve) => setTimeout(resolve, 2_000));
      }

      const status = mode === "200" || mode === "delay-200"
        ? 200
        : mode === "500"
          ? 500
          : mode === "503"
            ? 503
            : 401;
      const body = status === 200
        ? { state: null, cloudDeleted: false, cloudToken: null, runtime: RUNTIME }
        : status === 401
          ? { error: "local test", code: "AUTH_REQUIRED", runtime: RUNTIME }
          : { error: "local service failure", code: "CLOUD_STORAGE_UNAVAILABLE", runtime: RUNTIME };

      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(body),
      }).catch(() => undefined);
    },
  };
}

async function installOnlineTruth(page, initialOnline = true) {
  await page.addInitScript(({ key, initial }) => {
    if (localStorage.getItem(key) === null) localStorage.setItem(key, initial ? "true" : "false");
    Object.defineProperty(navigator, "onLine", {
      configurable: true,
      get: () => localStorage.getItem(key) !== "false",
    });
  }, { key: ONLINE_TEST_KEY, initial: initialOnline });
}

async function setOnlineTruth(page, online) {
  await page.evaluate(({ key, online }) => {
    localStorage.setItem(key, online ? "true" : "false");
  }, { key: ONLINE_TEST_KEY, online });
}

async function seedStorage(page, { code, locale, learner } = {}) {
  await page.addInitScript(({ profileKey, localeKey, learnerKey, code, locale, learner }) => {
    if (code !== undefined) localStorage.setItem(profileKey, code);
    if (locale !== undefined) localStorage.setItem(localeKey, locale);
    if (learner !== undefined) localStorage.setItem(learnerKey, learner);
  }, {
    profileKey: PROFILE_KEY,
    localeKey: LOCALE_KEY,
    learnerKey: LEARNER_KEY,
    code,
    locale,
    learner,
  });
}

async function expectLocked(page) {
  await expect(page.getByRole("navigation", { name: /Основная навигация|Primary navigation/ })).toHaveCount(0);
}

async function expectRussianGate(page) {
  await expect(page.getByRole("heading", { name: "Вход для тестирования" })).toBeVisible();
  await expect(page.getByLabel("Код доступа")).toBeVisible();
  await expect(page.getByRole("group", { name: "Язык интерфейса" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  await expect(page.getByRole("button", { name: "RU", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expectLocked(page);
}

async function expectEnglishGate(page) {
  await expect(page.getByRole("heading", { name: "Test access" })).toBeVisible();
  await expect(page.getByLabel("Access code")).toBeVisible();
  await expect(page.getByRole("group", { name: "Interface language" })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.getByRole("button", { name: "EN", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expectLocked(page);
}

async function openAppWithStoredInvite(page, controller, locale = "ru") {
  await installOnlineTruth(page);
  await seedStorage(page, { code: TEST_CODE, locale });
  controller.setMode("200");
  await page.route("**/api/state", (route) => controller.handle(route));
  await page.goto("/tools");
  await expect(page.getByRole("navigation", {
    name: locale === "ru" ? "Основная навигация" : "Primary navigation",
  })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("lang", locale);
  await expect(page.getByRole("button", { name: locale === "ru" ? "RU" : "EN", exact: true })).toHaveAttribute("aria-pressed", "true");
}

async function assertNoHorizontalOverflow(page, group) {
  const dimensions = await page.evaluate(() => ({
    documentScroll: document.documentElement.scrollWidth,
    documentClient: document.documentElement.clientWidth,
  }));
  expect(dimensions.documentScroll).toBeLessThanOrEqual(dimensions.documentClient + 1);

  for (const locator of [page.locator(".session"), group]) {
    const size = await locator.evaluate((element) => ({
      scroll: element.scrollWidth,
      client: element.clientWidth,
    }));
    expect(size.scroll).toBeLessThanOrEqual(size.client + 1);
  }
}

async function assertDenseOption(page, group, button, expectedText, selected) {
  await expect(button).toHaveText(expectedText);
  const box = await button.boundingBox();
  expect(box?.height ?? 0).toBeGreaterThanOrEqual(48);

  const style = await button.evaluate((element) => {
    const computed = getComputedStyle(element);
    return {
      whiteSpace: computed.whiteSpace,
      textOverflow: computed.textOverflow,
      overflowX: computed.overflowX,
      scrollWidth: element.scrollWidth,
      clientWidth: element.clientWidth,
      focused: element.matches(":focus"),
    };
  });
  expect(style.whiteSpace).not.toBe("nowrap");
  expect(style.textOverflow).not.toBe("ellipsis");
  expect(style.overflowX).not.toBe("scroll");
  expect(style.scrollWidth).toBeLessThanOrEqual(style.clientWidth + 1);

  await expect(button).toHaveAttribute("aria-pressed", selected ? "true" : "false");
  await assertNoHorizontalOverflow(page, group);
}

test.describe("Post-tester Wave C invite truth and mobile decision density", () => {
  test.skip(
    process.env.LIVE_CASH_DEPLOY_TARGET !== "test-mirror",
    "Wave C gate coverage uses the existing test-mirror build flag.",
  );

  test("RU/EN gate switch persists without mutating learner state", async ({ page }, testInfo) => {
    await installOnlineTruth(page);
    await seedStorage(page, { learner: "wave-c-learner-sentinel" });
    const controller = apiController();
    await page.route("**/api/state", (route) => controller.handle(route));

    await page.goto("/");
    await expectRussianGate(page);
    await page.screenshot({ path: testInfo.outputPath("invite-gate-ru.png"), fullPage: true });

    const before = await page.evaluate(({ learnerKey }) => localStorage.getItem(learnerKey), { learnerKey: LEARNER_KEY });
    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expectEnglishGate(page);
    await page.screenshot({ path: testInfo.outputPath("invite-gate-en.png"), fullPage: true });
    expect(await page.evaluate(({ learnerKey }) => localStorage.getItem(learnerKey), { learnerKey: LEARNER_KEY })).toBe(before);
    expect(await page.evaluate(({ localeKey }) => localStorage.getItem(localeKey), { localeKey: LOCALE_KEY })).toBe("en");

    await page.reload();
    await expectEnglishGate(page);

    await page.getByRole("button", { name: "RU", exact: true }).click();
    await expectRussianGate(page);
    expect(await page.evaluate(({ localeKey }) => localStorage.getItem(localeKey), { localeKey: LOCALE_KEY })).toBe("ru");
  });

  test("form classification distinguishes malformed, 401, 5xx, offline, online fetch failure, retry, and valid", async ({ page }, testInfo) => {
    await installOnlineTruth(page);
    const controller = apiController();
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expectRussianGate(page);

    const input = page.getByLabel("Код доступа");
    await input.fill("NOT-A-VALID-CODE");
    await page.getByRole("button", { name: "Продолжить", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Код не найден или отключён. Проверьте его и попробуйте ещё раз.");
    expect(controller.getRequests()).toBe(0);

    await input.fill(TEST_CODE);
    controller.setMode("401");
    await page.getByRole("button", { name: "Продолжить", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Код не найден или отключён. Проверьте его и попробуйте ещё раз.");
    expect(controller.getRequests()).toBe(1);
    await page.screenshot({ path: testInfo.outputPath("invite-invalid.png"), fullPage: true });

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("The code was not found or has been disabled. Check it and try again.");

    controller.setMode("500");
    await page.getByRole("button", { name: "Continue", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("The verification service is temporarily unavailable. Your code may still be valid — try again a little later.");
    await expect(page.getByRole("button", { name: "Retry verification", exact: true })).toBeVisible();
    expect(controller.getRequests()).toBe(2);

    controller.setMode("503");
    await page.getByRole("button", { name: "Retry verification", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("The verification service is temporarily unavailable. Your code may still be valid — try again a little later.");
    expect(controller.getRequests()).toBe(3);
    await page.screenshot({ path: testInfo.outputPath("invite-service-unavailable.png"), fullPage: true });

    await page.getByRole("button", { name: "RU", exact: true }).click();
    controller.setMode("abort");
    await setOnlineTruth(page, true);
    await page.getByRole("button", { name: "Повторить проверку", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Сервис проверки временно недоступен. Код может быть корректным — попробуйте ещё раз чуть позже.");
    await expect(page.getByRole("alert")).not.toContainText("Код не найден");
    expect(controller.getRequests()).toBe(4);

    await setOnlineTruth(page, false);
    await page.getByRole("button", { name: "Повторить проверку", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("Нет подключения к интернету. Подключитесь к сети, чтобы проверить код доступа.");
    expect(controller.getRequests()).toBe(5);
    await page.screenshot({ path: testInfo.outputPath("invite-offline.png"), fullPage: true });

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("No internet connection. Connect to the internet to verify the access code.");

    await setOnlineTruth(page, true);
    controller.setMode("200");
    await page.getByRole("button", { name: "Retry verification", exact: true }).click();
    expect(controller.getRequests()).toBe(6);
    await expect(page).toHaveURL(/\/mastery\/journey$/);
    const practicalNav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
    await expect(practicalNav).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Primary navigation" })).toHaveCount(0);
    await expect(page.getByText(/QUICK START · STEP 1 OF 8/i)).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(practicalNav.getByRole("button", { name: "EN", exact: true })).toHaveAttribute("aria-pressed", "true");
    expect(await page.evaluate(({ localeKey }) => localStorage.getItem(localeKey), { localeKey: LOCALE_KEY })).toBe("en");
    expect(await page.evaluate(({ profileKey }) => localStorage.getItem(profileKey), { profileKey: PROFILE_KEY })).toBe(TEST_CODE);
  });

  test("hanging verification times out fail-closed and retry starts a fresh request", async ({ page }) => {
    await installOnlineTruth(page);
    await seedStorage(page, { code: TEST_CODE, locale: "ru" });
    await page.addInitScript(({ runtime }) => {
      const nativeFetch = window.fetch.bind(window);
      let inviteAttempts = 0;
      Object.defineProperty(window, "__waveCInviteAttempts", {
        configurable: true,
        get: () => inviteAttempts,
      });
      window.fetch = (input, init = {}) => {
        const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
        if (!url.endsWith("/api/state")) return nativeFetch(input, init);
        inviteAttempts += 1;
        if (inviteAttempts === 1) {
          return new Promise((_, reject) => {
            const fail = () => reject(new DOMException("Aborted", "AbortError"));
            if (init.signal?.aborted) fail();
            else init.signal?.addEventListener("abort", fail, { once: true });
          });
        }
        return Promise.resolve(new Response(JSON.stringify({
          state: null,
          cloudDeleted: false,
          cloudToken: null,
          runtime,
        }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }));
      };
    }, { runtime: RUNTIME });

    const startedAt = Date.now();
    await page.goto("/");
    await expect(page.getByRole("alert")).toHaveText(
      "Сервис проверки временно недоступен. Код может быть корректным — попробуйте ещё раз чуть позже.",
      { timeout: 12_500 },
    );
    expect(Date.now() - startedAt).toBeLessThan(12_500);
    await expect(page.getByRole("button", { name: "Повторить проверку", exact: true })).toBeVisible();
    const attemptsBeforeRetry = await page.evaluate(() => window.__waveCInviteAttempts);
    expect(attemptsBeforeRetry).toBe(1);
    await expectLocked(page);

    await page.getByRole("button", { name: "Повторить проверку", exact: true }).click();
    await expect(page).toHaveURL(/\/mastery\/journey$/);
    const attemptsAfterRetry = await page.evaluate(() => window.__waveCInviteAttempts);
    expect(attemptsAfterRetry).toBeGreaterThan(attemptsBeforeRetry);
  });

  test("stored invite startup retains the code across invalid, service, and offline states", async ({ page }) => {
    await installOnlineTruth(page);
    await seedStorage(page, { code: TEST_CODE, locale: "ru" });
    const controller = apiController();
    await page.route("**/api/state", (route) => controller.handle(route));

    controller.setMode("401");
    await page.goto("/");
    await expect(page.getByRole("alert")).toHaveText("Код не найден или отключён. Проверьте его и попробуйте ещё раз.");
    await expect(page.getByLabel("Код доступа")).toHaveValue(TEST_CODE);
    await expectLocked(page);

    controller.setMode("503");
    await page.reload();
    await expect(page.getByRole("alert")).toHaveText("Сервис проверки временно недоступен. Код может быть корректным — попробуйте ещё раз чуть позже.");
    await expect(page.getByLabel("Код доступа")).toHaveValue(TEST_CODE);
    await expectLocked(page);

    await setOnlineTruth(page, false);
    controller.setMode("abort");
    await page.reload();
    await expect(page.getByRole("alert")).toHaveText("Нет подключения к интернету. Подключитесь к сети, чтобы проверить код доступа.");
    await expect(page.getByLabel("Код доступа")).toHaveValue(TEST_CODE);
    expect(await page.evaluate(({ profileKey }) => localStorage.getItem(profileKey), { profileKey: PROFILE_KEY })).toBe(TEST_CODE);
    await expectLocked(page);
  });

  test("stored valid invite opens the app in the persisted RU locale", async ({ page }) => {
    const controller = apiController();
    await openAppWithStoredInvite(page, controller, "ru");
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
  });

  test("stored invite revalidation stays fail-closed without flashing the access form", async ({ page }) => {
    const pageErrors = [];
    page.on("pageerror", (error) => pageErrors.push(error));

    await installOnlineTruth(page);
    await seedStorage(page, { code: TEST_CODE, locale: "ru" });
    const controller = apiController();
    controller.setMode("delay-200");
    await page.route("**/api/state", (route) => controller.handle(route));

    await page.goto("/tools?tab=data");
    const pending = page.locator("main.loading[aria-busy='true']");
    await expect(pending).toBeVisible();
    await expect(page.getByRole("heading", { name: "Вход для тестирования" })).toHaveCount(0);
    await expect(page.locator("#test-invite-code")).toHaveCount(0);
    await expectLocked(page);
    await expect(page.getByRole("heading", { name: "Инструменты", level: 1 })).toBeVisible();

    await page.getByRole("link", { name: "Вернуться в Practical Mastery" }).click();
    await expect(pending).toBeVisible();
    expect(await page.getByRole("heading", { name: "Вход для тестирования" }).count()).toBe(0);
    expect(await page.locator("#test-invite-code").count()).toBe(0);
    expect(await page.getByRole("navigation", { name: "Practical Mastery navigation" }).count()).toBe(0);
    await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();

    await page.reload();
    await expect(pending).toBeVisible();
    expect(await page.getByRole("heading", { name: "Вход для тестирования" }).count()).toBe(0);
    expect(await page.locator("#test-invite-code").count()).toBe(0);
    expect(await page.getByRole("navigation", { name: "Practical Mastery navigation" }).count()).toBe(0);
    await expect(page.getByRole("navigation", { name: "Practical Mastery navigation" })).toBeVisible();
    expect(controller.getRequests()).toBe(3);

    // Hydration must produce the same initial tree the server rendered; a
    // mismatch here (React error #418) means the SSR document was discarded
    // and re-rendered client-side, which is the concrete regression this test
    // guards against across the initial load, in-app navigation, and reload.
    expect(pageErrors).toEqual([]);
  });

  test("language switching during a service error preserves portable identity and learner state", async ({ page }) => {
    await installOnlineTruth(page);
    await seedStorage(page, {
      code: TEST_CODE,
      locale: "ru",
      learner: "wave-c-identity-sentinel",
    });
    const controller = apiController();
    controller.setMode("503");
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expect(page.getByRole("alert")).toHaveText("Сервис проверки временно недоступен. Код может быть корректным — попробуйте ещё раз чуть позже.");

    const before = await page.evaluate(({ profileKey, learnerKey }) => ({
      profile: localStorage.getItem(profileKey),
      learner: localStorage.getItem(learnerKey),
    }), { profileKey: PROFILE_KEY, learnerKey: LEARNER_KEY });

    await page.getByRole("button", { name: "EN", exact: true }).click();
    await expect(page.getByRole("alert")).toHaveText("The verification service is temporarily unavailable. Your code may still be valid — try again a little later.");
    await page.getByRole("button", { name: "RU", exact: true }).click();

    const after = await page.evaluate(({ profileKey, learnerKey }) => ({
      profile: localStorage.getItem(profileKey),
      learner: localStorage.getItem(learnerKey),
    }), { profileKey: PROFILE_KEY, learnerKey: LEARNER_KEY });
    expect(after).toEqual(before);
  });

  test("checking state blocks repeated submit and never exposes the learner app", async ({ page }) => {
    await installOnlineTruth(page);
    const controller = apiController();
    controller.setMode("delay-401");
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expectRussianGate(page);

    await page.getByLabel("Код доступа").fill(TEST_CODE);
    await page.locator("form").evaluate((form) => {
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
      form.dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
    });
    await expect(page.getByRole("button", { name: "Проверяем код доступа…", exact: true })).toBeDisabled();
    await expectLocked(page);
    await expect(page.getByRole("alert")).toHaveText("Код не найден или отключён. Проверьте его и попробуйте ещё раз.");
    expect(controller.getRequests()).toBe(1);
  });

  test("reload during pending validation does not store the code or grant access", async ({ page }) => {
    await installOnlineTruth(page);
    const controller = apiController();
    controller.setMode("delay-200");
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expectRussianGate(page);

    await page.getByLabel("Код доступа").fill(TEST_CODE);
    await page.getByRole("button", { name: "Продолжить", exact: true }).click();
    await expect(page.getByRole("button", { name: "Проверяем код доступа…", exact: true })).toBeDisabled();
    await page.reload();
    await expectRussianGate(page);
    expect(await page.evaluate(({ profileKey }) => localStorage.getItem(profileKey), { profileKey: PROFILE_KEY })).toBeNull();
    await expectLocked(page);
  });

  test("mobile decisions preserve long action and reason text at 390x844 and 375x667", async ({ page }, testInfo) => {
    await page.setViewportSize({ width: 390, height: 844 });
    const controller = apiController();
    await openAppWithStoredInvite(page, controller, "ru");

    const nav = page.getByRole("navigation", { name: "Основная навигация" });
    await nav.getByRole("button", { name: "Учиться", exact: true }).click();
    await page.locator(".module-list article").first().getByRole("button", { name: /^Изучить/ }).click();
    await expect(page.getByRole("heading", { name: "В каких единицах сначала оценить глубину?" })).toBeVisible();

    const groups = page.locator(".decision-card .answer-set");
    const actionGroup = groups.nth(0);
    const reasonGroup = groups.nth(1);
    const actionText = "140 страддлов; отдельно отметить 280 обычных BB";
    const reasonText = "Именно страддл $10 задаёт цену всех префлоп-действий";
    const action = actionGroup.getByRole("button", { name: actionText, exact: true });
    const reason = reasonGroup.getByRole("button", { name: reasonText, exact: true });

    await assertDenseOption(page, actionGroup, action, actionText, false);
    await assertDenseOption(page, reasonGroup, reason, reasonText, false);
    await action.click();
    await reason.click();
    await assertDenseOption(page, actionGroup, action, actionText, true);
    await assertDenseOption(page, reasonGroup, reason, reasonText, true);

    const selectedColors = await Promise.all([
      action.evaluate((element) => getComputedStyle(element).backgroundColor),
      actionGroup.locator("button[aria-pressed='false']").first().evaluate((element) => getComputedStyle(element).backgroundColor),
    ]);
    expect(selectedColors[0]).not.toBe(selectedColors[1]);

    await action.focus();
    expect(await action.evaluate((element) => element.matches(":focus"))).toBe(true);
    await page.screenshot({ path: testInfo.outputPath("decision-options-390x844.png"), fullPage: true });

    await page.setViewportSize({ width: 375, height: 667 });
    await assertDenseOption(page, actionGroup, action, actionText, true);
    await assertDenseOption(page, reasonGroup, reason, reasonText, true);
    await page.screenshot({ path: testInfo.outputPath("decision-options-375x667.png"), fullPage: true });

    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(action).toBeVisible();
    await expect(reason).toBeVisible();
    await assertNoHorizontalOverflow(page, actionGroup);
    await assertNoHorizontalOverflow(page, reasonGroup);
  });
});
