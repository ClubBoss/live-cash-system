import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function seedPreflopConcept(page, locale) {
  await expect.poll(async () => page.evaluate((storageKey) => localStorage.getItem(storageKey) !== null, STORAGE_KEY)).toBe(true);
  await page.evaluate(({ storageKey, localeKey, locale }) => {
    const state = JSON.parse(localStorage.getItem(storageKey));
    const now = new Date().toISOString();
    state.modules.geometry.contentCompleted = true;
    state.modules.geometry.lessonStep = 10;
    state.activeSession = {
      mode: "lesson",
      moduleId: "preflop",
      step: 1,
      drillIds: ["pre-01", "pre-02", "pre-03"],
      currentIndex: 1,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: now,
      itemStartedAt: now,
      explainBack: "",
    };
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(localeKey, locale);
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, { storageKey: STORAGE_KEY, localeKey: LOCALE_KEY, locale });
  await page.reload();
}

async function verifyLocaleTransfer(page, locale) {
  await seedPreflopConcept(page, locale);
  const session = page.locator("main .session");
  await expect(session).toBeVisible();
  const scaffold = page.locator("[data-novice-scaffold='preflop']");
  await expect(scaffold).toBeVisible();

  if (locale === "ru") {
    await expect(session).toContainText("Семейства и свойства стартовых рук");
    await session.getByText("Дополнительное объяснение", { exact: true }).click();
    await expect(session).toContainText("76s и 98s — мастевые связки");
    await expect(session).toContainText("Семейство помогает понять руку, но не выбирает действие за тебя");
    const apply = page.getByRole("button", { name: /^Сразу применить/ });
    await expect(apply).toBeHidden();
    await scaffold.getByRole("button", { name: /^Я решил — разобрать Cold Check/ }).click();
    await expect(apply).toBeVisible();
    await apply.click();
  } else {
    await expect(session).toContainText("Starting-hand families and traits");
    await session.getByText("More explanation", { exact: true }).click();
    await expect(session).toContainText("76s and 98s are suited connectors");
    await expect(session).toContainText("does not choose the action for you");
    const apply = page.getByRole("button", { name: /^Apply it now/ });
    await expect(apply).toBeHidden();
    await scaffold.getByRole("button", { name: /^I decided — review the Cold Check/ }).click();
    await expect(apply).toBeVisible();
    await apply.click();
  }

  const decision = session.locator(".decision-card");
  await expect(decision).toBeVisible();
  await expect(decision).toContainText("76s");
  await expect(decision).toContainText(locale === "ru" ? "семейство 76s" : "family of 76s");
  await expect(decision).toContainText(locale === "ru" ? "свойства" : "traits");
  await expect(decision).not.toContainText(locale === "ru" ? "жизнеспособный базовый колл" : "viable baseline call");
  await expect(decision).not.toContainText(locale === "ru" ? "базовый колл" : "baseline call");

  await decision.getByRole("button", { name: locale === "ru" ? "Колл" : "Call", exact: true }).click();
  await decision.locator("fieldset.answer-set").nth(1).getByRole("button").first().click();
  await decision.locator("button.primary").click();

  const feedback = session.locator(".feedback-view");
  await expect(feedback).toBeVisible();
  await expect(feedback).toContainText("76s");
  await expect(feedback).toContainText("98s");
  await expect(feedback).toContainText(locale === "ru" ? "мастевая связка" : "suited connector");
  await expect(feedback).toContainText(locale === "ru" ? "не выбирают действие" : "do not choose the action");
}

test("LCM-02 mobile RU/EN teaches and tests 76s family/traits without leaking the action", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localOnly(page);
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();

  await verifyLocaleTransfer(page, "ru");
  await verifyLocaleTransfer(page, "en");
});
