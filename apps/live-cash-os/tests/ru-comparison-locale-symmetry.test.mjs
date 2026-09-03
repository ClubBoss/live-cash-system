import assert from "node:assert/strict";
import test from "node:test";

import { practicalDecisionById } from "../content/practical-mastery/index.ts";
import {
  authoritativeComparisonBaselineDecisionId,
  visibleComparisonForDecision,
} from "../lib/practical-visible-scenario.ts";

// A coarse detector for untranslated English prose surviving inside RU-locale
// table-state narration. It strips approved poker notation (position
// acronyms, bb sizings, card ranks/suits) and treats 2+ remaining Latin
// words as residual English prose. Genuine Russian text is unaffected
// (Cyrillic letters are not [A-Za-z] and are stripped to nothing), so this
// only fires on real untranslated sentences, not on the accepted
// EN/Cyrillic-mixed poker notation used throughout the RU corpus.
const APPROVED_NOTATION = /\b(?:EV|IP|OOP|SPR|BB|SB|BTN|CO|HJ|UTG|EP|Hero|MDF)\b/gu;
const BB_QUANTITY = /\d+(?:[.,]\d+)?bb\b/giu;
const CARD_RANK_SUIT = /\b[2-9TJQKA][♠♥♦♣]/gu;

function hasResidualEnglishProse(lines) {
  const text = lines.join(" ")
    .replace(APPROVED_NOTATION, "")
    .replace(BB_QUANTITY, "")
    .replace(CARD_RANK_SUIT, "")
    .replace(/[^A-Za-z\s]/gu, " ");
  const words = text.trim().split(/\s+/u).filter(Boolean);
  return words.length >= 2;
}

// A table-state side "resolves to RU" (for this narration-completeness
// check) when neither its rendered actions nor its rendered irrelevantCues
// still carry residual English prose once the RU-locale render path
// (actionsRu/irrelevantCuesRu when present, else the raw field) is applied
// -- i.e. exactly what PracticalTableStateStimulus actually shows an RU
// learner.
function sideHasResidualEnglish(state) {
  const actions = state.actionsRu ?? state.actions;
  const irrelevantCues = state.irrelevantCuesRu ?? state.irrelevantCues;
  if (hasResidualEnglishProse(actions)) return true;
  if (irrelevantCues && hasResidualEnglishProse(irrelevantCues)) return true;
  return false;
}

test("RU changed-node comparisons never mix a translated panel with an untranslated panel", () => {
  const comparisonDecisionIds = [...practicalDecisionById.keys()].filter(
    (id) => authoritativeComparisonBaselineDecisionId(id) !== null,
  );
  assert.ok(comparisonDecisionIds.length > 0, "fixture must exercise at least one governed comparison");

  const asymmetric = [];
  for (const decisionId of comparisonDecisionIds) {
    const comparison = visibleComparisonForDecision(decisionId);
    if (!comparison) continue; // not table-backed; outside this surface's scope
    const beforeResidual = sideHasResidualEnglish(comparison.before);
    const nowResidual = sideHasResidualEnglish(comparison.current);
    if (beforeResidual !== nowResidual) {
      asymmetric.push({
        decisionId,
        beforeId: comparison.before.decisionId,
        beforeResidual,
        nowResidual,
      });
    }
  }

  assert.deepEqual(
    asymmetric,
    [],
    `Asymmetric RU locale projection across BEFORE/NOW comparison panels: ${JSON.stringify(asymmetric)}`,
  );
});
