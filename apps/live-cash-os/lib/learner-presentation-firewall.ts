import { practicalSkillById } from "../content/practical-mastery";

export type LearnerPresentationLocale = "ru" | "en";

export type LearnerPresentationLeakClass =
  | "SOURCE_OR_MODULE_ID"
  | "SKILL_OR_DECISION_ID"
  | "REVIEWER_ENUM"
  | "CANONICAL_IMPLEMENTATION"
  | "SOURCE_GOVERNANCE"
  | "VALIDATION_PIPELINE"
  | "CORPUS_METADATA";

const SOURCE_ID_SOURCE = String.raw`(?:FTGU(?:[- ]?E)?\d+(?:/E\d+)?|SLC-[A-Z0-9-]+|CINJ-E\d+|CP-G\d+-L\d+)`;
const MODULE_ID_SOURCE = String.raw`(?:LCM-\d+|LD-\d+)`;
const SKILL_ID_SOURCE = String.raw`(?:FND|PF|BL|W4(?:-BOARD|-HAND|-RUNOUT)?|OOP|IP|3BP|4BP|TURN|RIV|MW|DEEP|EXP)-\d{2}(?:-\d+)?`;
const DECISION_ID_SOURCE = String.raw`PM-(?:[A-Z0-9]+-)+[A-Z0-9]+`;

const leakPatterns: ReadonlyArray<{
  leakClass: LearnerPresentationLeakClass;
  pattern: RegExp;
}> = [
  {
    leakClass: "SOURCE_OR_MODULE_ID",
    pattern: new RegExp(`\\b(?:${SOURCE_ID_SOURCE}|${MODULE_ID_SOURCE})\\b`, "iu"),
  },
  {
    leakClass: "SKILL_OR_DECISION_ID",
    pattern: new RegExp(`\\b(?:${SKILL_ID_SOURCE}|${DECISION_ID_SOURCE})\\b`, "u"),
  },
  {
    leakClass: "REVIEWER_ENUM",
    pattern: /\bHUMAN(?:_ASSISTED)?\b/u,
  },
  {
    leakClass: "CANONICAL_IMPLEMENTATION",
    pattern: /\b(?:canonical\s+(?:Practical\s+)?(?:skill|repair|binding|route)|Focused\s+Practical\s+repair|exact\s+repair\s+in\s+Practical)\b/iu,
  },
  {
    leakClass: "SOURCE_GOVERNANCE",
    pattern: /\b(?:POSITIVE_EV_SOURCE_ACCESS_REQUIRED|sourceRefs|source[- ]backed|source[- ]supported|source\s+integrity|source\s+mechanism|source\s+scope|source\s+examples?|field[- ]gated|inspectable\s+source|underlying\s+material|source\s+material|chart\s+inventory|original\s+charts?|unverified\s+charts?)\b|(?:источник\s+подтверждает|исходн\w*\s+материал\w*|доступн\w*\s+материал\w*|более\s+подробн\w*\s+источник\w*|исходн\w*\s+чарт\w*|(?:solver|course)-источник\w*)/iu,
  },
  {
    leakClass: "VALIDATION_PIPELINE",
    pattern: /\b(?:structured\s+canonical\s+binding|structured\s+causal\s+classification|visual\s+claim\s+review|visual[- ]dependent|targeted\s+visual\s+extraction|routing\s+inventory)\b/iu,
  },
  {
    leakClass: "CORPUS_METADATA",
    pattern: /\b\d+\s+indexed\s+scenarios?\b|\bindexed[- ]scenario\b|\bcorpus\b|\d+\s+проиндексированн\w*\s+сценари\w*/iu,
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

function replacePhrases(value: string, locale: LearnerPresentationLocale): string {
  const replacements: Array<[RegExp, string]> = locale === "ru"
    ? [
        [/\bHUMAN\s*\/\s*HUMAN_ASSISTED\b/gu, "разбор с человеком"],
        [/\bHUMAN_ASSISTED\b/gu, "разбор с человеком и инструментом"],
        [/\bHUMAN\b/gu, "разбор с человеком"],
        [/\bstructured\s+canonical\s+binding\b/giu, "явно установленный механизм"],
        [/\bstructured\s+causal\s+classification\b/giu, "явно установленный механизм"],
        [/\bFocused\s+Practical\s+repair\b/giu, "целевая практика"],
        [/\bcanonical\s+Practical\s+skill\b/giu, "точная тема для тренировки"],
        [/\bcanonical\s+skill\b/giu, "точная тема для тренировки"],
        [/\bcanonical\s+repair\b/giu, "работа над ошибкой"],
        [/\bexact\s+repair\s+in\s+Practical\b/giu, "целевая практика"],
        [/\bhuman\s+review\b/giu, "разбор с человеком"],
        [/\bcue-before-action\b/giu, "сигнал, отмеченный до решения"],
        [/\bvalid\s+structured\b/giu, "явный"],
        [/\bsource[- ]backed\b/giu, "подтвержденный"],
        [/\bsource[- ]supported\b/giu, "подтвержденный"],
        [/\bsource\s+integrity\b/giu, "граница доказательств"],
        [/\bsource\s+mechanism\b/giu, "подтвержденный механизм"],
        [/\bsource\s+scope\b/giu, "граница доказательств"],
        [/\bsource\s+examples?\b/giu, "примеры"],
        [/\bfield[- ]gated\b/giu, "требует подтверждения в реальной игре"],
        [/\bunderlying\s+material\b/giu, "текущая доказательная база"],
        [/\bsource\s+materials?\b/giu, "текущая доказательная база"],
        [/\ba\s+more\s+inspectable\s+source\b/giu, "более сильные данные именно для этого спота"],
        [/\binspectable\s+(?:solver\s+or\s+course\s+)?source\b/giu, "более сильные данные именно для этого спота"],
        [/\bavailable\s+material\b/giu, "текущие данные"],
        [/\bchart\s+inventory\b/giu, "набор разных конфигураций"],
        [/\bhave\s+not\s+yet\s+been\s+verified\s+against\s+the\s+original\s+charts\b/giu, "пока не установлены для точной конфигурации"],
        [/\boriginal\s+charts?\b/giu, "условия конкретного чарта"],
        [/\bunverified\s+charts?\b/giu, "чарты без установленных здесь точных частот"],
        [/\bvisual\s+claim\s+review\b/giu, "проверка совпадающих условий"],
        [/\bvisual[- ]dependent\b/giu, "зависят от точной конфигурации"],
        [/\btargeted\s+visual\s+extraction\b/giu, "точная проверка этого спота"],
        [/\brouting\s+inventory\b/giu, "набор разных конфигураций"],
        [/\bExact\s+frequencies\s+not\s+yet\s+verified\b/giu, "Точные частоты здесь пока не установлены"],
        [/\bunverified\s+(?:exact\s+)?frequencies\b/giu, "частоты, которые здесь пока не установлены"],
        [/источник\s+подтверждает/giu, "доступные данные подтверждают"],
        [/исходн\w*\s+материал\w*/giu, "текущая доказательная база"],
        [/доступн\w*\s+материал\w*/giu, "текущие данные"],
        [/более\s+подробн\w*\s+источник\w*/giu, "более сильная доказательная база именно для этого спота"],
        [/(?:solver-\s*или\s*course-источник\w*)/giu, "более сильные данные именно для этого спота"],
        [/(?:solver|course)-источник\w*/giu, "более сильные данные именно для этого спота"],
        [/ещ[её]\s+не\s+проверен\w*\s+по\s+исходн\w*\s+чарт\w*/giu, "пока не установлены для точной конфигурации"],
        [/ещ[её]\s+не\s+проверенн\w*\s+чарт\w*/giu, "чарты без установленных здесь точных частот"],
        [/В\s+исходн\w*\s+чартах\s+отдельно\s+разобран\w*/giu, "Отдельно рассматриваются"],
        [/исходн\w*\s+чарт\w*/giu, "условия конкретного чарта"],
        [/Точные\s+частоты\s+еще\s+не\s+проверены/giu, "Точные частоты здесь пока не установлены"],
        [/Точные\s+частоты\s+ещё\s+не\s+проверены/giu, "Точные частоты здесь пока не установлены"],
      ]
    : [
        [/\bHUMAN\s*\/\s*HUMAN_ASSISTED\b/gu, "review with a person"],
        [/\bHUMAN_ASSISTED\b/gu, "review with a person and a tool"],
        [/\bHUMAN\b/gu, "review with a person"],
        [/\bstructured\s+canonical\s+binding\b/giu, "explicitly identified mechanism"],
        [/\bstructured\s+causal\s+classification\b/giu, "explicitly identified mechanism"],
        [/\bFocused\s+Practical\s+repair\b/giu, "focused practice"],
        [/\bcanonical\s+Practical\s+skill\b/giu, "practice topic"],
        [/\bcanonical\s+skill\b/giu, "practice topic"],
        [/\bcanonical\s+repair\b/giu, "focused practice"],
        [/\bexact\s+repair\s+in\s+Practical\b/giu, "focused practice"],
        [/\bcue-before-action\b/giu, "cue recorded before the decision"],
        [/\bvalid\s+structured\b/giu, "explicit"],
        [/\bsource[- ]backed\b/giu, "reviewed"],
        [/\bsource[- ]supported\b/giu, "supported"],
        [/\bsource\s+integrity\b/giu, "evidence boundary"],
        [/\bsource\s+mechanism\b/giu, "supported mechanism"],
        [/\bsource\s+scope\b/giu, "evidence scope"],
        [/\bsource\s+examples?\b/giu, "examples"],
        [/\bfield[- ]gated\b/giu, "requires real-table evidence"],
        [/\bunderlying\s+material\b/giu, "current evidence"],
        [/\bsource\s+materials?\b/giu, "current evidence"],
        [/\ba\s+more\s+inspectable\s+source\b/giu, "stronger spot-specific evidence"],
        [/\binspectable\s+(?:solver\s+or\s+course\s+)?source\b/giu, "stronger spot-specific evidence"],
        [/\bavailable\s+material\b/giu, "current evidence"],
        [/\bchart\s+inventory\b/giu, "set of distinct configurations"],
        [/\bhave\s+not\s+yet\s+been\s+verified\s+against\s+the\s+original\s+charts\b/giu, "are not yet established for the exact configuration"],
        [/\boriginal\s+charts?\b/giu, "matching chart assumptions"],
        [/\bunverified\s+charts?\b/giu, "charts without established exact frequencies"],
        [/\bvisual\s+claim\s+review\b/giu, "matching-assumption check"],
        [/\bvisual[- ]dependent\b/giu, "dependent on the exact configuration"],
        [/\btargeted\s+visual\s+extraction\b/giu, "direct spot-specific checking"],
        [/\brouting\s+inventory\b/giu, "set of distinct configurations"],
        [/\bExact\s+frequencies\s+not\s+yet\s+verified\b/giu, "Exact frequencies are not established here yet"],
        [/\bunverified\s+(?:exact\s+)?frequencies\b/giu, "frequencies not established here"],
      ];

  return replacements.reduce((next, [pattern, replacement]) => next.replace(pattern, replacement), value);
}

function replaceIndexedScenarioSentence(value: string, locale: LearnerPresentationLocale): string {
  const replacement = locale === "ru"
    ? "В этой группе много разных конфигураций; используй ориентир, который совпадает с реальными позициями, глубиной, рейком и числом коллеров."
    : "This reference family contains many distinct configurations; use the one that matches the actual positions, depth, rake, and caller count.";
  return value
    .replace(/(?:The\s+)?\d+\s+indexed\s+scenarios?[^.!?]*(?:[.!?]|$)/giu, replacement)
    .replace(/\d+\s+проиндексированн\w*\s+сценари\w*[^.!?]*(?:[.!?]|$)/giu, replacement);
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

  let next = replaceIndexedScenarioSentence(value, locale);
  next = replacePhrases(next, locale);

  next = next.replace(
    new RegExp(`\\b${MODULE_ID_SOURCE}\\b(?:\\s*[.:\u00b7\u2014-]\\s*)?`, "giu"),
    "",
  );

  const evidence = locale === "ru" ? "проверенные данные" : "reviewed evidence";
  next = next.replace(new RegExp(`\\b${SOURCE_ID_SOURCE}\\b`, "giu"), evidence);
  next = next.replace(
    /reviewed evidence\s+extends\s+reviewed evidence/giu,
    "reviewed evidence supports the same mechanism",
  );

  next = next.replace(new RegExp(`\\b${SKILL_ID_SOURCE}\\b`, "gu"), (id) => skillTitle(id, locale));
  next = next.replace(
    new RegExp(`\\b${DECISION_ID_SOURCE}\\b`, "gu"),
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
