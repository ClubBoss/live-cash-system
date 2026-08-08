import { expect, test } from "@playwright/test";

async function openLocal(page) {
  await page.route("**/api/state", async (route) => {
    await route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ error: "local test" }) });
  });
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Учись понемногу/i })).toBeVisible();
}

async function localState(page) {
  await expect.poll(async () => page.evaluate(() => localStorage.getItem("live-cash-os:learner-state"))).not.toBeNull();
  return page.evaluate(() => JSON.parse(localStorage.getItem("live-cash-os:learner-state")));
}

async function captureHand(page, cue, actionSequence) {
  await page.getByRole("button", { name: "Руки", exact: true }).click();
  await page.getByLabel("Лимиты").fill("2/5");
  await page.getByLabel("Позиция Hero").fill("BB");
  await page.getByLabel("Позиции релевантных соперников").fill("BTN");
  await page.getByLabel("Эффективные стеки").fill("150bb");
  await page.getByLabel("Страддл / без страддла").fill("без страддла");
  await page.getByLabel("Последовательность действий").fill(actionSequence);
  await page.getByLabel("Борд (для префлопа: preflop)").fill("Qh 7d 4c");
  await page.getByLabel("Сайзинги").fill("3bb preflop; 25% flop");
  await page.getByLabel("Что заметил").fill(cue);
  await page.getByLabel("Как сыграл").fill("Call");
  await page.getByLabel("Почему — до результата").fill("Keep weaker hands in and preserve the calling range before changing the node.");
  await page.getByRole("button", { name: "Зафиксировать решение" }).click();
  const state = await localState(page);
  return state.fieldNotes.at(-1).id;
}

test.beforeEach(async ({ page }) => {
  await openLocal(page);
});

test("SELF cannot add field evidence and HUMAN_ASSISTED can record one legitimate support", async ({ page }) => {
  const selfCue = "SELF authority check: small wide flop bet";
  const selfId = await captureHand(page, selfCue, "BTN opens 3bb, BB calls; flop BTN bets 25%");
  const selfCard = page.locator(".field-list article").filter({ hasText: selfCue }).first();
  const selfSource = selfCard.getByLabel(`Как выполнен разбор ${selfId}`);
  await expect(selfSource).toHaveValue("SELF");
  await selfCard.getByLabel(`Разбор ${selfId}`).fill("My own review says the decision was coherent, but this remains self-review only.");
  await expect(selfCard.getByRole("button", { name: "Подтверждает перенос в реальную игру", exact: true })).toBeDisabled();
  await selfCard.getByRole("button", { name: "Разбор закончен", exact: true }).click();

  let state = await localState(page);
  const selfNote = state.fieldNotes.find((note) => note.id === selfId);
  expect(selfNote.reviewerKind).toBe("SELF");
  expect(selfNote.reviewOutcome).toBe("REVIEWED_OK");
  expect(state.modules.geometry.evidence.field_transfer.exposures).toBe(0);
  expect(state.modules.geometry.evidence.field_transfer.successes).toBe(0);

  const assistedCue = "HUMAN_ASSISTED authority check: same mechanism after separate review";
  const assistedId = await captureHand(page, assistedCue, "BTN opens 3bb, BB calls; flop BTN bets 25%; separate review follows");
  const assistedCard = page.locator(".field-list article").filter({ hasText: assistedCue }).first();
  const assistedSource = assistedCard.getByLabel(`Как выполнен разбор ${assistedId}`);
  await assistedSource.selectOption("HUMAN_ASSISTED");
  await expect(assistedCard.getByText(/только после реального отдельного разбора с человеком/i)).toBeVisible();
  await expect(assistedCard.getByText(/приложение не проверяет, кто проводил разбор/i)).toBeVisible();
  await assistedCard.getByLabel(`Разбор ${assistedId}`).fill("A real separate human-assisted review confirmed the locked cue, action, and reason support transfer.");
  const support = assistedCard.getByRole("button", { name: "Подтверждает перенос в реальную игру", exact: true });
  await expect(support).toBeEnabled();
  await support.click();

  state = await localState(page);
  const assistedNote = state.fieldNotes.find((note) => note.id === assistedId);
  expect(assistedNote.reviewerKind).toBe("HUMAN_ASSISTED");
  expect(assistedNote.reviewOutcome).toBe("SUPPORTS_TRANSFER");
  expect(state.modules.geometry.evidence.field_transfer.exposures).toBe(1);
  expect(state.modules.geometry.evidence.field_transfer.successes).toBe(1);
  expect(state.modules.geometry.evidence.field_transfer.distinctNodes).toEqual([`field:${assistedId}`]);
  expect(state.modules.geometry.state).not.toBe("FIELD_VALIDATED");

  await page.reload();
  state = await localState(page);
  const persisted = state.fieldNotes.find((note) => note.id === assistedId);
  expect(persisted.reviewerKind).toBe("HUMAN_ASSISTED");
  expect(persisted.reviewOutcome).toBe("SUPPORTS_TRANSFER");
  expect(state.modules.geometry.evidence.field_transfer.exposures).toBe(1);
  expect(state.modules.geometry.evidence.field_transfer.successes).toBe(1);
});
