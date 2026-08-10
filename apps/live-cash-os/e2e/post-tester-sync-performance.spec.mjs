import { expect, test } from "@playwright/test";

const PROFILE_KEY = "live-cash-os:portable-profile-code";
const LEARNER_KEY = "live-cash-os:learner-state";
const TEST_CODE = "LCO-BBBBBBBBBBBBBBBBBBBB";
const RUNTIME = { appVersion: "1.2.0", contentVersion: "2026.08-wave7-integrity", schemaVersion: 2 };

function stateApiController() {
  let remoteState = null;
  let getDelayMs = 0;
  let firstPostDelayMs = 0;
  let gets = 0;
  let posts = 0;
  const postBodies = [];
  let firstPostStartedResolve;
  const firstPostStarted = new Promise((resolve) => { firstPostStartedResolve = resolve; });
  let heldGetStartedResolve = null;
  let releaseHeldGetResolve = null;
  let heldGet = false;
  return {
    setRemoteState(value) { remoteState = value; },
    setGetDelay(ms) { getDelayMs = ms; },
    setFirstPostDelay(ms) { firstPostDelayMs = ms; },
    counts() { return { gets, posts }; },
    postBodies() { return postBodies; },
    firstPostStarted,
    holdNextGet() {
      heldGet = true;
      const started = new Promise((resolve) => { heldGetStartedResolve = resolve; });
      return { started, release() { releaseHeldGetResolve?.(); } };
    },
    async handle(route) {
      const method = route.request().method();
      if (method === "GET") {
        gets += 1;
        if (heldGet) {
          heldGet = false;
          heldGetStartedResolve?.();
          await new Promise((resolve) => { releaseHeldGetResolve = resolve; });
        }
        if (getDelayMs) await new Promise((resolve) => setTimeout(resolve, getDelayMs));
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ state: remoteState, cloudDeleted: false, cloudToken: remoteState ? `token-${remoteState.revision}` : null, revision: remoteState?.revision ?? 0, runtime: RUNTIME }) });
        return;
      }
      if (method === "POST") {
        posts += 1;
        const body = route.request().postDataJSON();
        postBodies.push(body);
        if (posts === 1) {
          firstPostStartedResolve();
          if (firstPostDelayMs) await new Promise((resolve) => setTimeout(resolve, firstPostDelayMs));
        }
        remoteState = body.state;
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ state: remoteState, cloudDeleted: false, cloudToken: `token-${remoteState.revision}`, revision: remoteState.revision, runtime: RUNTIME }) });
        return;
      }
      await route.fulfill({ status: 405, contentType: "application/json", body: "{}" });
    },
  };
}

async function readLocalState(page) {
  await expect.poll(() => page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY)).not.toBeNull();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), LEARNER_KEY);
}

async function seedStoredInvite(page, learner) {
  await page.addInitScript(({ profileKey, learnerKey, code, learner }) => {
    localStorage.setItem(profileKey, code);
    if (learner) localStorage.setItem(learnerKey, JSON.stringify(learner));
  }, { profileKey: PROFILE_KEY, learnerKey: LEARNER_KEY, code: TEST_CODE, learner });
}

test.describe("Post-tester Wave D authenticated bootstrap", () => {
  test.skip(process.env.LIVE_CASH_DEPLOY_TARGET !== "test-mirror", "Authenticated bootstrap coverage requires the test-mirror build flag.");
  test("stored tester code uses one delayed GET and reuses that payload for learner bootstrap", async ({ page }) => {
    const controller = stateApiController();
    controller.setGetDelay(300);
    await seedStoredInvite(page, null);
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    const local = await readLocalState(page);
    controller.setRemoteState(local);
    await page.waitForTimeout(900);
    expect(controller.counts()).toEqual({ gets: 1, posts: 0 });
    const beforeReload = controller.counts();
    await page.reload();
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await page.waitForTimeout(900);
    const afterReload = controller.counts();
    expect(afterReload.gets - beforeReload.gets).toBe(1);
    expect(afterReload.posts - beforeReload.posts).toBe(0);
  });
});

test.describe("Post-tester Wave D local-first reconcile and cloud-save ordering", () => {
  test.skip(process.env.LIVE_CASH_DEPLOY_TARGET === "test-mirror", "Regular build isolates local-first sync behavior from test-invite gate.");
  test("valid local state is usable while the cloud GET is still unresolved", async ({ page }) => {
    const controller = stateApiController();
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    const baseline = await readLocalState(page);
    controller.setRemoteState(baseline);
    const held = controller.holdNextGet();
    void page.reload();
    await held.started;
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await expect(page.locator("main.loading")).toHaveCount(0);
    expect((await readLocalState(page)).revision).toBe(baseline.revision);
    held.release();
    await expect(page.locator("header.topbar .sync")).toContainText(/сохран|saved|sync/i);
    await page.waitForTimeout(700);
    expect(controller.counts().posts).toBe(0);
  });

  test("a newer learner mutation queues behind a delayed POST and only the final state becomes synced", async ({ page }) => {
    const controller = stateApiController();
    await page.route("**/api/state", (route) => controller.handle(route));
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    const baseline = await readLocalState(page);
    controller.setRemoteState(baseline);
    await page.reload();
    await expect(page.getByRole("navigation", { name: "Основная навигация" })).toBeVisible();
    await page.waitForTimeout(700);
    expect(controller.counts().posts).toBe(0);
    controller.setFirstPostDelay(900);
    await page.getByRole("button", { name: "Учиться", exact: true }).click();
    await page.getByRole("button", { name: /^Изучить/ }).first().click();
    await controller.firstPostStarted;
    const action = page.getByRole("button", { name: "140 страддлов; отдельно отметить 280 обычных BB" });
    await action.click();
    await expect(action).toHaveAttribute("aria-pressed", "true");
    await expect.poll(() => controller.counts().posts, { timeout: 5_000 }).toBe(2);
    await expect.poll(async () => {
      const state = await readLocalState(page);
      const last = controller.postBodies().at(-1)?.state;
      return last?.revision === state.revision && last?.activeSession?.selectedActionId === state.activeSession?.selectedActionId;
    }).toBe(true);
    await expect(page.locator("header.topbar .sync")).toContainText(/сохран|saved|sync/i);
  });
});