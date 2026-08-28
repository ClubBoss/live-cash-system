// V3 sibling closure: builds the FINAL COMPOSED active learner-facing corpus
// (the same pipeline PracticalLearnerPresentationGuard runs at render time:
// sanitizeLearnerPresentationText) for the ordinary (non-INTERNAL_ONLY)
// decision + anchor corpus, and reports deterministic counts. This is a
// read-only report, not a gate: it prints BEFORE/AFTER counts for the PR
// description and flags residual offenders for manual classification.
import { isOrdinaryLearnerDecision, practicalAnchors, practicalDecisions, practicalRules } from "../content/practical-mastery/index.ts";
import { sanitizeLearnerPresentationText } from "../lib/learner-presentation-firewall.ts";

const INTERNAL_LANGUAGE_PATTERNS = [
  { id: "integrity-closure-en", pattern: /\bintegrity closure\b/iu },
  { id: "transfer-layer-en", pattern: /\btransfer layer\b/iu },
  { id: "the-new-curriculum-en", pattern: /\bthe new curriculum\b/iu },
  { id: "reusable-family-bridge-en", pattern: /\breusable family bridge\b/iu },
  { id: "concrete-hand-transfer-en", pattern: /\bconcrete-hand transfer\b/iu },
  { id: "curriculum-en", pattern: /\bcurriculum\b/iu },
  { id: "evaluation-machinery-en", pattern: /\b(?:evaluation|assessment) (?:machinery|pipeline|engine)\b/iu },
  { id: "evidence-stage-en", pattern: /\b(?:SOURCE_SUPPORTED|CONCEPT_TAUGHT|RECOGNITION_TRAINED|DECISION_TRAINED|CHANGED_NODE_TRANSFER|BOUNDARY_TESTED|DELAYED_RETRIEVAL|REAL_HAND_TRANSFER)\b/u },
  { id: "integrity-closure-ru", pattern: /Целостность закрытие|целостность закрытия/iu },
  { id: "transfer-layer-ru", pattern: /Слой перенос/iu },
  { id: "curriculum-ru", pattern: /учебная программа/iu },
];

function learnerFieldsForDecision(decision) {
  return [
    ["cueRu", decision.cueRu, "ru"], ["cueEn", decision.cueEn, "en"],
    ["questionRu", decision.questionRu, "ru"], ["questionEn", decision.questionEn, "en"],
    ["explanationRu", decision.explanationRu, "ru"], ["explanationEn", decision.explanationEn, "en"],
    ...decision.actionOptions.flatMap((option, index) => [
      [`actionOptions[${index}].textRu`, option.textRu, "ru"],
      [`actionOptions[${index}].textEn`, option.textEn, "en"],
    ]),
    ...decision.reasonOptions.flatMap((option, index) => [
      [`reasonOptions[${index}].textRu`, option.textRu, "ru"],
      [`reasonOptions[${index}].textEn`, option.textEn, "en"],
    ]),
  ];
}

function learnerFieldsForAnchor(anchor) {
  return [
    ["promptRu", anchor.promptRu, "ru"], ["promptEn", anchor.promptEn, "en"],
    ["answerRu", anchor.answerRu, "ru"], ["answerEn", anchor.answerEn, "en"],
    ["rationaleRu", anchor.rationaleRu, "ru"], ["rationaleEn", anchor.rationaleEn, "en"],
  ];
}

function learnerFieldsForRule(rule) {
  return [
    ["triggerRu", rule.triggerRu, "ru"], ["triggerEn", rule.triggerEn, "en"],
    ["defaultRu", rule.defaultRu, "ru"], ["defaultEn", rule.defaultEn, "en"],
    ["whyRu", rule.whyRu, "ru"], ["whyEn", rule.whyEn, "en"],
    ["transferCueRu", rule.transferCueRu, "ru"], ["transferCueEn", rule.transferCueEn, "en"],
    ...rule.amplifiersRu.map((text, index) => [`amplifiersRu[${index}]`, text, "ru"]),
    ...rule.amplifiersEn.map((text, index) => [`amplifiersEn[${index}]`, text, "en"]),
    ...rule.reversalsRu.map((text, index) => [`reversalsRu[${index}]`, text, "ru"]),
    ...rule.reversalsEn.map((text, index) => [`reversalsEn[${index}]`, text, "en"]),
  ];
}

function buildCorpus() {
  const rows = [];
  for (const decision of practicalDecisions) {
    if (!isOrdinaryLearnerDecision(decision)) continue;
    for (const [field, raw, locale] of learnerFieldsForDecision(decision)) {
      if (!raw) continue;
      const composed = sanitizeLearnerPresentationText(raw, locale);
      rows.push({ ownerKind: "decision", ownerId: decision.id, field, locale, raw, composed });
    }
  }
  for (const anchor of practicalAnchors) {
    for (const [field, raw, locale] of learnerFieldsForAnchor(anchor)) {
      if (!raw) continue;
      const composed = sanitizeLearnerPresentationText(raw, locale);
      rows.push({ ownerKind: "anchor", ownerId: anchor.id, field, locale, raw, composed });
    }
  }
  for (const rule of practicalRules) {
    for (const [field, raw, locale] of learnerFieldsForRule(rule)) {
      if (!raw) continue;
      const composed = sanitizeLearnerPresentationText(raw, locale);
      rows.push({ ownerKind: "rule", ownerId: rule.id, field, locale, raw, composed });
    }
  }
  return rows;
}

// Mechanical RU offenders: only bounded, deterministic classes (see mission
// scope) -- not a broad regex sweep. Reuses the same
// singular-verb-after-plural-subject class the firewall already fixes for
// "проверенные данные", generalised to detect any UNFIXED instance (i.e. the
// firewall's fixRuEvidencePredicateAgreement ran but a verb outside its known
// map was left singular), plus stranded mixed-language tokens (a bare Latin
// word glued into Cyrillic prose with no separating space/punctuation).
const RU_STRANDED_LATIN_IN_CYRILLIC = /[а-яё][A-Za-z]{2,}|[A-Za-z]{2,}[а-яё]/u;
const RU_DOUBLE_SPACE_OR_STRAY_PUNCT = /[ \t]{2,}|\s+[,.;:!?]|\?\s*\./u;
const RU_UNRESOLVED_EVIDENCE_SINGULAR = /проверенные данные\s+(?:(?:прямо|отдельно|специально|именно|сразу|особенно|явно|одновременно|также|уже|обычно)\s+){0,3}[а-яё]*(?:ет|ёт|ит)\b/iu;

function classifyRuMechanicalOffenders(composed) {
  const hits = [];
  if (RU_UNRESOLVED_EVIDENCE_SINGULAR.test(composed)) hits.push("EVIDENCE_PREDICATE_SINGULAR_UNFIXED");
  if (RU_STRANDED_LATIN_IN_CYRILLIC.test(composed)) hits.push("STRANDED_LATIN_TOKEN");
  if (RU_DOUBLE_SPACE_OR_STRAY_PUNCT.test(composed)) hits.push("STRAY_WHITESPACE_OR_PUNCTUATION");
  return hits;
}

// EN mechanical offenders: bounded classes only.
const EN_DOUBLE_ARTICLE = /\b(a|an|the)\s+(a|an|the)\b/iu;
const EN_STRAY_WHITESPACE = /[ \t]{2,}|\s+[,.;:!?]/u;
const EN_REPEATED_WORD = /\b(\w+)\s+\1\b/iu;

function classifyEnMechanicalOffenders(composed) {
  const hits = [];
  if (EN_DOUBLE_ARTICLE.test(composed)) hits.push("DOUBLE_ARTICLE");
  if (EN_STRAY_WHITESPACE.test(composed)) hits.push("STRAY_WHITESPACE_OR_PUNCTUATION");
  if (EN_REPEATED_WORD.test(composed)) hits.push("REPEATED_WORD");
  return hits;
}

const rows = buildCorpus();
const ruRows = rows.filter((row) => row.locale === "ru");
const enRows = rows.filter((row) => row.locale === "en");

const internalLanguageHits = rows
  .map((row) => ({ row, matches: INTERNAL_LANGUAGE_PATTERNS.filter(({ pattern }) => pattern.test(row.composed)) }))
  .filter(({ matches }) => matches.length > 0);

const ruMechanicalHits = ruRows
  .map((row) => ({ row, classes: classifyRuMechanicalOffenders(row.composed) }))
  .filter(({ classes }) => classes.length > 0);
const enMechanicalHits = enRows
  .map((row) => ({ row, classes: classifyEnMechanicalOffenders(row.composed) }))
  .filter(({ classes }) => classes.length > 0);

const report = {
  ACTIVE_RU_STRINGS: ruRows.length,
  ACTIVE_EN_STRINGS: enRows.length,
  INTERNAL_LANGUAGE_RU: internalLanguageHits.filter(({ row }) => row.locale === "ru").length,
  INTERNAL_LANGUAGE_EN: internalLanguageHits.filter(({ row }) => row.locale === "en").length,
  RU_MECHANICAL_OFFENDERS: ruMechanicalHits.length,
  EN_MECHANICAL_OFFENDERS: enMechanicalHits.length,
  internalLanguageDetail: internalLanguageHits.map(({ row, matches }) => ({
    ownerKind: row.ownerKind, ownerId: row.ownerId, field: row.field, locale: row.locale,
    classes: matches.map((m) => m.id), composed: row.composed,
  })),
  ruMechanicalDetail: ruMechanicalHits.map(({ row, classes }) => ({
    ownerKind: row.ownerKind, ownerId: row.ownerId, field: row.field, classes, composed: row.composed,
  })),
  enMechanicalDetail: enMechanicalHits.map(({ row, classes }) => ({
    ownerKind: row.ownerKind, ownerId: row.ownerId, field: row.field, classes, composed: row.composed,
  })),
};

console.log(JSON.stringify(report, null, 2));
