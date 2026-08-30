import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { practicalAnchorById, practicalDecisionById } from "../content/practical-mastery/index.ts";
import { callPriceFraction, CALL_PRICE_SCAFFOLD } from "../content/i18n/novice-scaffold.ts";

// Authoritative pot-odds formula, independent of any authored prose:
// required equity = call / (pot before the call + call), where "pot before
// the call" already includes Villain's bet. This mirrors callPriceFraction
// from novice-scaffold.ts, re-derived here so a bug in one place cannot mask
// a bug in the other.
function requiredEquityPct(callPrice, potBeforeCall) {
  return Math.round((callPrice / (potBeforeCall + callPrice)) * 100);
}

// The exact defect this suite guards against: dividing the call by the pot
// *before* the call instead of the pot *after* it (forgetting to add Hero's
// own call to the denominator). Expressed as a literal arithmetic string so
// the negative assertions below can search for the precise wrong sentence
// rather than any mention of a percentage.
function buggyFractionSentence(callPrice, potBeforeCall) {
  const buggyPct = Math.round((callPrice / potBeforeCall) * 100);
  return { buggyPct, sentence: `${callPrice} / ${potBeforeCall} = ${buggyPct}%` };
}

// Legitimate pedagogy explicitly negates the WIN_RATE_50_SHORTCUT misconception
// ("...около 33%, а не 50%." / "...not automatically 50%."). Strip those
// negated mentions before scanning for stray, non-allow-listed percentages so
// a deliberate "not 50%" callout is not mistaken for a false 50% claim.
function stripNegatedPercentages(text) {
  return text
    .replace(/(?:^|\s)не\s+\d+%/giu, " ")
    .replace(/\bnot(?:\s+\w+){0,2}\s+\d+%/giu, " ");
}

const anchorScenarios = [
  // pot before Villain's bet 1bb, bet 1bb -> pot before call 2bb, call 1bb
  { id: "FND-01-A01", potBeforeBet: 1, villainBet: 1, callPrice: 1 },
  // proportional 2x scaling of FND-01-A01; must yield the same threshold
  { id: "FND-01-A02", potBeforeBet: 2, villainBet: 2, callPrice: 2 },
];

test("anchor pot-odds thresholds are derived from scenario numbers and agree across RU and EN", () => {
  for (const { id, potBeforeBet, villainBet, callPrice } of anchorScenarios) {
    const anchor = practicalAnchorById.get(id);
    assert.ok(anchor, `missing anchor ${id}`);

    const potBeforeCall = potBeforeBet + villainBet;
    const expectedPct = requiredEquityPct(callPrice, potBeforeCall);
    const { buggyPct, sentence: buggySentence } = buggyFractionSentence(callPrice, potBeforeCall);

    const ruSurface = `${anchor.promptRu} ${anchor.answerRu} ${anchor.rationaleRu}`;
    const enSurface = `${anchor.promptEn} ${anchor.answerEn} ${anchor.rationaleEn}`;

    assert.match(ruSurface, new RegExp(`${expectedPct}%`), `${id} RU must state the computed ${expectedPct}% threshold`);
    assert.match(enSurface, new RegExp(`${expectedPct}%`), `${id} EN must state the computed ${expectedPct}% threshold`);

    // Guard against the confirmed defect class: an answer/rationale that
    // divides the call by the pre-call pot alone (forgetting Hero's own
    // call in the denominator), in either locale.
    if (buggyPct !== expectedPct) {
      const ruAnswerSurface = `${anchor.answerRu} ${anchor.rationaleRu}`;
      const enAnswerSurface = `${anchor.answerEn} ${anchor.rationaleEn}`;
      assert.doesNotMatch(ruAnswerSurface, new RegExp(buggySentence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${id} RU must not restate the buggy "${buggySentence}" derivation`);
      assert.doesNotMatch(enAnswerSurface, new RegExp(buggySentence.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")), `${id} EN must not restate the buggy "${buggySentence}" derivation`);
    }
  }

  // FND-01-A01 and FND-01-A02 are a proportional (x2) scaling of the same
  // scenario; scale invariance means they must compute to the same threshold.
  const [first, second] = anchorScenarios;
  const firstPct = requiredEquityPct(first.callPrice, first.potBeforeBet + first.villainBet);
  const secondPct = requiredEquityPct(second.callPrice, second.potBeforeBet + second.villainBet);
  assert.equal(firstPct, secondPct, "scaling every amount by the same factor must not change the required-equity threshold");
});

// "risk C to win P" scenarios, where P is already the pot before Hero's call
// (matching how these decisions state their assumptions, e.g. "call 1bb to
// win 3bb"). Each entry names the correct action/reason option ids so the
// check looks at the actual learner-facing correct-answer surface, not an
// arbitrary field.
const decisionScenarios = [
  { id: "PM-FND-01-101", callPrice: 1, potBeforeCall: 3, alsoAllowedPct: [] },
  { id: "PM-FND-01-102", callPrice: 1, potBeforeCall: 2, alsoAllowedPct: [38] }, // 38% is Hero's stated equity, not the threshold
  { id: "PM-FND-01-103", callPrice: 2, potBeforeCall: 3, alsoAllowedPct: [37] }, // 37% is Hero's stated equity, not the threshold
  { id: "PM-FND-01-001", callPrice: 1, potBeforeCall: 2, alsoAllowedPct: [] },
];

test("decision pot-odds thresholds are derived from scenario numbers and agree across RU and EN", () => {
  for (const { id, callPrice, potBeforeCall, alsoAllowedPct } of decisionScenarios) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing decision ${id}`);

    const expectedPct = requiredEquityPct(callPrice, potBeforeCall);
    const correctAction = decision.actionOptions.find((option) => option.id === decision.correctActionId);
    const correctReason = decision.reasonOptions.find((option) => option.id === decision.correctReasonId);
    assert.ok(correctAction && correctReason, `${id} must resolve its correct action/reason options`);

    const ruSurface = `${correctAction.textRu} ${correctReason.textRu} ${decision.explanationRu}`;
    const enSurface = `${correctAction.textEn} ${correctReason.textEn} ${decision.explanationEn}`;

    assert.match(ruSurface, new RegExp(`${expectedPct}%`), `${id} RU correct-answer surface must state the computed ${expectedPct}% threshold`);
    assert.match(enSurface, new RegExp(`${expectedPct}%`), `${id} EN correct-answer surface must state the computed ${expectedPct}% threshold`);

    // Every percentage stated in the correct-answer surface must be either
    // the computed threshold or an explicitly allow-listed non-threshold
    // number (e.g. Hero's raw equity being compared against the threshold).
    const allowed = new Set([expectedPct, ...alsoAllowedPct]);
    for (const [locale, surface] of [["RU", ruSurface], ["EN", enSurface]]) {
      for (const match of stripNegatedPercentages(surface).matchAll(/(\d+)%/g)) {
        const value = Number(match[1]);
        assert.ok(allowed.has(value), `${id} ${locale} correct-answer surface states unexpected ${value}%: "${surface}"`);
      }
    }
  }
});

// Guardrail: a concrete sizing/percentage anchor stated in a scenario cue must
// state the SAME figure in both locales. Scoped to an explicit, maintained
// registry rather than a blanket corpus scan -- most scenario cues legitimately
// differ in supporting detail between locales, so a naive "every RU number
// must appear in EN" rule would false-positive across the corpus. This
// registry exists to catch a regression equivalent to PM-OOP-04-106, whose EN
// cue previously said only "small to large" while RU stated a concrete
// "25–33% -> large" anchor for the identical scenario.
const cueNumericAnchorItems = ["PM-OOP-04-106"];

function percentTokens(text) {
  return [...text.matchAll(/\d+(?:[–-]\d+)?%/gu)].map((match) => match[0]);
}

test("registered cue-level sizing anchors state the same concrete percentage range in RU and EN", () => {
  for (const id of cueNumericAnchorItems) {
    const decision = practicalDecisionById.get(id);
    assert.ok(decision, `missing decision ${id}`);

    const ruTokens = percentTokens(decision.cueRu);
    const enTokens = percentTokens(decision.cueEn);
    assert.ok(ruTokens.length > 0, `${id}: RU cue must state a concrete percentage anchor (registry entry is stale otherwise): "${decision.cueRu}"`);
    assert.deepEqual(
      enTokens,
      ruTokens,
      `${id}: EN cue must state the same percentage anchor as RU (RU: "${decision.cueRu}" EN: "${decision.cueEn}")`,
    );
  }
});

test("LCM-02 call-price scaffold (50 into 150 -> 200) computes 25% from its own formula in both locales", () => {
  const potAfterVillainBet = 150;
  const callAmount = 50;
  const expectedFraction = callPriceFraction(potAfterVillainBet, callAmount);
  assert.equal(expectedFraction, 0.25);
  const expectedPct = Math.round(expectedFraction * 100);

  for (const locale of ["ru", "en"]) {
    assert.match(
      CALL_PRICE_SCAFFOLD[locale].example,
      new RegExp(`${callAmount} / ${potAfterVillainBet + callAmount} = ${expectedPct}%`),
      `CALL_PRICE_SCAFFOLD.${locale}.example must state the computed ${expectedPct}% price`,
    );
  }

  // The final-plus-ev locale-language pass rewrites both locale examples to a
  // slightly different sentence; verify the rewritten source keeps the same
  // computed numbers in both languages rather than trusting the base file alone.
  const finalPlusEv = readFileSync(new URL("../content/i18n/final-plus-ev.ts", import.meta.url), "utf8");
  const occurrences = [...finalPlusEv.matchAll(new RegExp(`${callAmount} / ${potAfterVillainBet + callAmount} = (\\d+)%`, "g"))];
  assert.ok(occurrences.length >= 2, "final-plus-ev.ts should restate the call-price example for both ru and en");
  for (const match of occurrences) {
    assert.equal(Number(match[1]), expectedPct, `final-plus-ev.ts restates the call-price example with the wrong percentage: "${match[0]}"`);
  }
});
