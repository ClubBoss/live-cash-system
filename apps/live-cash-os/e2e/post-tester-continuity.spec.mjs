import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";
const ORIGIN_KEY = "live-cash-os:ui-session-origin:v1";
const DRAFT_KEY = "live-cash-os:real-hand-draft:v1";

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
      const value = JSON.parse(localStorage.getItem(key) ?? "null");
      return value?.origin === origin && typeof value?.sessionStartedAt === "string" && value.sessionStartedAt.length > 0;
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
  await page.getByRole("button", { name: /^Продолжить/ }).click();
}

async function openField(page) {
  await page.locator(".tabs button").nth(5).click();
  await expect(page.locator(".field-form")).toBeVisible();
  await expect(page.getByTestId("real-hand-draft-tools")).toBeVisible();
}

function draftField(page, key) {
  return page.locator(`[data-wave-b-draft-field="${key}"]`);
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

  await page.locator(".tabs button").nth(2).click();
  await expect(page.locator(".queue article")).toHaveCount(1);
  await page.locator(".queue article button.primary").first().click();
  await expect(page.locator("main .session")).toBeVisible();
  await waitForBoundOrigin(page, "review");

  await page.reload();
  await expect(page.locator("main .session")).toBeVisible();
  await finishCurrentDecision(page);

  await expect(page.locator(".tabs button").nth(2)).toHaveAttribute("aria-current", "page");
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

  await expect(page.locator(".tabs button").nth(0)).toHaveAttribute("aria-current", "page");
  await expect(page.locator(".today-card")).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), ORIGIN_KEY)).toBeNull();
});

test("manual Learn clears stale Today or Review origin before starting unrelated work", async ({ page }) => {
  await page.locator(".tabs button").nth(1).click();
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({
    version: 1,
    origin: "review",
    createdAt: Date.now(),
    sessionStartedAt: "stale-session",
    mode: "repair",
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
  await expect(page.locator(".tabs button").nth(3)).toHaveAttribute("aria-current", "page");
  await expect(page.locator("main .session")).toHaveCount(0);
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
    return draft?.values?.stakes;
  }, DRAFT_KEY)).toBe("2/5");

  await page.locator(".tabs button").nth(0).click();
  await openField(page);
  await expect(draftField(page, "stakes")).toHaveValue("2/5");
  await expect(draftField(page, "actionSequence")).toHaveValue("BTN opens to $15, BB calls.");

  await page.reload();
  await page.locator(".tabs button").nth(5).click();
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

test("successful Real Hand lock saves exactly once and clears the local draft", async ({ page }) => {
  await openField(page);
  const beforeCount = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY);
  await fillCompleteHand(page);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key) !== null, DRAFT_KEY)).toBe(true);

  const lock = page.getByRole("button", { name: "Зафиксировать решение", exact: true });
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
});

test("malformed and stale Real Hand drafts fail safe without creating evidence", async ({ page }) => {
  const beforeCount = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY);
  await page.evaluate((key) => localStorage.setItem(key, "{not-json"), DRAFT_KEY);
  await openField(page);
  await expect(page.locator(".field-form")).toBeVisible();
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();

  await page.locator(".tabs button").nth(0).click();
  await page.evaluate((key) => localStorage.setItem(key, JSON.stringify({ version: 1, updatedAt: 0, values: {} })), DRAFT_KEY);
  await openField(page);
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), DRAFT_KEY)).toBeNull();
  expect(await page.evaluate((key) => JSON.parse(localStorage.getItem(key)).fieldNotes.length, LEARNER_KEY)).toBe(beforeCount);
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
