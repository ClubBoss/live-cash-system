import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const DRAFT_KEY = "live-cash-os:real-hand-draft:v1";
const PROFILE_KEY = "live-cash-os:portable-profile-code";
const LOCALE_KEY = "live-cash-os:locale";

const emptyCapture = () => ({
  moduleId: "",
  stakes: "",
  heroPosition: "",
  villainPositions: "",
  effectiveStacks: "",
  straddle: "",
  actionSequence: "",
  board: "",
  sizings: "",
  cue: "",
  action: "",
  reason: "",
  confidence: 65,
  populationRead: "",
  populationReadConfidence: 50,
});

const emptyPostCapture = () => ({
  resultByNoteId: {},
  showdownByNoteId: {},
  reviewNoteByNoteId: {},
  reviewerKindByNoteId: {},
  practicalBindingByNoteId: {},
  explainReviewByRecordId: {},
});

async function localOnly(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({
      status: 401,
      contentType: "application/json",
      body: JSON.stringify({ error: "V7 C local continuity fixture" }),
    });
  });
}

async function learnerState(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  }, LEARNER_KEY);
}

async function learnerRaw(page) {
  return page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY);
}

async function draftValue(page) {
  return page.evaluate((key) => {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw).value : null;
  }, DRAFT_KEY);
}

async function waitForLearnerBootstrap(page) {
  await expect.poll(async () => learnerRaw(page)).not.toBeNull();
}

async function waitForLocalCanonical(page, predicate) {
  await expect.poll(async () => predicate(await learnerState(page))).toBe(true);
}

function resultDraftBox(page) {
  return page.locator(".w7-result textarea").nth(0);
}

function showdownDraftBox(page) {
  return page.locator(".w7-result textarea").nth(1);
}

async function createOneRealHand(page) {
  await page.getByTestId("real-hand-moduleId").selectOption({ index: 1 });
  await page.getByTestId("real-hand-stakes").fill("2/5");
  await page.getByTestId("real-hand-heroPosition").fill("BTN");
  await page.getByTestId("real-hand-villainPositions").fill("BB");
  await page.getByTestId("real-hand-effectiveStacks").fill("150bb");
  await page.getByTestId("real-hand-straddle").fill("none");
  await page.getByTestId("real-hand-actionSequence").fill("BTN opens, BB calls");
  await page.getByTestId("real-hand-board").fill("Qh 7d 4c");
  await page.getByTestId("real-hand-sizings").fill("3bb");
  await page.getByTestId("real-hand-cue").fill("BB called preflop");
  await page.getByTestId("real-hand-action").fill("check back");
  await page.getByTestId("real-hand-reason").fill("preserve showdown value");
  await page.getByRole("button", { name: "Lock the decision", exact: false }).click();
  await expect(page.getByText("Decision locked before the result", { exact: false })).toBeVisible();
  await waitForLocalCanonical(page, (state) => Array.isArray(state?.fieldNotes) && state.fieldNotes.length === 1);
}

test.beforeEach(async ({ page }) => {
  await localOnly(page);
  await page.addInitScript(({ learnerKey, draftKey, profileKey, localeKey }) => {
    if (sessionStorage.getItem("v7-c-fixture-initialized") === "1") return;
    localStorage.removeItem(learnerKey);
    localStorage.removeItem(draftKey);
    localStorage.removeItem(profileKey);
    localStorage.setItem(localeKey, "en");
    sessionStorage.setItem("v7-c-fixture-initialized", "1");
  }, { learnerKey: LEARNER_KEY, draftKey: DRAFT_KEY, profileKey: PROFILE_KEY, localeKey: LOCALE_KEY });
});

test("V7-C preserves all post-capture drafts, survives a failed save, and clears only after durable canonical mutation", async ({ page }) => {
  await page.goto("/tools?tab=field");
  await createOneRealHand(page);

  const captured = await learnerState(page);
  const noteId = captured.fieldNotes.at(-1).id;
  const rawBeforeDrafts = await learnerRaw(page);

  await resultDraftBox(page).fill("Won $240");
  await showdownDraftBox(page).fill("AhKh");

  const reviewer = page.locator(`select[aria-label="How this was reviewed ${noteId}"]`);
  const reviewBox = page.locator(`textarea[aria-label="Review ${noteId}"]`);
  await reviewer.selectOption("HUMAN");
  await reviewBox.fill("Human review draft: verify blind-price mechanism.");
  await page.getByTestId("real-hand-signal-street").selectOption("preflop");
  await page.getByTestId("real-hand-signal-blindIssue").check();

  const workspaceBeforeLeave = await draftValue(page);
  expect(workspaceBeforeLeave.postCapture.resultByNoteId[noteId]).toBe("Won $240");
  expect(workspaceBeforeLeave.postCapture.showdownByNoteId[noteId]).toBe("AhKh");
  expect(workspaceBeforeLeave.postCapture.reviewNoteByNoteId[noteId]).toContain("Human review draft");
  expect(workspaceBeforeLeave.postCapture.reviewerKindByNoteId[noteId]).toBe("HUMAN");
  expect(workspaceBeforeLeave.postCapture.practicalBindingByNoteId[noteId].signals.blindIssue).toBe(true);
  expect(await learnerRaw(page)).toBe(rawBeforeDrafts);

  await page.goto("/tools?tab=data");
  await waitForLocalCanonical(page, (state) => state?.fieldNotes?.some((note) => note.id === noteId) === true);
  expect((await draftValue(page))?.postCapture?.resultByNoteId?.[noteId]).toBe("Won $240");

  await page.goto("/tools?tab=field");
  await expect(page).toHaveURL(/tab=field/);
  await waitForLocalCanonical(page, (state) => state?.fieldNotes?.some((note) => note.id === noteId) === true);
  expect((await draftValue(page))?.postCapture?.resultByNoteId?.[noteId]).toBe("Won $240");
  await expect(page.getByText("Decision locked before the result", { exact: false })).toBeVisible();
  await expect(resultDraftBox(page)).toHaveValue("Won $240");
  await expect(showdownDraftBox(page)).toHaveValue("AhKh");
  await expect(page.locator(`textarea[aria-label="Review ${noteId}"]`)).toHaveValue(/Human review draft/);
  await expect(page.locator(`select[aria-label="How this was reviewed ${noteId}"]`)).toHaveValue("HUMAN");
  await expect(page.getByTestId("real-hand-signal-blindIssue")).toBeChecked();

  await page.reload();
  await expect(resultDraftBox(page)).toHaveValue("Won $240");
  await expect(showdownDraftBox(page)).toHaveValue("AhKh");
  await expect(page.locator(`textarea[aria-label="Review ${noteId}"]`)).toHaveValue(/Human review draft/);

  await page.evaluate((learnerKey) => {
    const nativeSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function patchedSetItem(key, value) {
      if (String(key) === learnerKey) throw new Error("V7 C intentional learner-state write failure");
      return nativeSetItem.call(this, key, value);
    };
  }, LEARNER_KEY);

  await page.getByRole("button", { name: "Add result", exact: true }).click();
  await page.waitForTimeout(500);
  const failedCanonical = await learnerState(page);
  expect(failedCanonical.fieldNotes.find((note) => note.id === noteId).result).toBeUndefined();

  await page.reload();
  await expect(resultDraftBox(page)).toHaveValue("Won $240");
  await expect(showdownDraftBox(page)).toHaveValue("AhKh");
  expect((await draftValue(page)).postCapture.resultByNoteId[noteId]).toBe("Won $240");

  await page.getByRole("button", { name: "Add result", exact: true }).click();
  await waitForLocalCanonical(page, (state) => state.fieldNotes.find((note) => note.id === noteId)?.result === "Won $240");
  await expect.poll(async () => {
    const workspace = await draftValue(page);
    return workspace?.postCapture?.resultByNoteId?.[noteId] ?? null;
  }).toBe(null);
  const reviewWorkspace = await draftValue(page);
  expect(reviewWorkspace.postCapture.reviewNoteByNoteId[noteId]).toContain("Human review draft");
  expect(reviewWorkspace.postCapture.reviewerKindByNoteId[noteId]).toBe("HUMAN");
  expect(reviewWorkspace.postCapture.practicalBindingByNoteId[noteId].signals.blindIssue).toBe(true);

  await expect(page.locator(`textarea[aria-label="Review ${noteId}"]`)).toHaveValue(/Human review draft/);
  await page.getByRole("button", { name: "Finish review", exact: true }).click();
  await waitForLocalCanonical(page, (state) => {
    const note = state.fieldNotes.find((row) => row.id === noteId);
    return note?.status === "REVIEWED_VALID" && note?.reviewerKind === "HUMAN";
  });
  await expect.poll(async () => {
    const workspace = await draftValue(page);
    return workspace?.postCapture?.reviewNoteByNoteId?.[noteId] ?? null;
  }).toBe(null);

  const reviewed = await learnerState(page);
  expect(reviewed.fieldNotes.filter((note) => note.id === noteId)).toHaveLength(1);
  const evidenceSnapshot = JSON.stringify({
    fieldNotes: reviewed.fieldNotes,
    interactions: reviewed.interactions,
    reviewQueue: reviewed.reviewQueue,
    practicalProfile: reviewed.practicalProfile ?? null,
  });
  await page.reload();
  const afterReload = await learnerState(page);
  expect(afterReload.fieldNotes.filter((note) => note.id === noteId)).toHaveLength(1);
  expect(JSON.stringify({
    fieldNotes: afterReload.fieldNotes,
    interactions: afterReload.interactions,
    reviewQueue: afterReload.reviewQueue,
    practicalProfile: afterReload.practicalProfile ?? null,
  })).toBe(evidenceSnapshot);
});

test("V7-C preserves explain-back review notes and fails stale, incompatible, and cross-profile drafts closed", async ({ page }) => {
  await page.goto("/tools?tab=field");
  await waitForLearnerBootstrap(page);
  const state = await learnerState(page);
  const now = new Date().toISOString();
  state.explainBackRecords = [{
    id: "explain-v7-c-semantic-record",
    at: now,
    moduleId: "geometry",
    promptKey: "v7-c-fixture",
    text: "I would explain the decision from the cue before the result.",
    status: "PENDING_REVIEW",
    reviewerNote: "",
  }];
  state.revision += 1;
  state.updatedAt = now;
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: LEARNER_KEY, value: state });
  await page.reload();

  const explainBox = page.locator('textarea[aria-label="Review explain-v7-c-semantic-record"]');
  await explainBox.fill("Explain-back review draft survives navigation.");
  const rawBeforeSubmit = await learnerRaw(page);
  expect((await draftValue(page)).postCapture.explainReviewByRecordId["explain-v7-c-semantic-record"]).toContain("survives navigation");

  await page.goto("/tools?tab=data");
  await page.goto("/tools?tab=field");
  await expect(page.locator('textarea[aria-label="Review explain-v7-c-semantic-record"]')).toHaveValue(/survives navigation/);
  expect(await learnerRaw(page)).toBe(rawBeforeSubmit);

  await page.reload();
  await expect(page.locator('textarea[aria-label="Review explain-v7-c-semantic-record"]')).toHaveValue(/survives navigation/);
  await page.getByRole("button", { name: "Finish review", exact: true }).click();
  await waitForLocalCanonical(page, (next) => next.explainBackRecords?.[0]?.status === "REVIEWED_OK");
  await expect.poll(async () => {
    const workspace = await draftValue(page);
    return workspace?.postCapture?.explainReviewByRecordId?.["explain-v7-c-semantic-record"] ?? null;
  }).toBe(null);

  await page.evaluate(({ draftKey, capture, postCapture }) => {
    postCapture.resultByNoteId["field-stale-v7-c"] = "stale result";
    localStorage.setItem(draftKey, JSON.stringify({
      version: 1,
      profileMarker: "local",
      updatedAt: Date.now(),
      value: { version: 2, capture, postCapture },
    }));
  }, { draftKey: DRAFT_KEY, capture: emptyCapture(), postCapture: emptyPostCapture() });
  await page.reload();
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBe(null);

  await page.evaluate(({ draftKey }) => {
    localStorage.setItem(draftKey, JSON.stringify({
      version: 1,
      profileMarker: "local",
      updatedAt: Date.now(),
      value: { version: 999, capture: {}, postCapture: {} },
    }));
  }, { draftKey: DRAFT_KEY });
  await page.reload();
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBe(null);

  await page.evaluate(({ profileKey, draftKey, capture, postCapture }) => {
    localStorage.setItem(profileKey, "LCO-AAAAAAAAAAAAAAAAAAAA");
    capture.stakes = "secret-A";
    localStorage.setItem(draftKey, JSON.stringify({
      version: 1,
      profileMarker: "p-deadbeefdeadbeef",
      updatedAt: Date.now(),
      value: { version: 2, capture, postCapture },
    }));
  }, { profileKey: PROFILE_KEY, draftKey: DRAFT_KEY, capture: emptyCapture(), postCapture: emptyPostCapture() });
  await page.reload();
  await expect(page.getByTestId("real-hand-stakes")).toHaveValue("");
  expect(await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBe(null);
});
