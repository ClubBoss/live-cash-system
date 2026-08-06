import type { LocaleCode, ModuleId, ResponseClass } from "../../lib/model";

export type RuntimeCopy = {
  nav: Record<"today" | "learn" | "review" | "cards" | "map" | "field" | "diagnostic", string>;
  system: string;
  close: string;
  loading: string;
  start: string;
  continue: string;
  saveExit: string;
  todayEyebrow: string;
  todayTitle: string;
  todayEmphasis: string;
  todayDescription: string;
  now: string;
  completedLessons: string;
  workingSkills: string;
  dueItems: string;
  personalisation: string;
  diagnosticTitle: string;
  diagnosticDescription: string;
  openT1: string;
  beforePlay: string;
  warmupTitle: string;
  warmupDescription: string;
  quickWarmup: string;
  integrityTitle: string;
  integrityBody: string;
  learnEyebrow: string;
  learnTitle: string;
  learnEmphasis: string;
  learnDescription: string;
  study: string;
  repeatLesson: string;
  decisions: string;
  mixedBlock: string;
  lesson: string;
  currentModel: string;
  coldCheckHelp: string;
  simpleTheory: string;
  heuristics: string;
  decisionTree: string;
  workedExample: string;
  conclusion: string;
  ruleBoundary: string;
  openLab: string;
  changedSituation: string;
  changedSituationTitle: string;
  changedSituationHelp: string;
  explainBack: string;
  explainPlaceholder: string;
  saveExplanation: string;
  tableCard: string;
  finishLesson: string;
  lessonFinished: string;
  lessonIntroduced: string;
  lessonNotMastered: string;
  lessonNext: string;
  saveReturn: string;
  chooseAction: string;
  chooseReason: string;
  confidence: string;
  lockDecision: string;
  workingAction: string;
  why: string;
  assumptions: string;
  conditions: string;
  reviewEyebrow: string;
  reviewTitle: string;
  reviewEmphasis: string;
  nothingDue: string;
  reviewEmptyBody: string;
  allCardsDone: string;
  showAnswer: string;
  forgot: string;
  hard: string;
  good: string;
  easy: string;
  cardsBoundary: string;
  skillMap: string;
  mapTitle: string;
  mapEmphasis: string;
  theory: string;
  practice: string;
  realHands: string;
  fieldTitle: string;
  fieldEmphasis: string;
  mechanism: string;
  cuePrompt: string;
  actionPrompt: string;
  reasonPrompt: string;
  cueBeforeAction: string;
  savePendingNote: string;
  insufficient: string;
  needsRepair: string;
  valid: string;
  reviewLabel: string;
  diagnosticMeasureTitle: string;
  diagnosticMeasureEmphasis: string;
  coldAvailable: string;
  postLearning: string;
  coldIntro: string;
  postIntro: string;
  startT1: string;
  answersSaved: string;
  rawBoundary: string;
  downloadRaw: string;
  importScore: string;
  actionDirection: string;
  oneSentenceReason: string;
  recordResponse: string;
  coldInstructions: string;
  postInstructions: string;
  mixedInstructions: string;
  contentFallback: string;
  translationPending: string;
  sync: Record<string, string>;
};

const ru: RuntimeCopy = {
  nav: { today: "Сегодня", learn: "Учиться", review: "Повтор", cards: "Карточки", map: "Карта", field: "Руки", diagnostic: "T1" },
  system: "система",
  close: "Закрыть",
  loading: "Загружаем прогресс…",
  start: "Начать",
  continue: "Продолжить",
  saveExit: "Выйти и сохранить",
  todayEyebrow: "СЕГОДНЯ · ОДНО ГЛАВНОЕ ДЕЙСТВИЕ",
  todayTitle: "Учись коротко.",
  todayEmphasis: "Переноси глубоко.",
  todayDescription: "Следующий шаг выбирается по ошибкам, срокам повторения и порядку навыков — не по красивому общему проценту.",
  now: "СЕЙЧАС",
  completedLessons: "объяснений пройдено",
  workingSkills: "навыков уже работают",
  dueItems: "повторов или исправлений сейчас",
  personalisation: "ПЕРСОНАЛИЗАЦИЯ",
  diagnosticTitle: "T1 — дополнительная диагностика",
  diagnosticDescription: "Полезна для приоритизации, но не блокирует первый урок.",
  openT1: "Открыть T1 →",
  beforePlay: "ПЕРЕД ИГРОЙ",
  warmupTitle: "90 секунд на ключевые подсказки",
  warmupDescription: "Три карточки к повторению без длинного урока.",
  quickWarmup: "Быстрая разминка →",
  integrityTitle: "Что система не утверждает",
  integrityBody: "Просмотр материала не равен устойчивому навыку. Удержание проверяется после паузы, а применение за столом — только по разобранным реальным рукам.",
  learnEyebrow: "УЧИТЬСЯ",
  learnTitle: "Один механизм.",
  learnEmphasis: "Десять ясных шагов.",
  learnDescription: "Первое решение → объяснение → три подсказки → порядок проверок → пример → практика → изменённая ситуация → объяснение своими словами → памятка → отложенный повтор.",
  study: "Изучить",
  repeatLesson: "Повторить объяснение",
  decisions: "5 решений",
  mixedBlock: "Смешанная тренировка",
  lesson: "УРОК",
  currentModel: "Сначала твоя текущая модель",
  coldCheckHelp: "Один вопрос без подсказки. Это не экзамен и не доказательство устойчивого навыка.",
  simpleTheory: "ПРОСТОЕ ОБЪЯСНЕНИЕ",
  heuristics: "ТРИ ПОДСКАЗКИ",
  decisionTree: "ПОРЯДОК ПРОВЕРОК",
  workedExample: "РАЗОБРАННЫЙ ПРИМЕР",
  conclusion: "Вывод",
  ruleBoundary: "Граница правила",
  openLab: "Открыть практику",
  changedSituation: "ИЗМЕНЁННАЯ СИТУАЦИЯ",
  changedSituationTitle: "Тот же механизм, другие детали",
  changedSituationHelp: "Проверяем перенос навыка, а не повтор фразы.",
  explainBack: "ОБЪЯСНИ СВОИМИ СЛОВАМИ",
  explainPlaceholder: "2–4 предложения своими словами…",
  saveExplanation: "Зафиксировать объяснение",
  tableCard: "ПАМЯТКА ЗА СТОЛОМ",
  finishLesson: "Завершить урок",
  lessonFinished: "УРОК ЗАВЕРШЁН",
  lessonIntroduced: "Механизм введён.",
  lessonNotMastered: "Но ещё не подтверждён как устойчивый навык.",
  lessonNext: "Дальше — самостоятельные решения и повтор после паузы.",
  saveReturn: "Сохранить и вернуться",
  chooseAction: "Выбери действие",
  chooseReason: "Выбери причину",
  confidence: "Уверенность",
  lockDecision: "Зафиксировать решение",
  workingAction: "Рабочее действие",
  why: "Почему",
  assumptions: "Допущения",
  conditions: "Условия",
  reviewEyebrow: "ПОВТОР И ИСПРАВЛЕНИЕ",
  reviewTitle: "Позже.",
  reviewEmphasis: "На похожей, но новой ситуации.",
  nothingDue: "Сейчас ничего не нужно повторять.",
  reviewEmptyBody: "После урока и самостоятельных решений здесь появятся точечные задания.",
  allCardsDone: "Все карточки повторены.",
  showAnswer: "Показать ответ",
  forgot: "Не вспомнил",
  hard: "Трудно",
  good: "Нормально",
  easy: "Легко",
  cardsBoundary: "Карточки помогают вспоминать, но сами по себе не доказывают удержание навыка.",
  skillMap: "КАРТА НАВЫКОВ",
  mapTitle: "Результаты по механизмам,",
  mapEmphasis: "а не галочки курса.",
  theory: "Объяснение",
  practice: "Тренировка",
  realHands: "РЕАЛЬНЫЕ РУКИ",
  fieldTitle: "Сначала зафиксируй.",
  fieldEmphasis: "Потом разбери.",
  mechanism: "Механизм",
  cuePrompt: "Что заметил до действия?",
  actionPrompt: "Что сделал?",
  reasonPrompt: "Почему?",
  cueBeforeAction: "Подсказка была замечена до действия",
  savePendingNote: "Сохранить руку на разбор",
  insufficient: "Недостаточно",
  needsRepair: "Нужно исправить",
  valid: "Подтверждено",
  reviewLabel: "Разбор",
  diagnosticMeasureTitle: "Измерить текущую модель.",
  diagnosticMeasureEmphasis: "Не блокировать обучение.",
  coldAvailable: "T1 · МОЖНО СНЯТЬ ИСХОДНЫЙ УРОВЕНЬ",
  postLearning: "T1 · ТЕКУЩАЯ ДИАГНОСТИКА",
  coldIntro: "10 решений без подсказки. Обратная связь скрыта до конца.",
  postIntro: "Обучение уже началось: результат поможет выбрать маршрут, но не будет считаться исходным уровнем.",
  startT1: "Начать T1",
  answersSaved: "ответов сохранено",
  rawBoundary: "Файл содержит ответы, но не содержит автоматической оценки и не выдаёт её за факт.",
  downloadRaw: "Скачать ответы",
  importScore: "Импортировать оценку",
  actionDirection: "Действие или направление",
  oneSentenceReason: "Причина одним предложением",
  recordResponse: "Зафиксировать ответ",
  coldInstructions: "Отвечай из своей текущей модели, не открывая чарты и ключи ответов.",
  postInstructions: "Используй текущую модель; результат не будет называться исходным уровнем.",
  mixedInstructions: "Диагностика началась до обучения, но была продолжена после него. Её нельзя трактовать как исходный уровень.",
  contentFallback: "Английская версия этого материала ещё проходит покерную редактуру. До одобрения показывается проверенный русский источник.",
  translationPending: "EN REVIEW REQUIRED",
  sync: { loading: "загрузка", local: "локально", syncing: "синхронизация", synced: "синхронизировано", offline: "офлайн", conflict: "конфликт", error: "ошибка" },
};

const en: RuntimeCopy = {
  nav: { today: "Today", learn: "Learn", review: "Review", cards: "Cards", map: "Map", field: "Hands", diagnostic: "T1" },
  system: "system",
  close: "Close",
  loading: "Loading progress…",
  start: "Start",
  continue: "Continue",
  saveExit: "Exit and save",
  todayEyebrow: "TODAY · ONE HIGHEST-VALUE ACTION",
  todayTitle: "Learn in small blocks.",
  todayEmphasis: "Transfer it to real play.",
  todayDescription: "Your next step follows errors, due reviews and skill order — not a decorative overall percentage.",
  now: "NOW",
  completedLessons: "teaching sequences completed",
  workingSkills: "skills currently working",
  dueItems: "reviews or repairs due now",
  personalisation: "PERSONALISATION",
  diagnosticTitle: "T1 — optional diagnostic",
  diagnosticDescription: "Useful for prioritisation, but never a wall before the first lesson.",
  openT1: "Open T1 →",
  beforePlay: "BEFORE PLAY",
  warmupTitle: "90-second table-cue warm-up",
  warmupDescription: "Three due cards without opening a long lesson.",
  quickWarmup: "Quick warm-up →",
  integrityTitle: "What the system does not claim",
  integrityBody: "Finishing content is not a stable skill. Retention requires a delayed test, and table transfer requires reviewed real-hand evidence.",
  learnEyebrow: "LEARN",
  learnTitle: "One mechanism.",
  learnEmphasis: "Ten clear steps.",
  learnDescription: "Cold decision → plain explanation → three cues → check order → worked example → lab → changed situation → explain it back → table card → delayed review.",
  study: "Study",
  repeatLesson: "Review explanation",
  decisions: "5 decisions",
  mixedBlock: "Mixed practice",
  lesson: "LESSON",
  currentModel: "Start with your current model",
  coldCheckHelp: "One unprompted decision. This is not an exam or proof of stable skill.",
  simpleTheory: "PLAIN EXPLANATION",
  heuristics: "THREE CUES",
  decisionTree: "CHECK ORDER",
  workedExample: "WORKED EXAMPLE",
  conclusion: "Takeaway",
  ruleBoundary: "Rule boundary",
  openLab: "Open lab",
  changedSituation: "CHANGED SITUATION",
  changedSituationTitle: "Same mechanism, different details",
  changedSituationHelp: "This tests transfer, not phrase recall.",
  explainBack: "EXPLAIN IT BACK",
  explainPlaceholder: "Explain it in 2–4 sentences…",
  saveExplanation: "Save explanation",
  tableCard: "TABLE CARD",
  finishLesson: "Finish lesson",
  lessonFinished: "LESSON COMPLETE",
  lessonIntroduced: "The mechanism has been introduced.",
  lessonNotMastered: "It has not yet been proven as a stable skill.",
  lessonNext: "Next: independent decisions and a delayed review.",
  saveReturn: "Save and return",
  chooseAction: "Choose an action",
  chooseReason: "Choose a reason",
  confidence: "Confidence",
  lockDecision: "Lock decision",
  workingAction: "Working action",
  why: "Why",
  assumptions: "Assumptions",
  conditions: "Conditions",
  reviewEyebrow: "REVIEW AND REPAIR",
  reviewTitle: "Later.",
  reviewEmphasis: "On a similar but new situation.",
  nothingDue: "Nothing is due right now.",
  reviewEmptyBody: "Targeted items appear after lessons and independent decisions.",
  allCardsDone: "All cards are complete.",
  showAnswer: "Show answer",
  forgot: "Forgot",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
  cardsBoundary: "Cards support recall, but do not by themselves prove retention.",
  skillMap: "SKILL MAP",
  mapTitle: "Evidence by mechanism,",
  mapEmphasis: "not course checkmarks.",
  theory: "Explanation",
  practice: "Practice",
  realHands: "REAL HANDS",
  fieldTitle: "Capture first.",
  fieldEmphasis: "Review second.",
  mechanism: "Mechanism",
  cuePrompt: "What did you notice before acting?",
  actionPrompt: "What did you do?",
  reasonPrompt: "Why?",
  cueBeforeAction: "The cue was noticed before the action",
  savePendingNote: "Save hand for review",
  insufficient: "Insufficient",
  needsRepair: "Needs repair",
  valid: "Validated",
  reviewLabel: "Review",
  diagnosticMeasureTitle: "Measure your current model.",
  diagnosticMeasureEmphasis: "Do not block learning.",
  coldAvailable: "T1 · COLD BASELINE AVAILABLE",
  postLearning: "T1 · CURRENT DIAGNOSTIC",
  coldIntro: "Ten unprompted decisions. Feedback stays hidden until the end.",
  postIntro: "Learning has already started. The result can guide the route, but it is not a cold baseline.",
  startT1: "Start T1",
  answersSaved: "answers saved",
  rawBoundary: "The file contains responses, not an automatic evaluation, and does not pretend otherwise.",
  downloadRaw: "Download responses",
  importScore: "Import score",
  actionDirection: "Action or direction",
  oneSentenceReason: "One-sentence reason",
  recordResponse: "Record response",
  coldInstructions: "Answer from your current process without opening charts or answer keys.",
  postInstructions: "Use your current model; the result will not be labelled a cold baseline.",
  mixedInstructions: "This run started before learning and continued after exposure. It cannot be interpreted as a cold baseline.",
  contentFallback: "This module's English copy is still under poker-aware editorial review. The reviewed Russian source is shown until approval.",
  translationPending: "EN REVIEW REQUIRED",
  sync: { loading: "loading", local: "local", syncing: "syncing", synced: "synced", offline: "offline", conflict: "conflict", error: "error" },
};

export const runtimeCopy: Record<LocaleCode, RuntimeCopy> = { ru, en };

export const moduleHeadings: Record<ModuleId, { en: { title: string; shortTitle: string; plainGoal: string; tableCue: string } }> = {
  geometry: { en: { title: "Effective depth and pot geometry", shortTitle: "Depth and SPR", plainGoal: "Identify how much money is actually in play against each opponent and how compressed the next decision will be.", tableCue: "Unit → effective stack → pot after the action." } },
  preflop: { en: { title: "Preflop structure for live cash", shortTitle: "Preflop structure", plainGoal: "Build decisions from position, effective depth, sizing and players left to act instead of memorising a large chart library.", tableCue: "Position → depth → sizing → players behind." } },
  blinds: { en: { title: "Blind source and range identity", shortTitle: "Blind ranges", plainGoal: "Keep SB and BB callers separate because they arrive postflop with different range shapes and incentives.", tableCue: "Who called → from which blind → what shape arrives?" } },
  filtering: { en: { title: "Exploit filters before adjustment", shortTitle: "Exploit filters", plainGoal: "Adjust only after the read is reliable, relevant to this branch and large enough to change the baseline decision.", tableCue: "Sample → branch relevance → compensation → adjustment." } },
  shape: { en: { title: "Bet-size range shape", shortTitle: "Size and shape", plainGoal: "Read what a small-wide or large-selective size does to both ranges before choosing a response.", tableCue: "Size → range shape → vulnerable class → response." } },
  aggression: { en: { title: "Aggression with a clear job", shortTitle: "Purposeful aggression", plainGoal: "Bet and raise for a concrete value, denial or bluff function rather than because a card looks aggressive.", tableCue: "Value first → bluff support → future streets." } },
  ancestry: { en: { title: "Range ancestry in 3-bet pots", shortTitle: "Range ancestry", plainGoal: "Trace how preflop composition and earlier actions constrain the range before making a postflop exploit.", tableCue: "Preflop source → prior actions → current branch." } },
  multiway: { en: { title: "Multiway responsibility and action order", shortTitle: "Multiway play", plainGoal: "Account for players behind, shared defence and reduced bluff support before importing a heads-up response.", tableCue: "Players behind → shared defence → field clearance." } },
  river: { en: { title: "River evidence before blockers", shortTitle: "River decisions", plainGoal: "Audit line ancestry and credible bluff supply before allowing a blocker to drive a large river decision.", tableCue: "Line → value supply → bluff supply → blocker." } },
  evidence: { en: { title: "Reads, evidence and confidence", shortTitle: "Evidence quality", plainGoal: "Separate observations from conclusions and scale confidence to the quality and relevance of the sample.", tableCue: "Observation → branch match → alternatives → confidence." } },
  transfer: { en: { title: "Transfer from study to live play", shortTitle: "Real-play transfer", plainGoal: "Recognise the cue before acting, explain the mechanism and verify it later in reviewed real hands.", tableCue: "Cue before action → decision → reason → review." } },
};

export const diagnosticEnglish: Record<string, { title: string; prompt: string }> = {
  "LD-001": { title: "Straddle denominator", prompt: "The game is $2/$5/$10 with a mandatory live straddle. Hero and the only relevant opponent each have $1,400. Which effective depth should drive the first strategic pass, why, and what is the same stack in ordinary big blinds?" },
  "LD-002": { title: "Pairwise multiway depth", prompt: "In a $1/$3 game, Hero has $900, Villain A $270 and Villain B $1,200. What is Hero's effective depth against each opponent? Can the whole pot be described by one effective-stack number?" },
  "LD-003": { title: "Blind source identity", prompt: "CO opens to 3bb. One A-7-2 rainbow flop is reached against a BB defend and another against an SB cold-call. Which caller is usually more condensed, and should the same c-bet plan be applied automatically?" },
  "LD-004": { title: "Value-heavy 3-bet defence", prompt: "At 150bb, HJ opens to 3bb and BTN 3-bets to 12bb. A reliable sample shows mostly premiums and strong broadways with few suited bluffs. Which family loses value first when defending: dominated offsuit big cards or the best suited connectors? Explain without naming an exact chart cell." },
  "LD-005": { title: "Over-wide 3-bet compensation", prompt: "CO calls a BTN 3-bet. BTN 3-bets clearly wider than normal, but on Q-7-4 rainbow still bets 25% with nearly the whole range. What compensation test is required, and how should OOP defence shift if BTN does not offset the extra preflop air with more checks?" },
  "LD-006": { title: "Small-wide vulnerable pair", prompt: "BTN versus BB, 200bb. Flop T-5-5 rainbow. BTN bets 25% with nearly the whole range. Compare T6s and KTs for BB: which top-pair family has the stronger directional raise incentive, and why? No exact frequency is required." },
  "LD-007": { title: "Large-selective changed situation", prompt: "Same BTN-versus-BB spot at 200bb on T-5-5 rainbow, but BTN now bets 80% with a selective polar range. What happens to the thin/protection raise branch with T6s compared with the earlier 25% near-range bet?" },
  "LD-008": { title: "Deep OOP protected call", prompt: "BTN versus BB, 200bb. Flop 8-7-6 two-tone. BTN bets 75% pot and BB holds TT. Should the hand automatically check-raise to avoid hard turns, or does it retain an important check-call function? Why?" },
  "LD-009": { title: "Sandwich shared defence", prompt: "HJ opens, BTN calls and BB calls. Flop K-9-7 two-tone. HJ bets; Hero is BTN with KQ and BB still has an uncapped continuing range behind. Should Hero defend as in heads-up and carry the full MDF burden? Name the main gate before calling or raising." },
  "LD-010": { title: "River blocker ancestry", prompt: "On the river Hero holds the nut-flush blocker and faces a jam after bet-call on the flop and overbet-call on the turn. There is no reliable population evidence for this branch. Which checks come before the blocker, and what answer is valid if credible bluff supply cannot be established?" },
};

export function classMessage(locale: LocaleCode, value: ResponseClass): string {
  const messages: Record<LocaleCode, Record<ResponseClass, string>> = {
    ru: {
      A: "Действие и причина верны.",
      B: "Причина верна, но действие нужно исправить.",
      C: "Действие верно, но причина ненадёжна.",
      D: "Нужно перестроить и действие, и объяснение.",
      E: "Базовая линия верна, но уверенность в отклонении завышена.",
      U: "Честное «недостаточно данных» допустимо в этой границе.",
    },
    en: {
      A: "The action and the reason are correct.",
      B: "The reason is sound, but the action needs repair.",
      C: "The action is correct, but the reason is unreliable.",
      D: "Both the action and the mechanism need rebuilding.",
      E: "The baseline is correct, but exploit confidence is overstated.",
      U: "An honest ‘insufficient evidence’ answer is valid at this boundary.",
    },
  };
  return messages[locale][value];
}
