import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const PROFILE_KEY = "live-cash-os:portable-profile-code";
const PROFILE_PREFIX = `${LEARNER_KEY}:profile:`;
const PROFILE_A = "LCO-TEST-AAAAAAAAAAAAAAAAAAAA";
const PROFILE_B = "LCO-TEST-BBBBBBBBBBBBBBBBBBBB";
const DAY = 86_400_000;

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function localState(page, key = LEARNER_KEY) {
  await expect.poll(async () => page.evaluate((storageKey) => localStorage.getItem(storageKey), key)).not.toBeNull();
  return page.evaluate((storageKey) => JSON.parse(localStorage.getItem(storageKey)), key);
}

async function seedCompletedGeometry(page) {
  const state = await localState(page);
  state.modules.geometry.contentCompleted = true;
  state.modules.geometry.lessonStep = 10;
  state.cards = {};
  state.activeSession = null;
  state.revision += 1;
  state.updatedAt = new Date().toISOString();
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: LEARNER_KEY, value: state });
  await page.reload();
}

test.beforeEach(async ({ page }) => {
  await openLocal(page);
});

test("Good card keeps its saved due time across reload and does not immediately return", async ({ page }) => {
  await seedCompletedGeometry(page);
  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await expect(page.getByRole("button", { name: /Разминка · до 2 мин/ })).toHaveAttribute("aria-pressed", "true");

  const firstFront = (await page.locator("main .session h2").innerText()).trim();
  const gradedAt = Date.now();
  await page.getByRole("button", { name: /^Показать ответ/ }).click();
  await page.getByRole("button", { name: "Нормально", exact: true }).click();

  await expect.poll(async () => {
    const state = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), LEARNER_KEY);
    return Object.values(state.cards).filter((card) => card.lastGrade === 2).length;
  }).toBe(1);

  const afterGrade = await localState(page);
  const good = Object.values(afterGrade.cards).find((card) => card.lastGrade === 2);
  expect(Date.parse(good.dueAt)).toBeGreaterThanOrEqual(gradedAt + 2 * DAY - 2_000);
  expect(Date.parse(good.dueAt)).toBeLessThanOrEqual(Date.now() + 2 * DAY + 2_000);

  await page.reload();
  await page.getByRole("button", { name: "Карточки", exact: true }).click();
  await expect(page.getByRole("button", { name: /Разминка · до 2 мин/ })).toHaveAttribute("aria-pressed", "true");
  await expect(page.locator("main .session h2")).not.toHaveText(firstFront);

  const afterReload = await localState(page);
  const persisted = Object.values(afterReload.cards).find((card) => card.lastGrade === 2);
  expect(persisted.dueAt).toBe(good.dueAt);
  expect(persisted.repetitions).toBe(1);
});

test("profile A local-only progress survives A to B to A switching", async ({ page }) => {
  const anonymous = await localState(page);
  anonymous.modules.geometry.contentCompleted = true;
  anonymous.modules.geometry.lessonStep = 10;
  anonymous.revision += 1;
  anonymous.updatedAt = new Date().toISOString();
  await page.evaluate(({ learnerKey, profileKey, profile, value }) => {
    localStorage.setItem(learnerKey, JSON.stringify(value));
    localStorage.setItem(profileKey, profile);
  }, { learnerKey: LEARNER_KEY, profileKey: PROFILE_KEY, profile: PROFILE_A, value: anonymous });
  await page.reload();

  await expect.poll(async () => page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length, PROFILE_PREFIX)).toBe(1);
  const aKey = await page.evaluate((prefix) => Object.keys(localStorage).find((key) => key.startsWith(prefix)), PROFILE_PREFIX);
  expect(aKey).toBeTruthy();
  const aState = await localState(page, aKey);
  expect(aState.modules.geometry.contentCompleted).toBe(true);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY)).toBeNull();

  await page.evaluate(({ key, profile }) => localStorage.setItem(key, profile), { key: PROFILE_KEY, profile: PROFILE_B });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await expect.poll(async () => page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length, PROFILE_PREFIX)).toBe(2);
  const bKeys = await page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)), PROFILE_PREFIX);
  const bKey = bKeys.find((key) => key !== aKey);
  const bState = await localState(page, bKey);
  expect(bState.modules.geometry.contentCompleted).toBe(false);

  await page.evaluate(({ key, profile }) => localStorage.setItem(key, profile), { key: PROFILE_KEY, profile: PROFILE_A });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  const restoredA = await localState(page, aKey);
  expect(restoredA.modules.geometry.contentCompleted).toBe(true);
  expect(restoredA.modules.geometry.lessonStep).toBe(10);
});
