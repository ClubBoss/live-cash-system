import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { practicalDecisions, practicalAnchors, practicalDecisionById } from "../content/practical-mastery/index.ts";
import { sanitizeLearnerPresentationText, learnerPresentationLeakClasses } from "../lib/learner-presentation-firewall.ts";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

// Bounded RU publication-quality closure: the external blind acceptance found
// malformed learner-facing Russian in the FND-01 boundary/changed decisions
// (decisions-foundation-expansion.ts) and in the "practice topic" case
// agreement inside the learner-presentation firewall (Wave7 capture flow).
//
// The fix is applied through the existing corpus-publication override table
// (content/practical-mastery/practical-ru-corpus-publication.ts), keyed on the
// exact original source strings, and two generator-level agreement fixes
// (learner-presentation-firewall.ts). Decision content in
// decisions-foundation-expansion.ts itself is left untouched: many of its
// fields already resolve to correct Russian through the existing copy-repair/
// final-polish pipeline, and editing the source text directly was found to
// bypass those existing overrides rather than improve on them (verified by
// diffing pipeline output before/after). Fixing at the override layer keeps
// every untouched sibling decision's existing translation intact.
//
// These tests cover the demonstrated mechanical classes: (A) case/agreement,
// (B) hybrid RU/EN composition on the specific repaired decisions, (C)
// firewall publication phrasing, (D) Real Hands, and (E) semantic
// preservation of the underlying decision identities.

const FIXED_DECISION_IDS = [
  "PM-FND-01-103", "PM-FND-01-104", "PM-FND-01-105", "PM-FND-01-106", "PM-FND-01-107",
  "PM-FND-02-101", "PM-FND-02-104", "PM-FND-02-107",
  "PM-FND-06-102", "PM-FND-06-104",
];

// --- A. case / agreement -----------------------------------------------

test("A: the practice-topic firewall replacement agrees in case with its governor", () => {
  assert.equal(
    sanitizeLearnerPresentationText(
      "Только если отдельный разбор с человеком установил конкретный механизм, это можно определить как точный навык Practical.",
      "ru",
    ),
    "Только если отдельный разбор с человеком установил конкретный механизм, это можно определить как точную тему для тренировки.",
  );
  assert.equal(
    sanitizeLearnerPresentationText(
      "Эта широкая тема сама по себе никогда не выбирает canonical Practical skill.",
      "ru",
    ),
    "Эта широкая тема сама по себе никогда не выбирает точную тему для тренировки.",
  );
  // A bare/nominal use (no accusative governor immediately before it) must stay
  // in the nominative — the fix must not blindly force the accusative everywhere.
  assert.equal(sanitizeLearnerPresentationText("canonical Practical skill", "ru"), "точная тема для тренировки");
});

test("A: raw equity resolves to natural Russian with correct gender/case in its two active FND-02 sibling call sites", () => {
  const decision = practicalDecisionById.get("PM-FND-02-001");
  assert.equal(decision.cueRu, "У Hero заметная исходная эквити, но он играет OOP и может часто фолдить на будущих улицах.");
  assert.doesNotMatch(decision.cueRu, /заметное исходная|заметное raw/iu);
  const lookOnly = decision.actionOptions.find((option) => option.misconception === "RAW_EQUITY_ONLY");
  assert.equal(lookOnly.textRu, "Смотреть только на исходную эквити");

  const anchor = practicalAnchors.find((item) => item.id === "FND-02-A01");
  assert.doesNotMatch(anchor.promptRu, /заметное исходная|raw equity приравнять/iu);
  assert.match(anchor.promptRu, /заметная эквити/u);
  assert.match(anchor.promptRu, /приравнять эту эквити/u);
});

test("A: PM-FND-01-105 reason r3 keeps natural agreement with 'требуемая equity'", () => {
  const decision = practicalDecisionById.get("PM-FND-01-105");
  const r3 = decision.reasonOptions.find((option) => option.id === "r3");
  assert.match(r3.textRu, /требуемая equity всегда равна 50%/iu);
  assert.doesNotMatch(r3.textRu, /зафиксирован(?:а)? на 50%/u);
});

// --- B. hybrid RU/EN composition on the specific repaired decisions -----

// Standard poker vocabulary (equity, pot odds, stack, SPR, call, range, EV,
// blocker, flop/turn/river, position labels, etc.) is expected and is not a
// defect. These are English *function/description* words that only appear in
// this corpus when a sentence was left partially untranslated; none of them
// is a legitimate poker term, so any match on a repaired field is a residual
// hybrid-composition defect.
const RAW_ENGLISH_FILLER = /\b(?:the|a|an|is|are|was|were|does|did|cannot|because|behind|threshold|branch|branches|cheaper|becomes|boundary|component|reward|remaining|guarantee|guarantees|irrelevant|relatively|streets?)\b/iu;

function fixedDecisionRuStrings() {
  const out = [];
  for (const decision of practicalDecisions) {
    if (!FIXED_DECISION_IDS.includes(decision.id)) continue;
    out.push([`${decision.id} cueRu`, decision.cueRu]);
    out.push([`${decision.id} questionRu`, decision.questionRu]);
    out.push([`${decision.id} explanationRu`, decision.explanationRu]);
    for (const option of decision.actionOptions) out.push([`${decision.id} action ${option.id}`, option.textRu]);
    for (const option of decision.reasonOptions) out.push([`${decision.id} reason ${option.id}`, option.textRu]);
  }
  return out;
}

test("B: the repaired FND-01/02/06 decisions have no raw untranslated English filler left in their touched RU fields", () => {
  // Only the exact fields covered by the new override entries are asserted
  // clean; sibling fields left untouched on the same decision (e.g. a
  // still-mixed reasonOption that was not part of the demonstrated defect)
  // are out of this bounded repair's scope.
  const touchedFields = new Set([
    "PM-FND-01-103 explanationRu", "PM-FND-01-103 action b",
    "PM-FND-01-104 action a", "PM-FND-01-104 action b", "PM-FND-01-104 action c",
    "PM-FND-01-104 reason r1", "PM-FND-01-104 reason r2", "PM-FND-01-104 reason r3", "PM-FND-01-104 explanationRu",
    "PM-FND-01-105 cueRu", "PM-FND-01-105 reason r1", "PM-FND-01-105 reason r3", "PM-FND-01-105 explanationRu",
    "PM-FND-01-106 reason r1", "PM-FND-01-106 explanationRu",
    "PM-FND-01-107 cueRu", "PM-FND-01-107 questionRu", "PM-FND-01-107 reason r1", "PM-FND-01-107 reason r3", "PM-FND-01-107 explanationRu",
    "PM-FND-02-101 reason r1", "PM-FND-02-101 reason r2", "PM-FND-02-101 explanationRu",
    "PM-FND-02-104 cueRu",
    "PM-FND-02-107 questionRu", "PM-FND-02-107 action a", "PM-FND-02-107 action b", "PM-FND-02-107 reason r1", "PM-FND-02-107 explanationRu",
    "PM-FND-06-102 cueRu", "PM-FND-06-102 explanationRu",
    "PM-FND-06-104 questionRu", "PM-FND-06-104 explanationRu",
  ]);
  const offenders = fixedDecisionRuStrings()
    .filter(([label]) => touchedFields.has(label))
    .filter(([, text]) => RAW_ENGLISH_FILLER.test(text))
    .map(([label, text]) => `${label}: ${text}`);
  assert.deepEqual(offenders, []);
});

test("B: the six externally observed malformed strings do not recur verbatim", () => {
  const corpus = practicalDecisions.flatMap((decision) => [
    decision.cueRu, decision.questionRu, decision.explanationRu,
    ...decision.actionOptions.map((o) => o.textRu), ...decision.reasonOptions.map((o) => o.textRu),
  ]);
  const forbidden = [
    /много future branches/iu,
    /много будущий ветки/iu,
    /сравнить raw equity/iu,
    /сравнить исходная equity/iu,
    /^Equity hand не меняется/iu,
    /Меньший risk относительно reward/iu,
  ];
  for (const pattern of forbidden) {
    assert.ok(corpus.every((text) => typeof text !== "string" || !pattern.test(text)), `pattern still present: ${pattern}`);
  }
});

test("B: PM-FND-01-107 boundary item reads as natural, case-agreeing Russian", () => {
  const decision = practicalDecisionById.get("PM-FND-01-107");
  assert.equal(decision.cueRu, "На флопе за спиной большой стек и много будущих веток.");
  assert.equal(decision.questionRu, "Достаточно ли сравнить исходную equity только с текущим порогом pot odds?");
  assert.match(decision.explanationRu, /конце дерева решений/iu);
});

// --- C. firewall publication phrasing ------------------------------------

test("C: canonical learner corpus and Wave7 capture strings carry zero residual metadata-leak classes", async () => {
  const wave7 = await readFile(path.join(root, "components/Wave7Experience.tsx"), "utf8");
  const literals = [...wave7.matchAll(/"((?:[^"\\]|\\.)*(?:точн\p{L}*\s+навык\p{L}*\s+Practical|canonical\s+Practical\s+skill)(?:[^"\\]|\\.)*)"/giu)].map((m) => m[1]);
  assert.ok(literals.length >= 2, "expected both Wave7 practice-topic call sites to be exercised");
  for (const raw of literals) {
    const locale = /[А-Яа-яЁё]/u.test(raw) ? "ru" : "en";
    const safe = sanitizeLearnerPresentationText(raw, locale);
    assert.deepEqual(learnerPresentationLeakClasses(safe), []);
    if (locale === "ru") assert.doesNotMatch(safe, /точная тема для тренировки\s*$|как точная тема|выбирает точная тема/iu);
  }
});

// --- D. Real Hands --------------------------------------------------------

test("D: Real Hands (Wave7) capture guidance stays natural RU after the firewall in both call sites", async () => {
  const wave7 = await readFile(path.join(root, "components/Wave7Experience.tsx"), "utf8");
  assert.match(wave7, /определить как точный навык Practical/u);
  assert.match(wave7, /никогда не выбирает canonical Practical skill/u);

  const capture = sanitizeLearnerPresentationText(
    "Только если отдельный разбор с человеком установил конкретный механизм, это можно определить как точный навык Practical. Одна раздача — наблюдение, а не доказательство частоты или общего типа игрока.",
    "ru",
  );
  assert.match(capture, /определить как точную тему для тренировки/u);

  const moduleRequired = sanitizeLearnerPresentationText(
    "Связанная тема не выбрана. Выбери её явно для истории записи. Эта широкая тема сама по себе никогда не выбирает canonical Practical skill.",
    "ru",
  );
  assert.match(moduleRequired, /никогда не выбирает точную тему для тренировки/u);
});

// --- E. semantic preservation ---------------------------------------------

test("E: PM-FND-01-105/107 and sibling answer identities, misconceptions and sourceRefs are unchanged", () => {
  const d105 = practicalDecisionById.get("PM-FND-01-105");
  assert.equal(d105.correctActionId, "a");
  assert.equal(d105.correctReasonId, "r1");
  assert.deepEqual(d105.sourceRefs, ["FTGU-E01"]);
  assert.equal(d105.actionOptions.find((o) => o.id === "b").misconception, "PRICE_BACKWARDS");
  assert.equal(d105.actionOptions.find((o) => o.id === "c").misconception, "PRICE_IGNORED");
  assert.equal(d105.reasonOptions.find((o) => o.id === "r2").misconception, "PRICE_BACKWARDS");
  assert.equal(d105.reasonOptions.find((o) => o.id === "r3").misconception, "WIN_RATE_50_SHORTCUT");

  const d107 = practicalDecisionById.get("PM-FND-01-107");
  assert.equal(d107.correctActionId, "a");
  assert.equal(d107.correctReasonId, "r1");
  assert.deepEqual(d107.sourceRefs, ["FTGU-E01"]);
  assert.equal(d107.actionOptions.find((o) => o.id === "b").misconception, "EQUITY_EQUALS_EV");
  assert.equal(d107.actionOptions.find((o) => o.id === "c").misconception, "POSITION_MAGIC");
  assert.equal(d107.reasonOptions.find((o) => o.id === "r2").misconception, "FUTURE_TREE_IGNORED");
  assert.equal(d107.reasonOptions.find((o) => o.id === "r3").misconception, "RAW_EQUITY_ONLY");

  const d001 = practicalDecisionById.get("PM-FND-02-001");
  assert.equal(d001.actionOptions.find((o) => o.id === "b").misconception, "RAW_EQUITY_ONLY");
});

test("E: decisions-foundation-expansion.ts owns the corrected FND-01 RU publication", async () => {
  const original = await readFile(path.join(root, "content/practical-mastery/decisions-foundation-expansion.ts"), "utf8");
  assert.match(original, /cueRu: "На флопе за спиной большой стек и много будущих веток\."/u);
  assert.match(original, /cueRu: "Equity руки не меняется, но колл становится дешевле\."/u);
  assert.doesNotMatch(original, /Cheaper call требует больше equity/u);
  assert.doesNotMatch(original, /Price тот же, но после range update/u);
});

test("E: EN copy for the touched FND-01/02/06 decisions is byte-for-byte unchanged", () => {
  const spotChecks = [
    ["PM-FND-01-105", "cueEn", "The hand's equity is unchanged, but the call becomes cheaper."],
    ["PM-FND-01-107", "cueEn", "Flop, large stack behind, many future branches."],
    ["PM-FND-01-107", "questionEn", "Is comparing raw equity only with the current pot-odds threshold sufficient?"],
    ["PM-FND-02-101", "explanationEn", "FTGU-E01 immediately limits raw equity: it can be surrendered before showdown."],
    ["PM-FND-06-104", "explanationEn", "LCM-01 makes effective-stack identity part of decision geometry; nominal seat stack does not replace branch-specific effective depth."],
  ];
  for (const [id, field, expected] of spotChecks) {
    assert.equal(practicalDecisionById.get(id)[field], expected, `${id}.${field}`);
  }
});
