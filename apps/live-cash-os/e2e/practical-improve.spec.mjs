import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function useLocalState(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local B+ acceptance" }) });
  });
}

async function learnerStateJson(page) {
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY)).not.toBeNull();
  return page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY);
}

async function learnerState(page) {
  return JSON.parse(await learnerStateJson(page));
}

async function teachFnd01(page) {
  await page.goto("/mastery/journey");
  await expect(page.getByText(/БЫСТРЫЙ СТАРТ · ШАГ 1 ИЗ 8/i)).toBeVisible();
  await page.getByRole("button", { name: /Проверить на примере/i }).click();
  await expect(page.getByText("ТЕПЕРЬ ТЫ", { exact: true })).toBeVisible();
  await expect.poll(async () => {
    const state = await learnerState(page);
    return state._practicalProfile?.mastery?.skills?.["FND-01"]?.conceptTaught;
  }).toBe(true);
}

test.beforeEach(async ({ page }) => {
  await useLocalState(page);
});

test("B+ route is discoverable, keeps system recommendation separate, and exposes no learner-facing internal IDs", async ({ page }) => {
  await page.goto("/mastery/improve");
  await expect(page.getByRole("heading", { name: /Выбери, что исправить дальше/i })).toBeVisible();
  const nav = page.getByRole("navigation", { name: "Practical Mastery navigation" });
  await expect(nav.getByRole("link", { name: "Улучшить", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-improve-section="recommendation"]')).toBeVisible();
  await expect(page.locator('[data-improve-section="current-mistakes"]')).toBeVisible();
  await expect(page.locator('[data-improve-section="manual-topics"]')).toBeVisible();
  await expect(page.locator("main")).not.toContainText(/\b(?:FND|PF|BL|OOP|IP|TURN|RIV|MW|DEEP|EXP|INT)-\d+\b|\bPM-[A-Z0-9-]+\b|SKILL:|PRICE_ONLY|ROLE_OR_RANGE_SHORTCUT/);
});

test("manual topic A to B before round start leaves learner state byte-for-byte unchanged", async ({ page }) => {
  await page.goto("/mastery/improve");
  const before = await learnerStateJson(page);
  const manual = page.locator('[data-improve-section="manual-topics"]');
  await manual.getByRole("button", { name: "База решений", exact: true }).click();
  await expect(page.locator('[data-manual-resolution="no-eligible"], [data-manual-resolution="exact-focus"], [data-manual-resolution="complete"], [data-manual-resolution="no-useful-item"]')).toBeVisible();
  await manual.getByRole("button", { name: "Префлоп", exact: true }).click();
  const after = await learnerStateJson(page);
  expect(after).toBe(before);
});

test("valid explicit exact start persists only existing integrated-round continuity and reload resumes exact focus", async ({ page }) => {
  await teachFnd01(page);
  await page.goto("/mastery/improve");

  const manual = page.locator('[data-improve-section="manual-topics"]');
  const beforeBrowse = await learnerStateJson(page);
  await manual.getByRole("button", { name: "База решений", exact: true }).click();
  await expect(page.locator('[data-manual-resolution="exact-focus"]')).toBeVisible();
  expect(await learnerStateJson(page)).toBe(beforeBrowse);

  await page.getByRole("button", { name: /Поработать над этим/i }).last().click();
  await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-01$/);
  const started = await learnerState(page);
  const integrated = started._practicalProfile?.studyWorkspace?.continuity?.integrated;
  expect(integrated?.focusSkillId).toBe("FND-01");
  expect(integrated?.items?.length ?? 0).toBeGreaterThan(0);
  expect(integrated?.items.every((item) => item.skillId === "FND-01")).toBe(true);
  expect(integrated?.nextIndex).toBe(0);
  expect(integrated?.submittedAttemptIds).toEqual([]);

  await page.reload();
  await expect(page).toHaveURL(/\/mastery\/session\?focus=FND-01$/);
  await expect(page.locator("main")).toContainText(/ПРАКТИКА|ВЫБРАННЫЙ ФОКУС/);

  await page.goto("/mastery/improve");
  await expect(page.locator('[data-improve-section="active-round"]')).toBeVisible();
  const continuityBeforeBrowse = JSON.stringify((await learnerState(page))._practicalProfile?.studyWorkspace?.continuity?.integrated);
  await manual.getByRole("button", { name: "Префлоп", exact: true }).click();
  const continuityAfterBrowse = JSON.stringify((await learnerState(page))._practicalProfile?.studyWorkspace?.continuity?.integrated);
  expect(continuityAfterBrowse).toBe(continuityBeforeBrowse);
});

test("unavailable manual exact focus writes nothing and does not substitute an outside recommendation", async ({ page }) => {
  await page.goto("/mastery/improve");
  const before = await learnerStateJson(page);
  await page.locator('[data-improve-section="manual-topics"]').getByRole("button", { name: "Префлоп", exact: true }).click();
  await expect(page.locator('[data-manual-resolution="no-eligible"]')).toBeVisible();
  await expect(page.locator('[data-manual-resolution="no-eligible"]')).toContainText(/Другая тема не будет подставлена автоматически/i);
  expect(await learnerStateJson(page)).toBe(before);
  await expect(page).toHaveURL(/\/mastery\/improve$/);
});

test("exact Table Reading fails closed instead of falling back to generic practice", async ({ page }) => {
  await page.goto("/mastery/perception?focus=BL-11");
  await expect(page.locator('[data-perceptual-focus-state="unavailable"]')).toBeVisible();
  await expect(page.locator('[data-perceptual-focus-state="unavailable"]')).toContainText(/не будет заменён общим режимом или другой темой/i);
  await expect(page.getByRole("link", { name: /Вернуться к улучшению/i })).toHaveAttribute("href", "/mastery/improve");
  await expect(page.getByRole("link", { name: /Первый круг/i })).toHaveCount(0);
});

test("RU/EN changes presentation only while manual exact resolution and durable learner state remain stable", async ({ page }) => {
  await teachFnd01(page);
  await page.goto("/mastery/improve");
  const manual = page.locator('[data-improve-section="manual-topics"]');
  await manual.getByRole("button", { name: "База решений", exact: true }).click();
  await expect(page.locator('[data-manual-resolution="exact-focus"]')).toBeVisible();
  const before = await learnerStateJson(page);

  await page.locator("main .mode-switch").getByRole("button", { name: "EN", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Choose what to improve next/i })).toBeVisible();
  await expect(page.locator('[data-manual-resolution="exact-focus"]')).toBeVisible();
  const after = await learnerStateJson(page);
  expect(after).toBe(before);
});

for (const viewport of [
  { width: 360, height: 800, name: "360" },
  { width: 390, height: 844, name: "390" },
  { width: 430, height: 932, name: "430" },
  { width: 844, height: 390, name: "mobile-landscape" },
]) {
  test(`Improve remains usable without horizontal overflow at ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize({ width: viewport.width, height: viewport.height });
    await page.goto("/mastery/improve");
    await expect(page.locator("main")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(1);
    const manualButtons = page.locator('[data-improve-section="manual-topics"] button');
    await expect(manualButtons.first()).toBeVisible();
    const box = await manualButtons.first().boundingBox();
    expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
  });
}
