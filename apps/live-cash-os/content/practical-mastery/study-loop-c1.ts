export const STUDY_LOOP_SOURCE_REFS = ["FTGU-E30", "SLC-M07-L63"] as const;

export const STUDY_LOOP_STAGES = [
  "FOCUS",
  "PLAY_CAPTURE",
  "CAUSAL_REVIEW",
  "COMPRESS",
  "TRANSFER_TEST",
  "DELAYED_RETEST",
] as const;

export type StudyLoopStage = (typeof STUDY_LOOP_STAGES)[number];

export type StudyLoopStep = {
  id: StudyLoopStage;
  titleRu: string;
  titleEn: string;
  instructionRu: string;
  instructionEn: string;
  evidenceRule: string;
  sourceRefs: readonly string[];
};

export const practicalStudyLoop: StudyLoopStep[] = [
  {
    id: "FOCUS",
    titleRu: "Один фокус до игры",
    titleEn: "One focus before play",
    instructionRu: "Выбери один текущий mechanism/repair cue. Не пытайся держать в голове весь курс.",
    instructionEn: "Choose one current mechanism/repair cue. Do not try to hold the whole course in working memory.",
    evidenceRule: "Use current scheduler/repair truth; a focus note is not mastery evidence.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "PLAY_CAPTURE",
    titleRu: "Сохрани неопределённость, не результат",
    titleEn: "Capture uncertainty, not the result",
    instructionRu: "После игры сохрани 1–3 решения, где reasoning был неуверенным или конфликтовал с текущей моделью. Выигрыш/проигрыш банка сам по себе не делает решение хорошим/плохим.",
    instructionEn: "After play, save 1–3 decisions where reasoning was uncertain or conflicted with the current model. Winning or losing the pot does not itself make the decision good or bad.",
    evidenceRule: "Capture is an input to review; it does not advance mastery on its own.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "CAUSAL_REVIEW",
    titleRu: "Найди причину ошибки",
    titleEn: "Find the causal error",
    instructionRu: "Разбирай одну руку через decision state: что было известно, какой trigger был пропущен, какой mechanism применён неверно и какая граница правила нарушена.",
    instructionEn: "Review one hand through the decision state: what was known, which trigger was missed, which mechanism was misapplied and which rule boundary failed.",
    evidenceRule: "Prefer the existing recognition/reasoning/transfer/boundary repair taxonomy over topic repetition.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "COMPRESS",
    titleRu: "Сожми repair до usable rule",
    titleEn: "Compress the repair into a usable rule",
    instructionRu: "Запиши Trigger → Meaning → Action + reversal/boundary. Не сохраняй solver action без assumptions.",
    instructionEn: "Write Trigger → Meaning → Action plus reversal/boundary. Do not save a solver action without its assumptions.",
    evidenceRule: "A written rule is a study artifact, not proof of decision competence.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "TRANSFER_TEST",
    titleRu: "Измени одну переменную",
    titleEn: "Change one variable",
    instructionRu: "Проверь правило на changed-node или topic-hidden rep. Если вывод не меняется там, где causal variable изменилась, repair не усвоен.",
    instructionEn: "Test the rule on a changed-node or topic-hidden rep. If the conclusion stays fixed when a causal variable changes, the repair is not learned.",
    evidenceRule: "Use ordinary Practical Mastery scored evidence; do not create a parallel study score.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "DELAYED_RETEST",
    titleRu: "Вернись позже без подсказки",
    titleEn: "Return later without the cue",
    instructionRu: "После успешного repair верни механизм в delayed/hidden practice. Один правильный ответ сразу после разбора не считается mastery.",
    instructionEn: "After a successful repair, return the mechanism to delayed/hidden practice. One correct answer immediately after review is not mastery.",
    evidenceRule: "Existing 1/3/7-day non-identical retention remains the authority.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
];

export const sessionPerformanceChecks = [
  {
    id: "AUTOPILOT",
    promptRu: "Я всё ещё называю trigger/mechanism до action или уже кликаю по привычке?",
    promptEn: "Am I still naming the trigger/mechanism before acting, or am I clicking on habit?",
    responseRu: "Если autopilot заметен — уменьшить объём и вернуть один focus cue; не придумывать новый strategy rule.",
    responseEn: "If autopilot is present, reduce volume and restore one focus cue; do not invent a new strategy rule.",
    sourceRefs: ["FTGU-E30"],
  },
  {
    id: "RESULT_ORIENTATION",
    promptRu: "Я оцениваю decision по reasoning или по тому, выигрался банк?",
    promptEn: "Am I evaluating the decision by reasoning or by whether the pot was won?",
    responseRu: "Вернуться к информации, доступной в момент решения; outcome — не grading authority.",
    responseEn: "Return to the information available at decision time; outcome is not the grading authority.",
    sourceRefs: ["FTGU-E30"],
  },
  {
    id: "OVERLOAD",
    promptRu: "Фокус распался из-за слишком большого study/play volume?",
    promptEn: "Has focus degraded because study/play volume is too high?",
    responseRu: "Смешать play, review, study и recovery вместо продолжения одного режима через ухудшение качества.",
    responseEn: "Mix play, review, study and recovery instead of extending one mode through declining quality.",
    sourceRefs: ["FTGU-E30"],
  },
] as const;
