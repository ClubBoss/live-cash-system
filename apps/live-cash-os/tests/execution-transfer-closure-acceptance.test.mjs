import assert from "node:assert/strict";
import test from "node:test";
import {
  executionTransferClosureDecisions,
  executionTransferClosureAnchors,
} from "../content/practical-mastery/decisions-execution-transfer-closure.ts";
import { practicalSourceAuthorityByRef, isPokerStrategySourceRef } from "../content/practical-mastery/source-authority.ts";

function correctPosition(options, id) {
  return options.findIndex((option) => option.id === id);
}

function counts(values) {
  return [0, 1, 2].map((position) => values.filter((value) => value === position).length);
}

test("execution transfer closure has no mechanical correct-answer position leak", () => {
  assert.equal(executionTransferClosureDecisions.length, 24);
  const actionPositions = executionTransferClosureDecisions.map((decision) => correctPosition(decision.actionOptions, decision.correctActionId));
  const reasonPositions = executionTransferClosureDecisions.map((decision) => correctPosition(decision.reasonOptions, decision.correctReasonId));

  assert.ok(actionPositions.every((position) => position >= 0));
  assert.ok(reasonPositions.every((position) => position >= 0));
  for (const count of counts(actionPositions)) assert.ok(count >= 5, "each action display position must carry at least five correct answers");
  for (const count of counts(reasonPositions)) assert.ok(count >= 5, "each reason display position must carry at least five correct answers");
  assert.ok(executionTransferClosureDecisions.some((_, index) => actionPositions[index] !== reasonPositions[index]), "action and reason correct positions must not be mechanically coupled");
  assert.ok(new Set(actionPositions.map((position, index) => `${position}:${reasonPositions[index]}`)).size >= 6, "correct action/reason position pairs must be materially varied");
});

test("every decision has exactly three action and three reason options with a resolvable correct id", () => {
  for (const decision of executionTransferClosureDecisions) {
    assert.equal(decision.actionOptions.length, 3, `${decision.id}: expected 3 action options`);
    assert.equal(decision.reasonOptions.length, 3, `${decision.id}: expected 3 reason options`);
    assert.ok(decision.actionOptions.some((option) => option.id === decision.correctActionId), `${decision.id}: correctActionId must resolve`);
    assert.ok(decision.reasonOptions.some((option) => option.id === decision.correctReasonId), `${decision.id}: correctReasonId must resolve`);
  }
});

test("decision ids are unique and skillIds only extend already-admitted skill families", () => {
  const ids = executionTransferClosureDecisions.map((decision) => decision.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate decision id");
  const admittedSkillIds = new Set(["BL-06", "BL-09", "BL-10", "DEEP-03", "TURN-01", "TURN-02", "W4-BOARD-01", "W4-REL-01"]);
  for (const decision of executionTransferClosureDecisions) {
    assert.ok(admittedSkillIds.has(decision.skillId), `${decision.id}: unexpected skillId ${decision.skillId}`);
  }
});

test("kind changed decisions carry non-empty changedVariables", () => {
  for (const decision of executionTransferClosureDecisions.filter((d) => d.kind === "changed")) {
    assert.ok(Array.isArray(decision.changedVariables) && decision.changedVariables.length > 0, `${decision.id}: changed decision needs changedVariables`);
  }
});

test("equal-blind section (BL-06/BL-09/BL-10/DEEP-03) rejects standard open/fold transfer and standard BB-defense transfer", () => {
  const equalBlind = executionTransferClosureDecisions.filter((d) => ["BL-06", "BL-09", "BL-10", "DEEP-03"].includes(d.skillId));
  assert.equal(equalBlind.length, 7);
  const visible = equalBlind.flatMap((decision) => [
    decision.cueRu, decision.cueEn, decision.questionRu, decision.questionEn, decision.explanationRu, decision.explanationEn,
    ...decision.actionOptions.flatMap((option) => [option.textRu, option.textEn]),
    ...decision.reasonOptions.flatMap((option) => [option.textRu, option.textEn]),
  ]).join("\n");
  assert.match(visible, /бесплатно чекнуть|free check/i);
  assert.match(visible, /straddle/i);
});

test("board-family and turn-class anti-shortcut invariants are asserted, not just labeled", () => {
  const boardChanged = executionTransferClosureDecisions.filter((d) => d.skillId === "W4-BOARD-01" && d.kind === "changed");
  assert.equal(boardChanged.length, 3);
  const boardVisible = boardChanged.flatMap((d) => [d.explanationRu, d.explanationEn]).join("\n");
  assert.match(boardVisible, /BOARD FAMILY.*ACTION|board family.*(equal|action)/i);

  const turnChanged = executionTransferClosureDecisions.filter((d) => d.skillId === "TURN-01" && d.kind === "changed");
  assert.equal(turnChanged.length, 1);
  assert.match(turnChanged[0].explanationEn, /TURN CLASS/i);
});

test("hand-role bridge (W4-REL-01) never equates hand label with relative role", () => {
  const handRole = executionTransferClosureDecisions.filter((d) => d.skillId === "W4-REL-01");
  assert.equal(handRole.length, 4);
  const visible = handRole.flatMap((decision) => [decision.explanationRu, decision.explanationEn]).join("\n");
  assert.match(visible, /ROLE|роль/i);
});

test("execution transfer closure RU copy excludes confirmed broken hybrids", () => {
  const ru = executionTransferClosureDecisions.flatMap((decision) => [
    ...decision.assumptions,
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).join("\n");

  for (const forbidden of [
    /distribution stack/i,
    /fancy aggression/i,
    /Profile opponent/i,
    /Branch-specific/i,
    /repair-турн/i,
    /remaining stack/i,
    /strategic reason/i,
    /value target/i,
    /hand role/i,
  ]) assert.doesNotMatch(ru, forbidden);
});

test("the cross-module compression card exists exactly once and warns classification never determines action", () => {
  assert.equal(executionTransferClosureAnchors.length, 1);
  const [card] = executionTransferClosureAnchors;
  assert.equal(card.skillId, "W4-REL-01");
  assert.match(card.answerRu, /не определяет действие/);
  assert.match(card.answerEn, /does not determine the action/);
  assert.match(`${card.answerRu} ${card.answerEn}`, /mainly informs|в основном подсказывает/i);
});

// FPA1-001: the boundary item must describe a genuine blind-vs-blind chop
// (hand terminates by prior agreement before any street is played), never a
// played check-down to showdown. A "true chop" and a "played check-down" are
// different phenomena and must not be conflated in this item.
test("FPA1-001: the chop item describes termination before a strategic branch, not a played check-down", () => {
  const chop = executionTransferClosureDecisions.find((d) => d.id === "PM-BL-06-ETC-103");
  assert.ok(chop, "PM-BL-06-ETC-103 must exist");
  assert.equal(chop.skillId, "BL-06");
  assert.equal(chop.kind, "boundary");

  const visible = [
    chop.cueRu, chop.cueEn, chop.explanationRu, chop.explanationEn,
    ...chop.actionOptions.flatMap((o) => [o.textRu, o.textEn]),
    ...chop.reasonOptions.flatMap((o) => [o.textRu, o.textEn]),
  ].join("\n");

  // Must name the chop mechanism and that it precedes the flop.
  assert.match(visible, /chop/i);
  assert.match(visible, /до флопа|before the flop/i);

  // Must NOT describe a played check-down / showdown split — that is a
  // different phenomenon (a real strategic branch was played, just checked).
  for (const playedCheckdownPhrase of [
    /чекнули банк без единой ставки/i,
    /checked the pot down/i,
    /банк просто раздели/i,
    /pot was simply split/i,
  ]) {
    assert.doesNotMatch(visible, playedCheckdownPhrase, `chop item must not describe a played check-down: ${playedCheckdownPhrase}`);
  }

  // The correct action/reason must state the hand ends before any strategic
  // node — not merely "no bet was made" (which is compatible with a played
  // check-down and would fail to distinguish the two phenomena).
  const correctAction = chop.actionOptions.find((o) => o.id === chop.correctActionId);
  const correctReason = chop.reasonOptions.find((o) => o.id === chop.correctReasonId);
  assert.match(`${correctAction.textRu} ${correctAction.textEn}`, /прежде чем.*(сыгран|played)|before.*(played|actually played)/i);
  assert.match(`${correctReason.textRu} ${correctReason.textEn}`, /под реальным давлением|under real pressure/i);
});

// FPA1-002: the specific hybrid classes found by Fresh Pass #1 (raw English
// nouns stitched into Russian sentences) cannot trivially recur in this file.
test("FPA1-002: RU naturalness firewall covers the newly observed hybrid classes", () => {
  const ru = executionTransferClosureDecisions.flatMap((decision) => [
    decision.cueRu,
    decision.questionRu,
    decision.explanationRu,
    ...decision.actionOptions.map((option) => option.textRu),
    ...decision.reasonOptions.map((option) => option.textRu),
  ]).concat(executionTransferClosureAnchors.flatMap((a) => [a.promptRu, a.answerRu, a.rationaleRu]))
    .join("\n");

  for (const forbidden of [
    /\bancestry\b/i,
    /\bvoluntary raiser\b/i,
    /opponent-evidence/i,
    /Branch-специфичн\w*/i,
    /\bBvB\b/,
    /forced unit/i,
    /\bboost\b/i,
    /\bPAIR\b(?!ED)/,
    /DRAW COMPLETE/i,
    /классификация REPAIR/i,
    /evidence-дисциплина/i,
  ]) assert.doesNotMatch(ru, forbidden, `RU text must not contain the hybrid: ${forbidden}`);
});

// FPA1-003: the confirmed cartoonish distractors (absurd category errors that
// a learner could reject on tone alone, without reasoning about range/
// ownership/history/job) must not recur verbatim. This is a lexical
// tripwire only — it cannot prove plausibility, which was verified by manual
// semantic audit of all 24 decisions (see repair PR description).
test("FPA1-003: confirmed cartoonish distractor phrases do not recur", () => {
  const allOptionsText = executionTransferClosureDecisions
    .flatMap((d) => [...d.actionOptions, ...d.reasonOptions])
    .flatMap((o) => [o.textRu, o.textEn])
    .join("\n");

  for (const cartoonish of [
    /three different suits by themselves make the board low/i,
    /три разные масти сами по себе делают доску низкой/i,
    /having a king automatically makes the board connected/i,
    /наличие короля автоматически делает доску связанной/i,
    /any nine automatically means a check/i,
    /любая карта девятки автоматически означает чек/i,
    /is fixed on the flop and is never revisited/i,
    /фиксируется на флопе и не пересматривается/i,
    /any turn raise always means the nuts regardless of the opponent's history/i,
    /любой терн-рейз всегда означает натсы независимо от истории соперника/i,
  ]) assert.doesNotMatch(allOptionsText, cartoonish, `cartoonish distractor must not recur: ${cartoonish}`);
});

// FPA1-SA-001: the alias SLC-BB-VS-SB resolves exclusively to SLC-M02-L05,
// whose only admitted claim (LCM-03-CL-003) is HJ-versus-SB/BB-caller
// source-range-shape c-bet strategy at 200bb. That claim does not establish
// equal-blind preflop topology, SB free-check semantics, SB-check/BB-raise
// role semantics, true-chop mechanics, or blinds-returned/hand-ends-preflop
// facts, so the six equal-blind/chop records must not cite it as direct
// authority. Pure game-structure claims move to the explicitly labelled
// EQUAL_BLIND_GAME_STRUCTURE internal authority; path-dependent range/role
// claims stay on the already-admitted LCM-03 blind-identity mechanism.
test("FPA1-SA-001: equal-blind/chop records no longer cite SLC-BB-VS-SB as direct authority", () => {
  const affectedIds = [
    "PM-BL-06-ETC-101",
    "PM-BL-10-ETC-101",
    "PM-BL-09-ETC-101",
    "PM-BL-06-ETC-102",
    "PM-BL-10-ETC-102",
    "PM-BL-06-ETC-103",
  ];
  const decisionsById = new Map(executionTransferClosureDecisions.map((decision) => [decision.id, decision]));
  assert.equal(decisionsById.size >= affectedIds.length, true);

  for (const id of affectedIds) {
    const decision = decisionsById.get(id);
    assert.ok(decision, `${id} must exist`);
    assert.ok(!decision.sourceRefs.includes("SLC-BB-VS-SB"), `${id}: must not cite the misleading SLC-BB-VS-SB alias`);
    for (const ref of decision.sourceRefs) {
      assert.ok(practicalSourceAuthorityByRef.has(ref), `${id}: sourceRef ${ref} must resolve to a known authority`);
    }
  }

  // Pure equal-blind/chop game-structure claims are represented through the
  // explicitly labelled internal authority, never disguised as external
  // poker-strategy evidence.
  for (const id of ["PM-BL-06-ETC-101", "PM-BL-10-ETC-101", "PM-BL-06-ETC-103"]) {
    const decision = decisionsById.get(id);
    assert.ok(decision.sourceRefs.includes("EQUAL_BLIND_GAME_STRUCTURE"), `${id}: must cite EQUAL_BLIND_GAME_STRUCTURE`);
  }

  const equalBlindAuthority = practicalSourceAuthorityByRef.get("EQUAL_BLIND_GAME_STRUCTURE");
  assert.equal(equalBlindAuthority.kind, "INTERNAL_AUTHORITY", "EQUAL_BLIND_GAME_STRUCTURE must be a labelled internal authority, not external evidence");
  assert.equal(isPokerStrategySourceRef("EQUAL_BLIND_GAME_STRUCTURE"), false, "EQUAL_BLIND_GAME_STRUCTURE must not be classified as poker-strategy source authority");
  assert.match(equalBlindAuthority.note, /project-defined/i);

  const aliasAuthority = practicalSourceAuthorityByRef.get("SLC-BB-VS-SB");
  assert.equal(aliasAuthority.kind, "SOURCE_GROUP_ALIAS");
  assert.deepEqual(aliasAuthority.canonicalRefs, ["SLC-M02-L05"]);
  assert.match(aliasAuthority.note, /does NOT establish equal-blind/);
});

// FPA1R-001: PM-W4-BOARD-01-ETC-103 teaches that the strategic delta between
// the two nodes comes from pot type, arriving-range composition, AND
// aggressor position (node A: BTN aggressor IP; node B: aggressor OOP in a
// deep 3-bet pot). changedVariables previously omitted aggressor_position,
// making the machine-readable metadata causally incomplete relative to what
// the correct action/reason/explanation actually teach.
test("FPA1R-001: PM-W4-BOARD-01-ETC-103 declares aggressor_position as a changed variable", () => {
  const decision = executionTransferClosureDecisions.find((d) => d.id === "PM-W4-BOARD-01-ETC-103");
  assert.ok(decision, "PM-W4-BOARD-01-ETC-103 must exist");
  assert.equal(decision.kind, "changed");
  assert.deepEqual(
    [...decision.changedVariables].sort(),
    ["aggressor_position", "arriving_ranges", "pot_type"],
    "PM-W4-BOARD-01-ETC-103 must declare pot_type, arriving_ranges, and aggressor_position",
  );
});

// FPA1-ANCESTRY-001: NO RAISE != NO FILTER. A voluntary CHECK is a
// branch-conditioning event whenever raising has non-zero strategic
// probability. "Neither range was narrowed by a raise" (no conventional
// PFR) must never be upgraded to "ranges are symmetrically unfiltered" /
// "checks carry no ancestry information" — PM-BL-09-ETC-101 already
// correctly teaches SB CHECK as an ancestry filter, and PM-BL-10-ETC-101/102
// must not contradict it.
test("FPA1-ANCESTRY-001: no-raise is never upgraded to no-filter", () => {
  const decisionsById = new Map(executionTransferClosureDecisions.map((decision) => [decision.id, decision]));

  const etc101 = decisionsById.get("PM-BL-10-ETC-101");
  assert.ok(etc101, "PM-BL-10-ETC-101 must exist");
  const etc101Visible = [
    etc101.explanationRu, etc101.explanationEn,
    ...etc101.actionOptions.flatMap((o) => [o.textRu, o.textEn]),
    ...etc101.reasonOptions.flatMap((o) => [o.textRu, o.textEn]),
  ].join("\n");

  // 1. Must not teach CHECK/CHECK as "symmetrically unfiltered" / no-action-filter.
  assert.doesNotMatch(etc101Visible, /symmetrically unfiltered/i, "PM-BL-10-ETC-101 must not claim ranges are symmetrically unfiltered");
  assert.doesNotMatch(etc101Visible, /симметрично неотфильтрован/i, "PM-BL-10-ETC-101 must not claim ranges are симметрично неотфильтрованы");
  assert.doesNotMatch(etc101Visible, /checks carry no ancestry/i, "PM-BL-10-ETC-101 must not claim checks carry no ancestry information");
  assert.doesNotMatch(etc101Visible, /(original|unrestricted) ranges? survive(s)? unchanged/i, "PM-BL-10-ETC-101 must not claim original ranges survive unchanged");

  // 2. Must preserve: no conventional PFR / no range narrowed through a raise.
  assert.match(etc101Visible, /no conventional (preflop[- ]aggressor|PFR)/i, "PM-BL-10-ETC-101 must preserve the no-conventional-PFR lesson");
  assert.match(etc101Visible, /narrowed by a raise|сужен рейзом/i, "PM-BL-10-ETC-101 must preserve the no-raise-filter distinction");

  // Must explicitly distinguish "not narrowed by a raise" from "not conditioned by action".
  assert.match(etc101Visible, /not conditioned by action|обусловленности действием/i, "PM-BL-10-ETC-101 must distinguish no-raise-filter from no-action-conditioning");

  const etc102 = decisionsById.get("PM-BL-10-ETC-102");
  assert.ok(etc102, "PM-BL-10-ETC-102 must exist");
  const etc102Visible = [
    etc102.explanationRu, etc102.explanationEn,
    ...etc102.actionOptions.flatMap((o) => [o.textRu, o.textEn]),
    ...etc102.reasonOptions.flatMap((o) => [o.textRu, o.textEn]),
  ].join("\n");

  // 3. Node A (SB check -> BB check) must not be described as unfiltered.
  assert.doesNotMatch(etc102Visible, /symmetrically unfiltered/i, "PM-BL-10-ETC-102 must not describe node A as symmetrically unfiltered");
  assert.doesNotMatch(etc102Visible, /симметрично неотфильтрован/i, "PM-BL-10-ETC-102 must not describe node A as симметрично неотфильтрованы");
  assert.doesNotMatch(etc102Visible, /node A is (symmetrically )?unfiltered/i, "PM-BL-10-ETC-102 must not describe node A as unfiltered");

  // 4. Must explicitly preserve CHECK-conditioning ancestry for both node A and node B,
  //    and must not describe node B's SB filter as raise+call alone (the prior SB check filter must survive too).
  assert.match(etc102Visible, /check-conditioned|conditioned by checking|обусловлен.*чек/i, "PM-BL-10-ETC-102 must preserve CHECK-conditioning ancestry");
  assert.match(etc102Visible, /filtered twice|дважды|two branches in a row/i, "PM-BL-10-ETC-102 node B must preserve SB's double filter (check, then call)");
  assert.match(etc102Visible, /checking instead of raising|чеком вместо рейза/i, "PM-BL-10-ETC-102 node B must preserve the prior SB check filter, not just raise+call");

  // 5. PM-BL-09-ETC-101 (control) must still treat SB CHECK as an ancestry filter.
  const control = decisionsById.get("PM-BL-09-ETC-101");
  assert.ok(control, "PM-BL-09-ETC-101 control must exist");
  const controlVisible = [
    control.explanationRu, control.explanationEn,
    ...control.actionOptions.flatMap((o) => [o.textRu, o.textEn]),
    ...control.reasonOptions.flatMap((o) => [o.textRu, o.textEn]),
  ].join("\n");
  assert.match(controlVisible, /filtered twice|дважды отфильтрован/i, "PM-BL-09-ETC-101 must still treat SB's check as part of a double-filtered ancestry");
  assert.match(controlVisible, /checking instead of raising|чеком вместо рейза/i, "PM-BL-09-ETC-101 must still treat SB CHECK (instead of raise) as an ancestry filter");
});
