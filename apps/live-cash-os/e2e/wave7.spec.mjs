import { expect, test } from "@playwright/test";

async function localState(page) {
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("live-cash-os:learner-state"))).not.toBeNull();
  return page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state")));
}

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/tools");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function fillHand(page) {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await page.getByLabel("Связанная тема").selectOption("geometry");
  await page.getByLabel("Лимиты").fill("2/5");
  await page.getByLabel("Позиция Hero").fill("BB");
  await page.getByLabel("Позиции релевантных соперников").fill("BTN");
  await page.getByLabel("Эффективные стеки").fill("150bb");
  await page.getByLabel("Страддл / без страддла").fill("без страддла");
  await page.getByLabel("Последовательность действий").fill("BTN opens 3bb, BB calls; flop BTN bets 25%");
  await page.getByLabel("Борд (для префлопа: preflop)").fill("Qh 7d 4c");
  await page.getByLabel("Сайзинги").fill("3bb preflop; 25% flop");
  await page.getByLabel("Что заметил").fill("BTN uses a small wide flop bet");
  await page.getByLabel("Как сыграл").fill("Call");
  await page.getByLabel("Почему — до результата").fill("Keep weaker hands in and avoid turning the hand into a raise without enough reason.");
}

async function bindCanonicalFlopMechanism(card) {
  await card.getByTestId("real-hand-signal-automaticCbetIssue").check();
  const skill = card.getByTestId("real-hand-practical-skill");
  await expect(skill).toBeVisible();
  await skill.selectOption("W4-BOARD-01");
  await expect(skill).toHaveValue("W4-BOARD-01");
}

test("explain-back saves durably and is visible after reload", async ({ page }) => {
  await openLocal(page);
  const seeded = await localState(page);
  await page.evaluate((state) => {
    state.activeSession = {
      mode: "lesson",
      moduleId: "geometry",
      step: 7,
      drillIds: ["geo-01", "geo-04"],
      currentIndex: 0,
      selectedActionId: null,
      selectedReasonId: null,
      confidence: 65,
      startedAt: new Date().toISOString(),
      itemStartedAt: new Date().toISOString(),
      explainBack: "",
    };
    localStorage.setItem("live-cash-os:learner-state", JSON.stringify(state));
  }, seeded);
  await page.reload();

  const explanation = "Сначала определяю эффективный стек и рабочую единицу ставок, затем строю решение из этой геометрии, а не из номинального числа BB.";
  await page.locator(".large-input").fill(explanation);
  await page.getByRole("button", { name: "Сохранить объяснение" }).click();
  await expect(page.getByText("9 · СРАВНИ СВОЁ ОБЪЯСНЕНИЕ", { exact: true })).toBeVisible();

  await page.reload();
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await expect(page.getByText(explanation)).toBeVisible();
  const state = await localState(page);
  expect(state.explainBackRecords).toHaveLength(1);
  expect(state.explainBackRecords[0].status).toBe("PENDING_REVIEW");
});

test("real hand locks pre-result reasoning, SELF cannot award transfer, and HUMAN_ASSISTED repair routes to exact Practical focus", async ({ page }) => {
  await openLocal(page);
  await fillHand(page);
  const reason = "Keep weaker hands in and avoid turning the hand into a raise without enough reason.";
  await page.getByRole("button", { name: "Зафиксировать решение" }).click();
  await expect(page.getByText(/Решение зафиксировано до результата/)).toBeVisible();

  let state = await localState(page);
  expect(state.fieldNotes).toHaveLength(1);
  const noteId = state.fieldNotes[0].id;
  const lockedReason = state.fieldNotes[0].reason;
  expect(lockedReason).toBe(reason);
  expect(state.modules.geometry.evidence.field_transfer.exposures).toBe(0);
  const queueBefore = JSON.stringify(state.reviewQueue);

  const card = page.locator(".field-list article").filter({ hasText: reason }).first();
  await card.getByLabel("Результат").fill("Villain showed AQ and won");
  await card.getByLabel("Шоудаун (если был)").fill("AQ");
  await card.getByRole("button", { name: "Добавить результат" }).click();
  state = await localState(page);
  expect(state.fieldNotes[0].reason).toBe(lockedReason);
  expect(state.fieldNotes[0].result).toBe("Villain showed AQ and won");

  const reviewer = card.getByLabel(`Как выполнен разбор ${noteId}`);
  await expect(card.getByText(/Самопроверка не подтверждает перенос и не назначает canonical repair/i)).toBeVisible();
  await expect(reviewer).toHaveValue("SELF");
  await expect(card.getByRole("button", { name: "Подтверждает перенос в реальную игру", exact: true })).toBeDisabled();

  await reviewer.selectOption("HUMAN_ASSISTED");
  await bindCanonicalFlopMechanism(card);
  await card.getByLabel(new RegExp(`Разбор ${noteId}`)).fill("Отдельный разбор с человеком установил автоматический c-bet как точный механизм ошибки.");
  await card.getByRole("button", { name: "Нужна практика", exact: true }).click();

  state = await localState(page);
  const reviewed = state.fieldNotes.find((note) => note.id === noteId);
  expect(reviewed.reviewerKind).toBe("HUMAN_ASSISTED");
  expect(reviewed.reviewOutcome).toBe("REPAIR_REQUIRED");
  expect(reviewed.status).toBe("REVIEWED_REPAIR");
  expect(reviewed.practicalBinding.practicalSkillId).toBe("W4-BOARD-01");
  expect(reviewed.practicalBinding.signals.automaticCbetIssue).toBe(true);
  expect(JSON.stringify(state.reviewQueue)).toBe(queueBefore);
  expect(state.modules.geometry.evidence.field_transfer.exposures).toBe(0);

  const focusedRepair = card.getByTestId("real-hand-practical-repair");
  await expect(focusedRepair).toBeVisible();
  await expect(focusedRepair).toHaveAttribute("href", "/mastery/session?focus=W4-BOARD-01");
});

test("structured hand capture remains usable without horizontal overflow", async ({ page }) => {
  await openLocal(page);
  await fillHand(page);
  await page.getByRole("button", { name: "Зафиксировать решение" }).click();
  await expect(page.getByText(/Решение зафиксировано до результата/)).toBeVisible();
  const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.client + 1);
});
