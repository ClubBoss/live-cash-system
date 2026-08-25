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
  evidenceRuleRu: string;
  evidenceRule: string;
  learnerEvidenceRuleRu: string;
  learnerEvidenceRule: string;
  sourceRefs: readonly string[];
};

export const practicalStudyLoop: StudyLoopStep[] = [
  {
    id: "FOCUS",
    titleRu: "Один фокус до игры",
    titleEn: "One focus before play",
    instructionRu: "Выбери один механизм или одну текущую ошибку. Не пытайся держать в голове весь курс.",
    instructionEn: "Choose one current mechanism/repair cue. Do not try to hold the whole course in working memory.",
    evidenceRuleRu: "Фокус бери из текущих ошибок и рекомендаций. Одна заметка сама по себе не доказывает навык.",
    evidenceRule: "Use current scheduler/repair truth; a focus note is not mastery evidence.",
    learnerEvidenceRuleRu: "Выбирай фокус из ошибок, которые ещё повторяются, или из предложенного следующего навыка. Сам факт записи ещё не означает, что навык усвоен.",
    learnerEvidenceRule: "Choose the focus from mistakes that are still showing up or from the suggested next skill. Writing it down does not prove the skill is learned.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "PLAY_CAPTURE",
    titleRu: "Сохрани неопределённость, не результат",
    titleEn: "Capture uncertainty, not the result",
    instructionRu: "После игры сохрани 1–3 решения, где ты не был уверен в логике или заметил противоречие со своей моделью. Выигранный или проигранный банк сам по себе не делает решение хорошим или плохим.",
    instructionEn: "After play, save 1–3 decisions where reasoning was uncertain or conflicted with the current model. Winning or losing the pot does not itself make the decision good or bad.",
    evidenceRuleRu: "Сохранённая рука — материал для разбора, а не автоматический прогресс навыка.",
    evidenceRule: "Capture is an input to review; it does not advance mastery on its own.",
    learnerEvidenceRuleRu: "Сохранённая рука — материал для разбора. Она сама по себе ещё не показывает, что решение уже стало надёжным.",
    learnerEvidenceRule: "A saved hand is material for review. By itself, it does not show that the decision process is already reliable.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "CAUSAL_REVIEW",
    titleRu: "Найди причину ошибки",
    titleEn: "Find the causal error",
    instructionRu: "Разбери одну руку по состоянию в момент решения: что было известно, какой сигнал ты пропустил, какой механизм применил неверно и где перестало работать правило.",
    instructionEn: "Review one hand through the decision state: what was known, which trigger was missed, which mechanism was misapplied and which rule boundary failed.",
    evidenceRuleRu: "Исправляй причину: распознавание, объяснение, перенос или границу правила — а не просто повторяй ту же тему.",
    evidenceRule: "Prefer the existing recognition/reasoning/transfer/boundary repair taxonomy over topic repetition.",
    learnerEvidenceRuleRu: "Исправляй конкретную причину: пропущенный сигнал, ошибочную логику, плохой перенос или границу правила — а не просто повторяй название темы.",
    learnerEvidenceRule: "Fix the specific failure: a missed cue, wrong reasoning, poor transfer, or a rule boundary. Do not just repeat the topic name.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "COMPRESS",
    titleRu: "Сожми вывод до рабочего правила",
    titleEn: "Compress the repair into a usable rule",
    instructionRu: "Запиши: Сигнал → Что он значит → Действие → Когда правило перестаёт работать. Не сохраняй действие из solver без условий задачи.",
    instructionEn: "Write Trigger → Meaning → Action plus reversal/boundary. Do not save a solver action without its assumptions.",
    evidenceRuleRu: "Записанное правило помогает учиться, но ещё не доказывает, что ты применишь его за столом.",
    evidenceRule: "A written rule is a study artifact, not proof of decision competence.",
    learnerEvidenceRuleRu: "Записанное правило помогает учиться, но его ещё нужно проверить в новых решениях без подсказки.",
    learnerEvidenceRule: "A written rule is a study aid. It still has to work in fresh decisions without a hint.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "TRANSFER_TEST",
    titleRu: "Измени одну переменную",
    titleEn: "Change one variable",
    instructionRu: "Проверь правило в похожем споте, изменив одну важную переменную, или реши задачу без названия темы. Если вывод не меняется там, где должна измениться причина решения, правило ещё не усвоено.",
    instructionEn: "Test the rule on a changed-node or topic-hidden rep. If the conclusion stays fixed when a causal variable changes, the repair is not learned.",
    evidenceRuleRu: "Используй обычные задачи Practical Mastery; отдельной оценки за работу над игрой нет.",
    evidenceRule: "Use ordinary Practical Mastery scored evidence; do not create a parallel study score.",
    learnerEvidenceRuleRu: "Проверь тот же механизм в новой задаче с изменёнными условиями. Отдельного балла за эту страницу работы над игрой нет.",
    learnerEvidenceRule: "Retest the same mechanism in a fresh spot with changed conditions. This study page does not create a separate score.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
  {
    id: "DELAYED_RETEST",
    titleRu: "Вернись позже без подсказки",
    titleEn: "Return later without the cue",
    instructionRu: "После успешного исправления вернись к механизму позже и без подсказки. Один правильный ответ сразу после разбора ещё не означает, что навык закрепился.",
    instructionEn: "After a successful repair, return the mechanism to delayed/hidden practice. One correct answer immediately after review is not mastery.",
    evidenceRuleRu: "Проверка через 1/3/7 дней остаётся на новых, не идентичных задачах.",
    evidenceRule: "Existing 1/3/7-day non-identical retention remains the authority.",
    learnerEvidenceRuleRu: "Вернись через 1, 3 или 7 дней и реши другую, не идентичную задачу без подсказки.",
    learnerEvidenceRule: "Come back after 1, 3, or 7 days and use a different, non-identical spot without the cue.",
    sourceRefs: STUDY_LOOP_SOURCE_REFS,
  },
];

export const sessionPerformanceChecks = [
  {
    id: "AUTOPILOT",
    promptRu: "Я всё ещё замечаю ключевой сигнал до действия или уже играю по привычке?",
    promptEn: "Am I still naming the trigger/mechanism before acting, or am I clicking on habit?",
    responseRu: "Если включился автопилот — сократи объём и верни один простой фокус. Не придумывай новое стратегическое правило.",
    responseEn: "If autopilot is present, reduce volume and restore one focus cue; do not invent a new strategy rule.",
    sourceRefs: ["FTGU-E30"],
  },
  {
    id: "RESULT_ORIENTATION",
    promptRu: "Я оцениваю решение по своей логике в момент действия или по тому, выигрался банк?",
    promptEn: "Am I evaluating the decision by reasoning or by whether the pot was won?",
    responseRu: "Вернись к информации, которая была доступна в момент решения. Результат банка не оценивает качество решения сам по себе.",
    responseEn: "Return to the information available at decision time; outcome is not the grading authority.",
    sourceRefs: ["FTGU-E30"],
  },
  {
    id: "OVERLOAD",
    promptRu: "Я потерял концентрацию из-за слишком большого объёма игры или учёбы?",
    promptEn: "Has focus degraded because study/play volume is too high?",
    responseRu: "Чередуй игру, разбор, учёбу и отдых вместо того, чтобы продолжать один режим после заметного падения качества.",
    responseEn: "Mix play, review, study and recovery instead of extending one mode through declining quality.",
    sourceRefs: ["FTGU-E30"],
  },
] as const;
