import assert from "node:assert/strict";
import test from "node:test";
import { cardIsDue, emptyLearnerState, gradeCard, validateLearnerState } from "../lib/model.ts";
import { planDailyTraining } from "../lib/scheduler.ts";

const MINUTE = 60_000;
const DAY = 86_400_000;
const T0 = Date.parse("2026-08-12T00:00:00.000Z");
const CARD_ID = "geo-card-srs";
const catalog = {
  modules: [{
    id: "geometry",
    prerequisites: [],
    drills: [{ id: "geo-a", moduleId: "geometry", nodeKey: "geo-a", variantGroup: "geo-family", kind: "core", targetSeconds: 30 }],
  }],
  cards: [{ id: CARD_ID, moduleId: "geometry" }],
};

function enableClock(t, now = T0) {
  t.mock.timers.enable({ apis: ["Date"], now });
}

function studiedState() {
  const state = emptyLearnerState();
  state.modules.geometry.contentCompleted = true;
  state.modules.geometry.lessonStep = 10;
  return state;
}

test("first card grades create the declared 10m / 1d / 2d / 4d due times", (t) => {
  enableClock(t);
  const expected = new Map([
    [0, 10 * MINUTE],
    [1, 1 * DAY],
    [2, 2 * DAY],
    [3, 4 * DAY],
  ]);

  for (const [grade, delay] of expected) {
    const state = gradeCard(studiedState(), `${CARD_ID}-${grade}`, grade);
    const card = state.cards[`${CARD_ID}-${grade}`];
    assert.equal(Date.parse(card.dueAt), T0 + delay);
    assert.equal(card.repetitions, 1);
    assert.equal(card.lastGrade, grade);
  }
});

test("Good survives serialization/reload and cannot be regraded before its due time", (t) => {
  enableClock(t);
  let state = gradeCard(studiedState(), CARD_ID, 2);
  assert.equal(state.cards[CARD_ID].intervalDays, 2);
  assert.equal(Date.parse(state.cards[CARD_ID].dueAt), T0 + 2 * DAY);
  assert.equal(cardIsDue(state.cards[CARD_ID]), false);

  const reloaded = JSON.parse(JSON.stringify(state));
  assert.equal(validateLearnerState(reloaded), true);
  assert.equal(reloaded.cards[CARD_ID].dueAt, state.cards[CARD_ID].dueAt);

  const early = gradeCard(reloaded, CARD_ID, 3);
  assert.strictEqual(early, reloaded, "an early browse/warm-up click must not move the SRS deadline");
  assert.equal(Date.parse(early.cards[CARD_ID].dueAt), T0 + 2 * DAY);

  t.mock.timers.setTime(T0 + 2 * DAY);
  assert.equal(cardIsDue(early.cards[CARD_ID]), true);
  state = gradeCard(early, CARD_ID, 3);
  assert.equal(state.cards[CARD_ID].intervalDays, 7);
  assert.equal(Date.parse(state.cards[CARD_ID].dueAt), T0 + 9 * DAY);
  assert.equal(state.cards[CARD_ID].repetitions, 2);
});

test("Before Play never resurfaces a card whose saved dueAt is still in the future", (t) => {
  enableClock(t);
  const state = gradeCard(studiedState(), CARD_ID, 2);

  t.mock.timers.setTime(T0 + 30 * MINUTE);
  const plan = planDailyTraining(state, catalog, { budget: "warmup", now: Date.now(), seed: "future-card" });
  assert.equal(plan.items.some((item) => item.kind === "cards"), false);
  assert.equal(plan.items[0].kind, "done");

  t.mock.timers.setTime(T0 + 2 * DAY);
  const duePlan = planDailyTraining(state, catalog, { budget: "warmup", now: Date.now(), seed: "due-card" });
  assert.equal(duePlan.items[0].kind, "cards");
  assert.deepEqual(duePlan.items[0].cardIds, [CARD_ID]);
});
