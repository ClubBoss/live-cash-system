import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const PROFILE_KEY = "live-cash-os:portable-profile-code";
const PROFILE_PREFIX = `${LEARNER_KEY}:profile:`;
const PROFILE = "LCO-TEST-OVERLAYPROFILE1234567890";

async function disableCloud(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function attachProfile(page) {
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY)).not.toBeNull();
  await page.evaluate(({ profileKey, profile }) => localStorage.setItem(profileKey, profile), { profileKey: PROFILE_KEY, profile: PROFILE });
  await page.reload();
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  await expect.poll(async () => page.evaluate((prefix) => Object.keys(localStorage).filter((key) => key.startsWith(prefix)).length, PROFILE_PREFIX)).toBe(1);
  return page.evaluate((prefix) => Object.keys(localStorage).find((key) => key.startsWith(prefix)), PROFILE_PREFIX);
}

async function seedScopedLessonWithStaleLegacy(page, scopedKey, step) {
  await page.evaluate(({ learnerKey, scopedKey, step }) => {
    const scoped = JSON.parse(localStorage.getItem(scopedKey));
    const now = new Date().toISOString();
    scoped.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step,
      drillIds: ["geo-01", "geo-02", "geo-04"],
      currentIndex: step >= 6 ? 2 : step >= 2 ? 1 : 0,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: now,
      itemStartedAt: now,
      explainBack: "",
    };
    scoped.revision += 1;
    scoped.updatedAt = now;
    localStorage.setItem(scopedKey, JSON.stringify(scoped));

    const staleLegacy = structuredClone(scoped);
    staleLegacy.activeSession = null;
    staleLegacy.revision += 1000;
    staleLegacy.updatedAt = now;
    localStorage.setItem(learnerKey, JSON.stringify(staleLegacy));
  }, { learnerKey: LEARNER_KEY, scopedKey, step });
  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
}

test("profile-scoped lesson state drives RealUse, Gauntlet and Wave5 overlays despite stale legacy state", async ({ page }) => {
  await disableCloud(page);
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
  const scopedKey = await attachProfile(page);
  expect(scopedKey).toBeTruthy();

  await seedScopedLessonWithStaleLegacy(page, scopedKey, 1);
  await expect(page.locator("[data-novice-scaffold='geometry']")).toBeVisible();

  await seedScopedLessonWithStaleLegacy(page, scopedKey, 3);
  await expect(page.locator(".g4-ordering")).toBeVisible();

  await seedScopedLessonWithStaleLegacy(page, scopedKey, 5);
  await expect(page.locator("[data-wave5-lab-module='geometry']")).toBeVisible();

  const legacyStillContradictsScoped = await page.evaluate(({ learnerKey, scopedKey }) => {
    const legacy = JSON.parse(localStorage.getItem(learnerKey));
    const scoped = JSON.parse(localStorage.getItem(scopedKey));
    return legacy.activeSession === null && scoped.activeSession?.mode === "lesson" && scoped.activeSession?.step === 5;
  }, { learnerKey: LEARNER_KEY, scopedKey });
  expect(legacyStillContradictsScoped).toBe(true);
});
