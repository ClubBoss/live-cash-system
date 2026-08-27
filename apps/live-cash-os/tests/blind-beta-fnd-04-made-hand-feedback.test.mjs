import assert from "node:assert/strict";
import test from "node:test";
import { practicalDecisionById, practicalDecisions } from "../content/practical-mastery";
import { practicalDecisionFeedbackCopy } from "../content/practical-mastery/practical-decision-feedback-copy";
import { practicalSelectedDecisionFeedback } from "../lib/practical-selected-decision-feedback";

const DECISION_ID = "PM-W4-HAND-01-102";
const MISCONCEPTION_ID = "CLASSIFICATION_SHORTCUT";
const decision = practicalDecisionById.get(DECISION_ID);
assert.ok(decision, `missing ${DECISION_ID}`);

const shortcut = decision.actionOptions.find((option) => option.misconception === MISCONCEPTION_ID);
const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
const unrelatedWrongAction = decision.actionOptions.find((option) => option.id !== decision.correctActionId && option.id !== shortcut?.id);
assert.ok(shortcut && correctAction && correctReason && unrelatedWrongAction);

test("FND-04 causally repairs the observed made-hand-label shortcut without changing selected identities", () => {
  const en = practicalSelectedDecisionFeedback(decision, "en", shortcut.id, correctReason.id, false);
  const ru = practicalSelectedDecisionFeedback(decision, "ru", shortcut.id, correctReason.id, false);

  assert.equal(en.action?.selectedText, shortcut.textEn);
  assert.equal(en.action?.correctText, correctAction.textEn);
  assert.equal(en.reason, null);
  assert.match(en.mechanism, /draw equity/i);
  assert.match(en.mechanism, /future robustness/i);
  assert.match(en.mechanism, /pressure and future cards/i);
  assert.match(en.boundary ?? "", /simple label is enough only/i);
  assert.match(en.boundary ?? "", /draw or future robustness changes/i);
  assert.match(ru.mechanism, /equity дро/i);
  assert.match(ru.mechanism, /будущая устойчивость/i);
  assert.match(ru.boundary ?? "", /дро или меняется устойчивость/i);
});

test("FND-04 preserves generic feedback for unrelated wrong options and all other shortcut-tagged decisions", () => {
  const generic = practicalDecisionFeedbackCopy(decision);
  const unrelated = practicalSelectedDecisionFeedback(decision, "en", unrelatedWrongAction.id, correctReason.id, false);
  assert.equal(unrelated.mechanism, generic.mechanismEn);
  assert.equal(unrelated.boundary, generic.boundaryEn ?? null);

  const siblingShortcut = practicalDecisions.find((candidate) => candidate.id !== DECISION_ID && candidate.actionOptions.some((option) => option.misconception === MISCONCEPTION_ID));
  assert.ok(siblingShortcut, "fixture requires another generic shortcut-tagged decision");
  const siblingWrong = siblingShortcut.actionOptions.find((option) => option.misconception === MISCONCEPTION_ID);
  const siblingCorrectReason = siblingShortcut.reasonOptions.find((option) => option.id === siblingShortcut.correctReasonId);
  assert.ok(siblingWrong && siblingCorrectReason);
  const siblingFeedback = practicalSelectedDecisionFeedback(siblingShortcut, "en", siblingWrong.id, siblingCorrectReason.id, false);
  const siblingGeneric = practicalDecisionFeedbackCopy(siblingShortcut);
  assert.equal(siblingFeedback.mechanism, siblingGeneric.mechanismEn);
  assert.equal(siblingFeedback.boundary, siblingGeneric.boundaryEn ?? null);
});
