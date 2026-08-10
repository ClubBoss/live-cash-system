import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const PROFILE_KEY = "live-cash-os:portable-profile-code";
const ORIGIN_KEY = "live-cash-os:ui-session-origin:v1";
const DRAFT_KEY = "live-cash-os:real-hand-draft:v1";
const PROFILE_A = "LCO-AAAAAAAAAAAAAAAAAAAA";
const PROFILE_B = "LCO-BBBBBBBBBBBBBBBBBBBB";

async function disableCloud(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
}

async function seedDueRepair(page, id) {
  await page.evaluate(({ key, reviewId }) => {
    const state = JSON.parse(localStorage.getItem(key));
    const now = new Date().toISOString();
    state.activeSession = null;
    state.modules.geometry.contentCompleted = true;
    state.reviewQueue = state.reviewQueue.filter((item) => item.id !== reviewId);
    state.reviewQueue.push({
      id: reviewId,
      moduleId: "geometry",
      sourceDrillId: "geo-01",
      variantGroup: "geometry-wave-b",
      kind: "repair",
      dueAt: now,
      attempts: 0,
      sourceInteractionId: `interaction-${reviewId}`,
    });
    state.revision += 1;
    state.updatedAt = now;
    localStorage.setItem(key, JSON.stringify(state));
  }, { key: LEARNER_KEY, reviewId: id });
}

async function waitForBoundOrigin(page, expectedOrigin) {
  await expect.poll(async () => page.evaluate(({ key, origin }) => {
    try {
      const envelope = JSON.parse(localStorage.getItem(key) ?? "null");
      const value = envelope?.value;
      return envelope?.version === 1
        && typeof envelope?.profileMarker === "string"
        && value?.origin === origin
        && typeof value?.sessionStartedAt === "string"
        && value.sessionStartedAt.length > 0
        && typeof value?.mode === "string";
    } catch {
      return false;
    }
  }, { key: ORIGIN_KEY, origin: expectedOrigin })).toBe(true);
}

async function finishCurrentDecision(page) {
  const answerSets = page.locator("main .session .answer-set");
  await expect(answerSets).toHaveCount(2);
  await answerSets.nth(0).locator("button").first().click();
  await answerSets.nth(1).locator("button").first().click();
  await page.getByRole("button", { name: /^Ответить/ }).click();
  const continueButton = page.locator(".g4-feedback-card > button.primary");
  await expect(continueButton).toBeVisible();
  await continueButton.click();
}

async function openField(page) {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await expect(page.locator(".field-form")).toBeVisible();
  await expect(page.getByTestId("real-hand-draft-tools")).toBeVisible();
}

function draftField(page, key) {
  return page.getByTestId(`real-hand-${key}`);
}

async function fillCompleteHand(page) {
  await draftField(page, "moduleId").selectOption("geometry");
  await draftField(page, "stakes").fill("2/5");
  await draftField(page, "heroPosition").fill("BTN");
  await draftField(page, "villainPositions").fill("BB");
  await draftField(page, "effectiveStacks").fill("150bb");
  await draftField(page, "straddle").fill("none");
  await draftField(page, "actionSequence").fill("BTN opens to $15, BB calls; flop checks through.");
  await draftField(page, "board").fill("preflop -> Qh 7d 4c");
  await draftField(page, "sizings").fill("$15 preflop");
  await draftField(page, "cue").fill("BB called preflop; I noticed the effective stack before acting.");
  await draftField(page, "action").fill("Checked back.");
  await draftField(page, "reason").fill("Before the result, I wanted to record what I noticed and why I chose the action.");
}

test.beforeEach(async ({ page }) => {
  await disableCloud(page);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
});

test("Review item keeps its return destination across reload", async ({ page }) => {
  await seedDueRepair(page, "wave-b-review-origin");
  await page.reload();

  await page.getByRole("button", { name: "Повтор", exact: true }).click();
  await expect(page.locator(".queue article")).toHaveCount(1);
  await page.locator(".queue article button.primary").first().click();
  await expect(page.locator("main .session")).toBeVisible();
  await waitForBoundOrigin(page, "review");

  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
  await finishCurrentDecision(page);

  await expect(page.getByRole("button", { name: "Повтор", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".section-head").first()).toContainText(/Повтор|Review/);
  expect(await page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();
});

test("Today scheduled task keeps its return destination across reload", async ({ page }) => {
  await seedDueRepair(page, "wave-b-today-origin");
  await page.reload();

  const primary = page.locator(".today-card button.primary");
  await expect(primary).toBeEnabled();
  await primary.click();
  await expect(page.locator("main .session")).toBeVisible();
  await waitForBoundOrigin(page, "today");

  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
  await finishCurrentDecision(page);

  await expect(page.getByRole("button", { name: "Сегодня", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".today-card")).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();
});

test("manual Learn clears stale Today or Review origin before starting unrelated work", async ({ page }) => {
  await page.getByRole("button", { name: "Учиться", exact: true }).click();
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({
    version: 1,
    profileMarker: "local",
    updatedAt: Date.now(),
    value: {
      origin: "review",
      sessionStartedAt: "stale-session",
      mode: "repair",
    },
  })), ORIGIN_KEY);

  await page.locator(".module-list article button.primary").first().click();
  await expect(page.locator("main .session")).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();
});

test("Before Play repair still flows to Cards and does not acquire a return origin", async ({ page }) => {
  await seedDueRepair(page, "wave-b-warmup-repair");
  await page.reload();

  await page.locator(".quick-grid article").last().locator("button").click();
  await expect(page.locator("main .session")).toBeVisible();
  const active = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).activeSession, LEARNER_KEY);
  expect(active.mode).toBe("repair");
  expect(active.step).toBe(-1);
  expect(await page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();

  await finishCurrentDecision(page);
  await expect(page.getByRole("button", { name: "Карточки", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: /^Показать ответ/ })).toBeVisible();
  await expect.poll(async () => page.evaluate((key) => JSON.parse(localStorage.getItem(key)).activeSession, LEARNER_KEY)).toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();
});

test("partial Real Hand draft survives tab navigation and reload", async ({ page }, testInfo) => {
  await openField(page);
  await draftField(page, "moduleId").selectOption("geometry");
  await draftField(page, "stakes").fill("2/5");
  await draftField(page, "heroPosition").fill("BTN");
  await draftField(page, "actionSequence").fill("BTN opens to $15, BB calls.");
  await draftField(page, "reason").fill("Reason recorded before seeing the result.");

  await expect.poll(async () => page.evaluate((key) => {
    const draft = JSON.parse(localStorage.getItem(key) ?? "null");
    return draft?.value?.stakes;
  }, DRAFT_KEY)).toBe("2/5");

  await page.getByRole("button", { name: "Сегодня", exact: true }).click();
  await openField(page);
  await expect(draftField(page, "stakes")).toHaveValue("2/5");
  await expect(draftField(page, "actionSequence")).toHaveValue("BTN opens to $15, BB calls.");

  await page.reload();
  await openField(page);
  await expect(draftField(page, "moduleId")).toHaveValue("geometry");
  await expect(draftField(page, "stakes")).toHaveValue("2/5");
  await expect(draftField(page, "heroPosition")).toHaveValue("BTN");
  await expect(draftField(page, "reason")).toHaveValue("Reason recorded before seeing the result.");
  await page.screenshot({ path: testInfo.outputPath("real-hand-draft-restored.png"), fullPage: true });
});

test("incomplete Real Hand draft creates zero field evidence", async ({ page }) => {
  const before = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return {
      fieldNotes: state.fieldNotes,
      fieldTransfer: state.modules.geometry.evidence.field_transfer,
      moduleState: state.modules.geometry.state,
      interactions: state.interactions,
      revision: state.revision,
    };
  }, LEARNER_KEY);

  await openField(page);
  await draftField(page, "moduleId").selectOption("geometry");
  await draftField(page, "stakes").fill("2/5");
  await draftField(page, "cue").fill("A cue I noticed before acting.");
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key) !== null, DRAFT_KEY)).toBe(true);

  const after = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return {
      fieldNotes: state.fieldNotes,
      fieldTransfer: state.modules.geometry.evidence.field_transfer,
      moduleState: state.modules.geometry.state,
      interactions: state.interactions,
      revision: state.revision,
    };
  }, LEARNER_KEY);
  expect(after).toEqual(before);
});

test("successful Real Hand lock saves exactly once, acknowledges local persistence, then clears draft", async ({ page }) => {
  await openField(page);
  const beforeCount = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY);
  await fillCompleteHand(page);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key) !== null, DRAFT_KEY)).toBe(true);

  await page.evaluate(({ learnerKey, draftKey }) => {
    const originalSetItem = Storage.prototype.setItem;
    const originalRemoveItem = Storage.prototype.removeItem;
    window.__waveBStorageEvents = [];
    Storage.prototype.setItem = function setItem(key, value) {
      if (key === learnerKey) {
        const parsed = JSON.parse(String(value));
        window.__waveBStorageEvents.push({ kind: "learner-write", revision: parsed.revision, updatedAt: parsed.updatedAt });
      }
      return originalSetItem.call(this, key, value);
    };
    Storage.prototype.removeItem = function removeItem(key) {
      if (key === draftKey) window.__waveBStorageEvents.push({ kind: "draft-remove" });
      return originalRemoveItem.call(this, key);
    };
  }, { learnerKey: LEARNER_KEY, draftKey: DRAFT_KEY });

  const lock = page.getByRole("button", { name: /^Зафиксировать решение/ });
  await expect(lock).toBeEnabled();
  await lock.click();

  await expect.poll(async () => page.evaluate(({ key, count }) => JSON.parse(localStorage.getItem(key)).fieldNotes.length === count + 1, { key: LEARNER_KEY, count: beforeCount })).toBe(true);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
  await expect(draftField(page, "stakes")).toHaveValue("");

  const saved = await page.evaluate((key) => {
    const state = JSON.parse(localStorage.getItem(key));
    return { count: state.fieldNotes.length, note: state.fieldNotes.at(-1) };
  }, LEARNER_KEY);
  expect(saved.count).toBe(beforeCount + 1);
  expect(saved.note.stakes).toBe("2/5");
  expect(saved.note.heroPosition).toBe("BTN");
  expect(saved.note.reason).toBe("Before the result, I wanted to record what I noticed and why I chose the action.");

  const events = await page.evaluate(() => window.__waveBStorageEvents);
  const learnerWriteIndex = events.findIndex((event) => event.kind === "learner-write");
  const draftRemoveIndex = events.findIndex((event) => event.kind === "draft-remove");
  expect(learnerWriteIndex).toBeGreaterThanOrEqual(0);
  expect(draftRemoveIndex).toBeGreaterThan(learnerWriteIndex);
});

test("LOCAL_WRITE_FAILED keeps Real Hand draft recoverable without a persisted phantom note", async ({ page }) => {
  await openField(page);
  const beforeCount = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY);
  await fillCompleteHand(page);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key) !== null, DRAFT_KEY)).toBe(true);

  await page.evaluate(({ learnerKey, count }) => {
    const originalSetItem = Storage.prototype.setItem;
    window.__waveBOriginalSetItem = originalSetItem;
    Storage.prototype.setItem = function setItem(key, value) {
      if (key === learnerKey) {
        const parsed = JSON.parse(String(value));
        if (parsed.fieldNotes.length > count) throw new Error("wave-b-local-write-failure");
      }
      return originalSetItem.call(this, key, value);
    };
  }, { learnerKey: LEARNER_KEY, count: beforeCount });

  const lock = page.getByRole("button", { name: /^Зафиксировать решение/ });
  await lock.click();
  await expect(page.locator(".notice")).toContainText("Не удалось записать прогресс");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY)).toBe(beforeCount);
  expect(await page.evaluate((key) => localStorage.getItem(key) !== null, DRAFT_KEY)).toBe(true);
  await expect(lock).toBeDisabled();

  await page.evaluate(() => {
    Storage.prototype.setItem = window.__waveBOriginalSetItem;
    delete window.__waveBOriginalSetItem;
  });
  await page.reload();
  await openField(page);
  await expect(draftField(page, "stakes")).toHaveValue("2/5");
  await expect(draftField(page, "heroPosition")).toHaveValue("BTN");
  await expect(draftField(page, "reason")).toHaveValue("Before the result, I wanted to record what I noticed and why I chose the action.");
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY)).toBe(beforeCount);
});

test("malformed and stale Real Hand drafts fail safe without creating evidence", async ({ page }) => {
  const beforeCount = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY);
  await page.evaluate((key) => localStorage.setItem(key, "{not-json"), DRAFT_KEY);
  await openField(page);
  await expect(page.locator(".field-form")).toBeVisible();
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();

  await page.getByRole("button", { name: "Сегодня", exact: true }).click();
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, profileMarker: "local", updatedAt: 0, value: {} })), DRAFT_KEY);
  await openField(page);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY)).toBe(beforeCount);
});

test("Real Hand draft is isolated from a different portable profile", async ({ page }) => {
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: PROFILE_KEY, value: PROFILE_A });
  await page.reload();
  await openField(page);
  await draftField(page, "moduleId").selectOption("geometry");
  await draftField(page, "stakes").fill("5/10");
  await draftField(page, "reason").fill("Profile A draft only.");
  await expect.poll(async () => page.evaluate((key) => JSON.parse(localStorage.getItem(key) ?? "null")?.value?.stakes, DRAFT_KEY)).toBe("5/10");

  const storedA = await page.evaluate(({ draftKey, profile }) => {
    const raw = localStorage.getItem(draftKey) ?? "";
    return { marker: JSON.parse(raw).profileMarker, containsPlaintext: raw.includes(profile) };
  }, { draftKey: DRAFT_KEY, profile: PROFILE_A });
  expect(storedA.containsPlaintext).toBe(false);
  expect(storedA.marker).not.toBe(PROFILE_A);

  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: PROFILE_KEY, value: PROFILE_B });
  await page.reload();
  await openField(page);
  await expect(draftField(page, "stakes")).toHaveValue("");
  await expect(draftField(page, "reason")).toHaveValue("");
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
});

test("session return origin is ignored after portable profile identity changes", async ({ page }) => {
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: PROFILE_KEY, value: PROFILE_A });
  await seedDueRepair(page, "wave-b-origin-profile-a");
  await page.reload();

  await page.getByRole("button", { name: "Повтор", exact: true }).click();
  await page.locator(".queue article button.primary").first().click();
  await waitForBoundOrigin(page, "review");
  await page.evaluate(({ key, value }) => localStorage.setItem(key, value), { key: PROFILE_KEY, value: PROFILE_B });
  await page.reload();

  await expect(page.locator("main .session")).toBeVisible();
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();
  await finishCurrentDecision(page);
  await expect(page.getByRole("button", { name: "Повтор", exact: true })).not.toHaveAttribute("aria-current", "page");
});

test("Real Hand format example renders in RU and EN without populating the form", async ({ page }, testInfo) => {
  await openField(page);
  const beforeDraft = await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY);
  const example = page.getByTestId("real-hand-example");
  await expect(example.locator("summary")).toHaveText("Показать пример хорошо записанной руки");
  await example.locator("summary").click();
  await expect(example).toContainText("Это пример формата записи, а не оценка правильности линии.");
  await expect(example).toContainText("Лимиты: 2/5");
  await expect(example).toContainText("Позиции: Hero BTN, Villain BB");
  await expect(example).toContainText("Эффективный стек: 150bb");
  await expect(draftField(page, "stakes")).toHaveValue("");
  expect(await page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBe(beforeDraft);
  await page.screenshot({ path: testInfo.outputPath("real-hand-example-ru.png"), fullPage: true });

  await page.getByRole("button", { name: "EN", exact: true }).click();
  await expect(example.locator("summary")).toHaveText("Show an example of a well-recorded hand");
  await expect(example).toContainText("This is an example of recording format, not an assessment of whether the line is correct.");
  await expect(example).toContainText("Stakes: 2/5");
  await expect(example).toContainText("Effective stack: 150bb");
  await expect(draftField(page, "stakes")).toHaveValue("");
});
