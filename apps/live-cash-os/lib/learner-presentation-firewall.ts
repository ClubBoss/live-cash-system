import { practicalSkillById } from "../content/practical-mastery";

export type LearnerPresentationLocale = "ru" | "en";

export type LearnerPresentationLeakClass =
  | "SOURCE_OR_MODULE_ID"
  | "SKILL_OR_DECISION_ID"
  | "REVIEWER_ENUM"
  | "CANONICAL_IMPLEMENTATION"
  | "SOURCE_GOVERNANCE"
  | "VALIDATION_PIPELINE"
  | "CORPUS_METADATA"
  | "MIGRATION_HISTORY";

const SOURCE_ID_SOURCE = String.raw`(?:FTGU(?:[- ]?E)?\d+(?:/E\d+)?|SLC-[A-Z0-9-]+|CINJ-E\d+|CP-G\d+-L\d+)`;
const BARE_EVIDENCE_ID_SOURCE = String.raw`E\d{2,}`;
const MODULE_ID_SOURCE = String.raw`(?:LCM-\d+|LD-\d+)`;
const SKILL_ID_SOURCE = String.raw`(?:FND|PF|BL|W4(?:-BOARD|-HAND|-RUNOUT)?|OOP|IP|3BP|4BP|TURN|RIV|MW|DEEP|EXP)-\d{2}(?:-\d+)?`;
const DECISION_ID_SOURCE = String.raw`PM-(?:[A-Z0-9]+-)+[A-Z0-9]+`;
const RU_LETTERS = String.raw`\p{L}*`;

const RU_CANONICAL_SOURCE = String.raw`(?:точн${RU_LETTERS}\s+навык${RU_LETTERS}\s+Practical|Practical\s+оста[её]тся\s+единственн${RU_LETTERS}\s+маршрут${RU_LETTERS}\s+обучения)`;
const RU_SOURCE_GOVERNANCE_SOURCE = String.raw`(?:источник\s+подтверждает|исходн${RU_LETTERS}\s+(?:материал|чарт)${RU_LETTERS}|доступн${RU_LETTERS}\s+материал${RU_LETTERS}|более\s+подробн${RU_LETTERS}\s+источник${RU_LETTERS}|(?:solver-\s*или\s*)?course-источник${RU_LETTERS}|solver-источник${RU_LETTERS})`;
const RU_CORPUS_SOURCE = String.raw`\d+\s+проиндексированн${RU_LETTERS}\s+сценари${RU_LETTERS}`;

const leakPatterns: ReadonlyArray<{
  leakClass: LearnerPresentationLeakClass;
  pattern: RegExp;
}> = [
  {
    leakClass: "SOURCE_OR_MODULE_ID",
    pattern: new RegExp(`\b(?:${SOURCE_ID_SOURCE}|${BARE_EVIDENCE_ID_SOURCE}|${MODULE_ID_SOURCE})\b`, "iu"),
  },
  {
    leakClass: "SKILL_OR_DECISION_ID",
    pattern: new RegExp(`\b(?:${SKILL_ID_SOURCE}|${DECISION_ID_SOURCE})\b`, "u"),
  },
  {
    leakClass: "REVIEWER_ENUM",
    pattern: /\bHUMAN(?:_ASSISTED)?\b/u,
  },
  {
    leakClass: "CANONICAL_IMPLEMENTATION",
    pattern: new RegExp(
      String.raw`\b(?:canonical\s+(?:Practical\s+)?(?:skill|repair|binding|route)|exact\s+Practical\s+skill|Focused\s+Practical\s+repair|exact\s+repair\s+in\s+Practical|Practical\s+remains\s+the\s+only\s+learning\s+route)\b|${RU_CANONICAL_SOURCE}`,
      "iu",
    ),
  },
  {
    leakClass: "SOURCE_GOVERNANCE",
    pattern: new RegExp(
      String.raw`\b(?:POSITIVE_EV_SOURCE_ACCESS_REQUIRED|sourceRefs|source[- ]backed|source[- ]supported|source\s+integrity|source\s+mechanism|source\s+scope|source\s+examples?|field[- ]gated|inspectable\s+source|underlying\s+material|source\s+material|chart\s+inventory|original\s+charts?|unverified\s+charts?)\b|${RU_SOURCE_GOVERNANCE_SOURCE}`,
      "iu",
    ),
  },
  {
    leakClass: "VALIDATION_PIPELINE",
    pattern: /\b(?:structured\s+canonical\s+binding|structured\s+causal\s+classification|visual\s+claim\s+review|visual[- ]dependent|targeted\s+visual\s+extraction|routing\s+inventory)\b/iu,
  },
  {
    leakClass: "CORPUS_METADATA",
    pattern: new RegExp(
      String.raw`\b\d+\s+indexed\s+scenarios?\b|\bindexed[- ]scenario\b|\bcorpus\b|${RU_CORPUS_SOURCE}`,
      "iu",
    ),
  },
  {
    leakClass: "MIGRATION_HISTORY",
    pattern: /\blegacy\b/iu,
  },
];

export function learnerPresentationLeakClasses(value: string): LearnerPresentationLeakClass[] {
  return leakPatterns
    .filter(({ pattern }) => pattern.test(value))
    .map(({ leakClass }) => leakClass);
}

export function isLearnerMetadataOnlyLine(value: string): boolean {
  return /^\s*(?:Источники|Sources)\s*:/iu.test(value);
}

function replaceRuPhrases(value: string): string {
  return value
    .replace(/\bHUMAN\s*\/\s*HUMAN_ASSISTED\b/gu, "разбор с человеком")
    .replace(/\bHUMAN_ASSISTED\b/gu, "разбор с человеком и инструментом")
    .replace(/\bHUMAN\b/gu, "разбор с человеком")
    .replace(/\bstructured\s+canonical\s+binding\b/giu, "явно установленный механизм")
    .replace(/\bstructured\s+causal\s+classification\b/giu, "явно установленный механизм")
    .replace(/\bFocused\s+Practical\s+repair\b/giu, "целевая практика")
    .replace(/\bcanonical\s+Practical\s+skill\b/giu, "точная тема для тренировки")
    .replace(/\bexact\s+Practical\s+skill\b/giu, "точная тема для тренировки")
    .replace(/точн\p{L}*\s+навык\p{L}*\s+Practical/giu, "точная тема для тренировки")
    .replace(/\bcanonical\s+skill\b/giu, "точная тема для тренировки")
    .replace(/\bcanonical\s+repair\b/giu, "работа над ошибкой")
    .replace(/\bexact\s+repair\s+in\s+Practical\b/giu, "целевая практика")
    .replace(/\bPractical\s+remains\s+the\s+only\s+learning\s+route\b/giu, "основной учебный путь остается местом для системной тренировки")
    .replace(/Practical\s+оста[её]тся\s+единственн\p{L}*\s+маршрут\p{L}*\s+обучения/giu, "основной учебный путь остается местом для системной тренировки")
    .replace(/\bhuman\s+review\b/giu, "разбор с человеком")
    .replace(/\bcue-before-action\b/giu, "сигнал, отмеченный до решения")
    .replace(/\bvalid\s+structured\b/giu, "явный")
    .replace(/\bsource[- ]backed\b/giu, "подтвержденный")
    .replace(/\bsource[- ]supported\b/giu, "подтвержденный")
    .replace(/\bsource\s+integrity\b/giu, "граница доказательств")
    .replace(/\bsource\s+mechanism\b/giu, "подтвержденный механизм")
    .replace(/\bsource\s+scope\b/giu, "граница доказательств")
    .replace(/\bsource\s+examples?\b/giu, "примеры")
    .replace(/\bfield[- ]gated\b/giu, "требует подтверждения в реальной игре")
    .replace(/\bunderlying\s+material\b/giu, "текущая доказательная база")
    .replace(/\bsource\s+materials?\b/giu, "текущая доказательная база")
    .replace(/\ba\s+more\s+inspectable\s+source\b/giu, "более сильные данные именно для этого спота")
    .replace(/\binspectable\s+(?:solver\s+or\s+course\s+)?source\b/giu, "более сильные данные именно для этого спота")
    .replace(/\bavailable\s+material\b/giu, "текущие данные")
    .replace(/\bchart\s+inventory\b/giu, "набор разных конфигураций")
    .replace(/\bhave\s+not\s+yet\s+been\s+verified\s+against\s+the\s+original\s+charts\b/giu, "пока не установлены для точной конфигурации")
    .replace(/\boriginal\s+charts?\b/giu, "условия конкретного чарта")
    .replace(/\bunverified\s+charts?\b/giu, "чарты без установленных здесь точных частот")
    .replace(/\bvisual\s+claim\s+review\b/giu, "проверка совпадающих условий")
    .replace(/\bvisual[- ]dependent\b/giu, "зависят от точной конфигурации")
    .replace(/\btargeted\s+visual\s+extraction\b/giu, "точная проверка этого спота")
    .replace(/\brouting\s+inventory\b/giu, "набор разных конфигураций")
    .replace(/\bExact\s+frequencies\s+not\s+yet\s+verified\b/giu, "Точные частоты здесь пока не установлены")
    .replace(/\bunverified\s+(?:exact\s+)?frequencies\b/giu, "частоты, которые здесь пока не установлены")
    .replace(/источник\s+подтверждает/giu, "доступные данные подтверждают")
    .replace(/исходн\p{L}*\s+материал\p{L}*/giu, "текущая доказательная база")
    .replace(/доступн\p{L}*\s+материал\p{L}*/giu, "текущие данные")
    .replace(/более\s+подробн\p{L}*\s+источник\p{L}*/giu, "более сильная доказательная база именно для этого спота")
    .replace(/solver-\s*или\s*course-источник\p{L}*/giu, "более сильные данные именно для этого спота")
    .replace(/(?:solver|course)-источник\p{L}*/giu, "более сильные данные именно для этого спота")
    .replace(/ещ[её]\s+не\s+проверен\p{L}*\s+по\s+исходн\p{L}*\s+чарт\p{L}*/giu, "пока не установлены для точной конфигурации")
    .replace(/ещ[её]\s+не\s+проверенн\p{L}*\s+чарт\p{L}*/giu, "чарты без установленных здесь точных частот")
    .replace(/В\s+исходн\p{L}*\s+чартах\s+отдельно\s+разобран\p{L}*/giu, "Отдельно рассматриваются")
    .replace(/исходн\p{L}*\s+чарт\p{L}*/giu, "условия конкретного чарта")
    .replace(/Точные\s+частоты\s+ещ?[её]?\s+не\s+проверены/giu, "Точные частоты здесь пока не установлены");
}

function replaceEnPhrases(value: string): string {
  return value
    .replace(/\bHUMAN\s*\/\s*HUMAN_ASSISTED\b/gu, "review with a person")
    .replace(/\bHUMAN_ASSISTED\b/gu, "review with a person and a tool")
    .replace(/\bHUMAN\b/gu, "review with a person")
    .replace(/\bstructured\s+canonical\s+binding\b/giu, "explicitly identified mechanism")
    .replace(/\bstructured\s+causal\s+classification\b/giu, "explicitly identified mechanism")
    .replace(/\bFocused\s+Practical\s+repair\b/giu, "focused practice")
    .replace(/\bcanonical\s+Practical\s+skill\b/giu, "practice topic")
    .replace(/\bexact\s+Practical\s+skill\b/giu, "practice topic")
    .replace(/точн\p{L}*\s+навык\p{L}*\s+Practical/giu, "practice topic")
    .replace(/\bcanonical\s+skill\b/giu, "practice topic")
    .replace(/\bcanonical\s+repair\b/giu, "focused practice")
    .replace(/\bexact\s+repair\s+in\s+Practical\b/giu, "focused practice")
    .replace(/\bPractical\s+remains\s+the\s+only\s+learning\s+route\b/giu, "the main learning path remains the place for structured training")
    .replace(/Practical\s+оста[её]тся\s+единственн\p{L}*\s+маршрут\p{L}*\s+обучения/giu, "the main learning path remains the place for structured training")
    .replace(/\bcue-before-action\b/giu, "cue recorded before the decision")
    .replace(/\bvalid\s+structured\b/giu, "explicit")
    .replace(/\bsource[- ]backed\b/giu, "reviewed")
    .replace(/\bsource[- ]supported\b/giu, "supported")
    .replace(/\bsource\s+integrity\b/giu, "evidence boundary")
    .replace(/\bsource\s+mechanism\b/giu, "supported mechanism")
    .replace(/\bsource\s+scope\b/giu, "evidence scope")
    .replace(/\bsource\s+examples?\b/giu, "examples")
    .replace(/\bfield[- ]gated\b/giu, "requires real-table evidence")
    .replace(/\bunderlying\s+material\b/giu, "current evidence")
    .replace(/\bsource\s+materials?\b/giu, "current evidence")
    .replace(/\ba\s+more\s+inspectable\s+source\b/giu, "stronger spot-specific evidence")
    .replace(/\binspectable\s+(?:solver\s+or\s+course\s+)?source\b/giu, "stronger spot-specific evidence")
    .replace(/\bavailable\s+material\b/giu, "current evidence")
    .replace(/\bchart\s+inventory\b/giu, "set of distinct configurations")
    .replace(/\bhave\s+not\s+yet\s+been\s+verified\s+against\s+the\s+original\s+charts\b/giu, "are not yet established for the exact configuration")
    .replace(/\boriginal\s+charts?\b/giu, "matching chart assumptions")
    .replace(/\bunverified\s+charts?\b/giu, "charts without established exact frequencies")
    .replace(/\bvisual\s+claim\s+review\b/giu, "matching-assumption check")
    .replace(/\bvisual[- ]dependent\b/giu, "dependent on the exact configuration")
    .replace(/\btargeted\s+visual\s+extraction\b/giu, "direct spot-specific checking")
    .replace(/\brouting\s+inventory\b/giu, "set of distinct configurations")
    .replace(/\bExact\s+frequencies\s+not\s+yet\s+verified\b/giu, "Exact frequencies are not established here yet")
    .replace(/\bunverified\s+(?:exact\s+)?frequencies\b/giu, "frequencies not established here");
}

function replaceMigrationHistory(value: string, locale: LearnerPresentationLocale): string {
  if (locale === "ru") {
    return value
      .replace(/\blegacy-заданий\s+на\s+работу\s+над\s+ошибкой\b/giu, "заданий на работу над ошибкой")
      .replace(/\blegacy\b[- ]?/giu, "");
  }
  return value
    .replace(/\bThis\s+legacy\s+note\s+cannot\s+support\s+transfer\s+because\s+it\s+has\s+no\s+decision\s+locked\s+before\s+the\s+result\./giu, "This note cannot support real-table transfer because the decision was not recorded before the result.")
    .replace(/\blegacy\s+mistake-practice\s+tasks\s+queued\b/giu, "mistake-practice tasks to complete")
    .replace(/\blegacy\b[- ]?/giu, "");
}

function replaceIndexedScenarioSentence(value: string, locale: LearnerPresentationLocale): string {
  const replacement = locale === "ru"
    ? "В этой группе много разных конфигураций; используй ориентир, который совпадает с реальными позициями, глубиной, рейком и числом коллеров."
    : "This reference family contains many distinct configurations; use the one that matches the actual positions, depth, rake, and caller count.";
  return value
    .replace(/(?:The\s+)?\d+\s+indexed\s+scenarios?[^.!?]*(?:[.!?]|$)/giu, replacement)
    .replace(/\d+\s+проиндексированн\p{L}*\s+сценари\p{L}*[^.!?]*(?:[.!?]|$)/giu, replacement);
}

function skillTitle(id: string, locale: LearnerPresentationLocale): string {
  const skill = practicalSkillById.get(id);
  if (!skill) return locale === "ru" ? "этот навык" : "this skill";
  return locale === "ru" ? skill.titleRu : skill.titleEn;
}

export function sanitizeLearnerPresentationText(
  value: string,
  locale: LearnerPresentationLocale,
): string {
  if (!value) return value;
  if (isLearnerMetadataOnlyLine(value)) return "";

  let next = replaceMigrationHistory(value, locale);
  next = replaceIndexedScenarioSentence(next, locale);
  next = locale === "ru" ? replaceRuPhrases(next) : replaceEnPhrases(next);

  next = next.replace(
    new RegExp(`\b${MODULE_ID_SOURCE}\b(?:\s*[.:·—-]\s*)?`, "giu"),
    "",
  );

  const evidence = locale === "ru" ? "проверенные данные" : "reviewed evidence";
  next = next.replace(new RegExp(`\b(?:${SOURCE_ID_SOURCE}|${BARE_EVIDENCE_ID_SOURCE})\b`, "giu"), evidence);
  next = next.replace(
    /reviewed evidence\s+extends\s+reviewed evidence/giu,
    "reviewed evidence supports the same mechanism",
  );

  next = next.replace(new RegExp(`\b${SKILL_ID_SOURCE}\b`, "gu"), (id) => skillTitle(id, locale));
  next = next.replace(
    new RegExp(`\b${DECISION_ID_SOURCE}\b`, "gu"),
    locale === "ru" ? "это решение" : "this decision",
  );
  next = next
    .replace(/\bPOSITIVE_EV_SOURCE_ACCESS_REQUIRED\b/gu, "")
    .replace(/\bsourceRefs\b/giu, "")
    .replace(/[ \t]{2,}/gu, " ")
    .replace(/\s+([,.;:!?])/gu, "$1")
    .replace(/([([])[ \t]+/gu, "$1")
    .replace(/[ \t]+([)\]])/gu, "$1");

  return next;
}