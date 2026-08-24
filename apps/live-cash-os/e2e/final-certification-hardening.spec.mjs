import { expect, test } from "@playwright/test";

const LEARNER_KEY = "live-cash-os:learner-state";

async function learnerState(page) {
  await expect.poll(async () => page.evaluate((key) => localStorage.getItem(key), LEARNER_KEY)).not.toBeNull();
  return page.evaluate((key) => JSON.parse(localStorage.getItem(key)), LEARNER_KEY);
}

async function masterySnapshot(page) {
  return page.evaluate((key) => {
    const root = JSON.parse(localStorage.getItem(key));
    const mastery = root?._practicalProfile?.mastery;
    return {
      revision: mastery?.revision ?? null,
      attempts: (mastery?.attempts ?? []).map((attempt) => ({
        decisionId: attempt.decisionId,
        actionId: attempt.actionId,
        reasonId: attempt.reasonId,
        correct: attempt.correct,
      })),
      skills: Object.fromEntries(Object.entries(mastery?.skills ?? {}).map(([skillId, progress]) => [skillId, {
        evidenceStage: progress.evidenceStage,
        distinctDecisionIds: [...(progress.distinctDecisionIds ?? [])],
        delayedRetrievalPassed: progress.delayedRetrievalPassed,
        realHandTransferCount: progress.realHandTransferCount,
      }])),
    };
  }, LEARNER_KEY);
}

async function fillSupportHand(page) {
  await page.getByLabel("Связанная тема").selectOption("geometry");
  await page.getByLabel("Лимиты").fill("2/5");
  await page.getByLabel("Позиция Hero").fill("BB");
  await page.getByLabel("Позиции релевантных соперников").fill("BTN");
  await page.getByLabel("Эффективные стеки").fill("150bb");
  await page.getByLabel("Страддл / без страддла").fill("без страддла");
  await page.getByLabel("Последовательность действий").fill("BTN opens 3bb, BB calls; flop BTN bets 25%");
  await page.getByLabel("Борд (для префлопа: preflop)").fill("Qh 7d 4c");
  await page.getByLabel("Сайзинги").fill("3bb preflop; 25% flop");
  await page.getByLabel(/^Что заметил(?: до решения)?$/).fill("BTN uses a small wide flop bet");
  await page.getByLabel("Как сыграл").fill("Call");
  await page.getByLabel("Почему — до результата").fill("I noticed an automatic continuation-bet assumption before seeing the result.");
}

async function completeDiagnostic(page) {
  await page.getByRole("button", { name: "Начать диагностику" }).click();
  for (let spot = 1; spot <= 10; spot += 1) {
    await expect(page.getByText(`Ситуация ${spot}`, { exact: true })).toBeVisible();
    const sets = page.locator("fieldset.answer-set");
    await sets.nth(0).getByRole("button").first().click();
    await sets.nth(1).getByRole("button").first().click();
    await page.getByRole("button", { name: "Зафиксировать ответ" }).click();
  }
  await expect(page.getByText("ДИАГНОСТИКА · ФИДБЕК", { exact: true })).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local final hardening fixture" }) });
  });
});

test("A01 pre-submit DOM and persisted learner state expose no keyed answer authority", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере/ }).click();
  await page.goto("/mastery/session");

  const decision = page.locator("[data-practical-decision-id]").first();
  await expect(decision).toBeVisible();
  const preSubmitDom = await decision.evaluate((node) => node.outerHTML);
  expect(preSubmitDom).not.toContain("correctActionId");
  expect(preSubmitDom).not.toContain("correctReasonId");
  expect(preSubmitDom).not.toContain("data-practical-correct-answer");
  await expect(decision.getByText(/Правильное действие:|Correct action:/)).toHaveCount(0);
  await expect(decision.getByText(/Правильная причина:|Correct reason:/)).toHaveCount(0);

  const persistedBeforeSubmit = await page.evaluate((key) => localStorage.getItem(key) ?? "", LEARNER_KEY);
  expect(persistedBeforeSubmit).not.toContain("correctActionId");
  expect(persistedBeforeSubmit).not.toContain("correctReasonId");
});

test("A05-P Practical continuity preserves one submitted attempt across reload and re-entry", async ({ page }) => {
  await page.goto("/mastery/journey");
  await page.getByRole("button", { name: /Проверить на примере/ }).click();
  await page.goto("/mastery/session");

  const decision = page.locator("[data-practical-decision-id]").first();
  await expect(decision).toBeVisible();
  await decision.locator("fieldset").nth(0).locator('input[type="radio"]').first().check();
  await decision.locator("fieldset").nth(1).locator('input[type="radio"]').first().check();
  await decision.getByRole("button", { name: "Ответить" }).click();
  await expect(decision.getByRole("heading", { name: /Верно|Нужно исправить/ })).toBeVisible();

  const afterSubmit = await masterySnapshot(page);
  expect(afterSubmit.attempts.length).toBeGreaterThan(0);
  await page.reload();
  expect(await masterySnapshot(page)).toEqual(afterSubmit);
  await page.goto("/mastery");
  await page.goto("/mastery/session");
  expect(await masterySnapshot(page)).toEqual(afterSubmit);
});

test("A05-F Real Hands binding survives reload without duplicate evidence or a second queue", async ({ page }) => {
  await page.goto("/tools?tab=field");
  await expect(page.getByText("РЕАЛЬНЫЕ РАЗДАЧИ", { exact: true })).toBeVisible();
  const masteryBefore = await masterySnapshot(page);
  await fillSupportHand(page);
  await page.getByRole("button", { name: "Зафиксировать решение" }).click();

  let root = await learnerState(page);
  const note = root.fieldNotes.at(-1);
  expect(note).toBeTruthy();
  const noteId = note.id;
  const reviewQueueBefore = JSON.stringify(root.reviewQueue ?? []);
  const card = page.locator(".field-list article").filter({ hasText: "I noticed an automatic continuation-bet assumption" }).first();
  await card.getByLabel(`Как выполнен разбор ${noteId}`).selectOption("HUMAN_ASSISTED");

  const binding = card.getByTestId("real-hand-canonical-binding");
  await binding.getByTestId("real-hand-signal-automaticCbetIssue").check();
  const topicSelect = binding.getByTestId("real-hand-practical-skill");
  await expect(topicSelect).toBeVisible();
  const visibleOptions = await topicSelect.locator("option").allTextContents();
  expect(visibleOptions.join(" ")).not.toMatch(/W4-BOARD-01|OOP-01/);
  await expect(binding).not.toContainText(/Canonical Practical|authoritative Practical|focused repair|transfer evidence|exact canonical skill/i);
  await expect(binding).not.toContainText(/W4-BOARD-01|OOP-01/);
  await topicSelect.selectOption("W4-BOARD-01");
  await card.getByLabel(new RegExp(`Разбор ${noteId}`)).fill("Разбор подтвердил автоматический c-bet как конкретную причину ошибки.");
  await card.getByRole("button", { name: "Нужна практика", exact: true }).click();

  root = await learnerState(page);
  let reviewed = root.fieldNotes.find((item) => item.id === noteId);
  expect(reviewed.practicalBinding.practicalSkillId).toBe("W4-BOARD-01");
  expect(reviewed.practicalBinding.signals.automaticCbetIssue).toBe(true);
  expect(JSON.stringify(root.reviewQueue ?? [])).toBe(reviewQueueBefore);
  expect(await masterySnapshot(page)).toEqual(masteryBefore);

  await page.reload();
  root = await learnerState(page);
  reviewed = root.fieldNotes.find((item) => item.id === noteId);
  expect(reviewed.practicalBinding.practicalSkillId).toBe("W4-BOARD-01");
  expect(reviewed.practicalBinding.signals.automaticCbetIssue).toBe(true);
  expect(JSON.stringify(root.reviewQueue ?? [])).toBe(reviewQueueBefore);
  expect(await masterySnapshot(page)).toEqual(masteryBefore);
});

test("A05-D support history and Diagnostic generic continuation preserve Practical mastery", async ({ page }) => {
  await page.goto("/tools?tab=field");
  await expect(page.getByText("РЕАЛЬНЫЕ РАЗДАЧИ", { exact: true })).toBeVisible();

  const toolsNav = page.getByRole("navigation", { name: "Инструменты" });
  await toolsNav.getByRole("button", { name: "Диагностика", exact: true }).click();
  await expect(page).toHaveURL(/[?&]tab=diagnostic(?:&|$)/);
  await page.goBack();
  await expect(page).toHaveURL(/[?&]tab=field(?:&|$)/);
  await expect(page.getByText("РЕАЛЬНЫЕ РАЗДАЧИ", { exact: true })).toBeVisible();
  await page.goForward();
  await expect(page).toHaveURL(/[?&]tab=diagnostic(?:&|$)/);
  await expect(page.getByText("СТАРТОВАЯ ДИАГНОСТИКА", { exact: true })).toBeVisible();

  const beforeDiagnostic = await masterySnapshot(page);
  await completeDiagnostic(page);
  await page.getByRole("button", { name: "Перейти в Practical" }).click();
  await expect(page).toHaveURL(/\/mastery\/journey$/);
  expect(await masterySnapshot(page)).toEqual(beforeDiagnostic);
});
