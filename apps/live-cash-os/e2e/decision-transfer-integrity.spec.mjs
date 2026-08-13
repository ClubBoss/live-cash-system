import { expect, test } from "@playwright/test";

const STORAGE_KEY = "live-cash-os:learner-state";
const LOCALE_KEY = "live-cash-os:locale";

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function seedPreflopChangedSpot(page, locale) {
  await page.evaluate(({ storageKey, localeKey, locale }) => {
    const state = JSON.parse(localStorage.getItem(storageKey));
    const now = new Date().toISOString();
    state.modules.geometry.contentCompleted = true;
    state.modules.geometry.lessonStep = 10;
    state.activeSession = {
      mode: "lesson",
      moduleId: "preflop",
      step: 2,
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

test("LCM-02 changed spot asks the learner to classify a concrete 76s hand in RU and EN", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await localOnly(page);
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();

  await seedPreflopChangedSpot(page, "ru");
  const ruSession = page.locator("main .session");
  await expect(ruSession).toBeVisible();
  await expect(ruSession).toContainText("76s");
  await expect(ruSession).not.toContainText("нижнюю мастевую часть базового колл-региона");
  await expect(ruSession).not.toContainText("только потому");
  await expect(ruSession.getByRole("button", { name: "Колл", exact: true })).toBeVisible();
  await expect(ruSession.getByRole("button", { name: "Сквиз как полярный блеф", exact: true })).toBeVisible();
  await expect(ruSession.getByRole("button", { name: "Фолд", exact: true })).toBeVisible();

  await seedPreflopChangedSpot(page, "en");
  const enSession = page.locator("main .session");
  await expect(enSession).toBeVisible();
  await expect(enSession).toContainText("76s");
  await expect(enSession).not.toContainText("lower suited part of a baseline call region");
  await expect(enSession).not.toContainText("merely because");
  await expect(enSession.getByRole("button", { name: "Call", exact: true })).toBeVisible();
  await expect(enSession.getByRole("button", { name: "Squeeze as a polar bluff", exact: true })).toBeVisible();
  await expect(enSession.getByRole("button", { name: "Fold", exact: true })).toBeVisible();
});
