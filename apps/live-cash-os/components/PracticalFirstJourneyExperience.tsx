"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey";
import { practicalAnchors, practicalDecisionById, practicalRuleById, practicalSkillById } from "../content/practical-mastery";
import {
  clearQuickStartContinuity,
  restoreQuickStartDraft,
  restoreQuickStartPostAnswer,
  withQuickStartDraft,
  withQuickStartPostAnswer,
} from "../lib/practical-continuity-workspace";
import type { FirstJourneyPresentationState } from "../lib/practical-first-journey-authority";
import { markPracticalConceptTaught, recordPracticalDecision } from "../lib/practical-mastery-core";
import { firstJourneyProgress, nextFirstJourneyDecision, recommendFirstJourneyStep } from "../lib/practical-first-journey";
import { usePracticalLocale } from "../lib/use-practical-locale";
import type { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDecisionFeedback from "./PracticalDecisionFeedback";

type PracticalFirstJourneyProfileController = ReturnType<typeof usePracticalProfileState>;

export default function PracticalFirstJourneyExperience({
  presentation,
  profile,
}: {
  presentation: FirstJourneyPresentationState | null;
  profile: PracticalFirstJourneyProfileController;
}) {
  const [locale, setLocale] = usePracticalLocale();
  const {
    mastery: state,
    studyWorkspace,
    setMastery,
    setMasteryWithStudyWorkspace,
    setStudyWorkspace,
    ready,
    recoveryBlocked,
  } = profile;
  const [practiceStarted, setPracticeStarted] = useState(false);
  const [answeredDecisionId, setAnsweredDecisionId] = useState<string | null>(null);
  const [answeredSkillId, setAnsweredSkillId] = useState<string | null>(null);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [continuityChecked, setContinuityChecked] = useState(false);

  const recommendation = useMemo(() => recommendFirstJourneyStep(state), [state]);
  const progress = useMemo(() => firstJourneyProgress(state), [state]);
  const presentationSkillId = answeredDecisionId && answeredSkillId ? answeredSkillId : recommendation?.skillId ?? null;
  const skill = presentationSkillId ? practicalSkillById.get(presentationSkillId) ?? null : null;
  const journeyStep = presentationSkillId ? firstJourneyStepForSkill(presentationSkillId) : null;
  const rules = journeyStep?.memoryRuleIds.map((ruleId) => practicalRuleById.get(ruleId)).filter(Boolean) ?? [];
  const rule = rules[0] ?? null;
  const skillAnchors = skill ? practicalAnchors.filter((item) => item.skillId === skill.id) : [];
  const anchor = skillAnchors[0] ?? null;
  const contrastAnchor = skillAnchors.find((item) => item.kind === "changed" || item.kind === "boundary") ?? null;
  const nextDecision = skill && state.skills[skill.id]?.conceptTaught ? nextFirstJourneyDecision(state, skill.id) : null;
  const decision = answeredDecisionId ? practicalDecisionById.get(answeredDecisionId) ?? nextDecision : nextDecision;

  useEffect(() => {
    if (!ready || recoveryBlocked || continuityChecked || presentation === null) return;
    const restored = restoreQuickStartPostAnswer(studyWorkspace, state);
    if (restored.status === "VALID") {
      setPracticeStarted(true);
      setAnsweredDecisionId(restored.decisionId);
      setAnsweredSkillId(restored.skillId);
      setActionId(restored.attempt.actionId);
      setReasonId(restored.attempt.reasonId);
      setAnswerRevealed(true);
      setLastCorrect(restored.attempt.correct);
    }
    setContinuityChecked(true);
  }, [continuityChecked, presentation, ready, recoveryBlocked, state, studyWorkspace]);

  useEffect(() => {
    if (!continuityChecked || answeredDecisionId || presentation !== "ACTIVE" || !skill || !decision) return;
    const restored = restoreQuickStartDraft(studyWorkspace, state, skill.id, decision.id);
    if (restored.status === "VALID") {
      setPracticeStarted(true);
      setActionId(restored.selectedActionId ?? "");
      setReasonId(restored.selectedReasonId ?? "");
    } else {
      setActionId("");
      setReasonId("");
    }
    setAnsweredSkillId(null);
    setAnswerRevealed(false);
    setLastCorrect(null);
  }, [answeredDecisionId, continuityChecked, decision, presentation, skill, state, studyWorkspace]);

  const startPractice = () => {
    if (!skill) return;
    setPracticeStarted(true);
    if (!state.skills[skill.id]?.conceptTaught) setMastery(markPracticalConceptTaught(state, skill.id));
  };

  const persistDraft = (selectedActionId: string | null, selectedReasonId: string | null) => {
    if (!decision || !skill || answerRevealed) return false;
    const nextWorkspace = withQuickStartDraft(studyWorkspace, state.contentVersion, {
      skillId: skill.id,
      decisionId: decision.id,
      selectedActionId,
      selectedReasonId,
    });
    if (nextWorkspace === studyWorkspace) return false;
    return setStudyWorkspace(nextWorkspace);
  };

  const selectAction = (nextActionId: string) => {
    if (persistDraft(nextActionId, reasonId || null)) setActionId(nextActionId);
  };

  const selectReason = (nextReasonId: string) => {
    if (persistDraft(actionId || null, nextReasonId)) setReasonId(nextReasonId);
  };

  const submitDecision = () => {
    if (!decision || !skill || !actionId || !reasonId) return;
    const nextState = recordPracticalDecision(state, { decisionId: decision.id, actionId, reasonId, confidence: 65 });
    const attempt = nextState.attempts.at(-1);
    if (!attempt || attempt.decisionId !== decision.id) return;
    const nextWorkspace = withQuickStartPostAnswer(studyWorkspace, nextState.contentVersion, {
      skillId: skill.id,
      decisionId: decision.id,
      attemptId: attempt.id,
    });
    if (!setMasteryWithStudyWorkspace(nextState, nextWorkspace)) return;
    setAnsweredDecisionId(decision.id);
    setAnsweredSkillId(skill.id);
    setLastCorrect(attempt.correct);
    setAnswerRevealed(true);
  };

  const advanceDecision = () => {
    const nextWorkspace = clearQuickStartContinuity(studyWorkspace, state.contentVersion);
    if (nextWorkspace !== studyWorkspace && !setStudyWorkspace(nextWorkspace)) return;
    setPracticeStarted(false);
    setAnsweredDecisionId(null);
    setAnsweredSkillId(null);
    setActionId("");
    setReasonId("");
    setAnswerRevealed(false);
    setLastCorrect(null);
  };

  if (!ready) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><p>{locale === "ru" ? "Ничего не будет перезаписано. Открой «Данные и восстановление» в инструментах Live Cash OS." : "Nothing will be overwritten. Open Data & Recovery in Live Cash OS tools."}</p><Link href="/tools">{locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →</Link></main>;
  if (!continuityChecked || presentation === null) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Восстанавливаем текущий шаг…" : "Restoring your current step…"}</p></main>;

  if (!answeredDecisionId && presentation === "COMPLETE") {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <p className="eyebrow">{locale === "ru" ? "БЫСТРЫЙ СТАРТ" : "QUICK START"}</p>
      <h1>{locale === "ru" ? "Быстрый старт завершён" : "Quick start complete"}</h1>
      <p>{locale === "ru" ? `Пройдено ${progress.reached} из ${progress.total} ключевых моделей. Это не означает полное освоение: дальше система будет смешивать задачи, возвращать ошибки, менять условия и позже проверять сохранение навыка после паузы.` : `You have completed ${progress.reached} of ${progress.total} core models. This is not full mastery: the system will now mix decisions, revisit mistakes, change conditions, and later test retention after a delay.`}</p>
      <p><b>{progress.reached}/{progress.total}</b></p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}><Link className="primary" href="/mastery/session">{locale === "ru" ? "Продолжить обучение →" : "Continue learning →"}</Link><Link className="secondary" href="/mastery">{locale === "ru" ? "Посмотреть карту" : "View map"}</Link></div>
    </main>;
  }

  if (!answeredDecisionId && presentation === "BLOCKED") {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <p className="eyebrow">{locale === "ru" ? "БЫСТРЫЙ СТАРТ" : "QUICK START"}</p>
      <h1>{locale === "ru" ? "Быстрый старт ещё не завершён" : "Quick Start is not complete yet"}</h1>
      <p>{locale === "ru" ? `Пройдено ${progress.reached} из ${progress.total}. Сейчас нет следующего допустимого шага для Quick Start. Система не будет выдавать незавершённый маршрут за завершённый и не станет придумывать прогресс.` : `${progress.reached} of ${progress.total} are complete. There is no currently admissible next Quick Start step. The system will not present an incomplete route as complete or fabricate progress.`}</p>
      <p className="support">{locale === "ru" ? "Вернись к карте обучения: следующий шаг появится, когда его предпосылки и доступная практика будут действительно готовы." : "Return to the learning map. The next step will appear when its prerequisites and supported practice are actually available."}</p>
      <Link className="primary" href="/mastery">{locale === "ru" ? "Вернуться к карте →" : "Back to map →"}</Link>
    </main>;
  }

  if (!skill || !journeyStep) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Сохранённый шаг больше недоступен. Вернись к карте обучения." : "The saved step is no longer available. Return to the learning map."}</p><Link href="/mastery">{locale === "ru" ? "Карта обучения" : "Learning map"} →</Link></main>;

  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? `БЫСТРЫЙ СТАРТ · ШАГ ${journeyStep.order} ИЗ ${progress.total}` : `QUICK START · STEP ${journeyStep.order} OF ${progress.total}`}</p>
      <h1>{locale === "ru" ? skill.titleRu : skill.titleEn}</h1>
      <p>{locale === "ru" ? journeyStep.purposeRu : journeyStep.purposeEn}</p>
      <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
    </section>

    {!practiceStarted ? <>
      <section className="today-card" style={{ marginTop: 20 }}>
        <p className="eyebrow">{locale === "ru" ? "ГДЕ ЭТО НУЖНО" : "WHERE THIS MATTERS"}</p>
        <p>{locale === "ru" ? journeyStep.tableUseRu : journeyStep.tableUseEn}</p>
      </section>

      <section className="surface" style={{ marginTop: 20 }}>
        <p className="eyebrow">{locale === "ru" ? "МЕХАНИЗМ" : "MECHANISM"}</p>
        {rule ? <>
          <h2>{locale === "ru" ? rule.defaultRu : rule.defaultEn}</h2>
          <p><b>{locale === "ru" ? "Почему:" : "Why:"}</b> {locale === "ru" ? rule.whyRu : rule.whyEn}</p>
          <p><b>{locale === "ru" ? "Когда правило меняется:" : "When it changes:"}</b> {(locale === "ru" ? rule.reversalsRu : rule.reversalsEn).join(" · ")}</p>
        </> : anchor ? <>
          <h2>{locale === "ru" ? anchor.promptRu : anchor.promptEn}</h2>
          <p><b>{locale === "ru" ? "Ответ:" : "Answer:"}</b> {locale === "ru" ? anchor.answerRu : anchor.answerEn}</p>
          <p>{locale === "ru" ? anchor.rationaleRu : anchor.rationaleEn}</p>
        </> : <p>{locale === "ru" ? skill.objectiveRu : `Use ${skill.titleEn} reliably in independent decisions and changed conditions.`}</p>}

        {contrastAnchor && contrastAnchor.id !== anchor?.id ? <div className="today-card" style={{ marginTop: 16 }}>
          <p className="eyebrow">{locale === "ru" ? "ИЗМЕНИ ОДНО УСЛОВИЕ" : "CHANGE ONE CONDITION"}</p>
          <p>{locale === "ru" ? contrastAnchor.promptRu : contrastAnchor.promptEn}</p>
          <p><b>{locale === "ru" ? "Что меняется:" : "What changes:"}</b> {locale === "ru" ? contrastAnchor.answerRu : contrastAnchor.answerEn}</p>
        </div> : rule ? <p className="support">{locale === "ru" ? rule.transferCueRu : rule.transferCueEn}</p> : null}

        <button className="primary" onClick={startPractice} style={{ marginTop: 16 }}>{locale === "ru" ? "Проверить на примере" : "Try an example"} <span>→</span></button>
      </section>
    </> : null}

    {practiceStarted && decision ? <section className="today-card" style={{ marginTop: 20 }}>
      <p className="eyebrow">{locale === "ru" ? (journeyStep.requiresHiddenCue ? "САМОСТОЯТЕЛЬНАЯ ПРОВЕРКА" : "ТЕПЕРЬ ТЫ") : (journeyStep.requiresHiddenCue ? "INDEPENDENT CHECK" : "YOUR TURN")}</p>
      <h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2><p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>
      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}><legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>{decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 8 }}><input type="radio" name={`${decision.id}-a`} checked={actionId === option.id} disabled={answerRevealed} onChange={() => selectAction(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}</label>)}</fieldset>
      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}><legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>{decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 8 }}><input type="radio" name={`${decision.id}-r`} checked={reasonId === option.id} disabled={answerRevealed} onChange={() => selectReason(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}</label>)}</fieldset>
      {!answerRevealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submitDecision}>{locale === "ru" ? "Ответить" : "Answer"} <span>→</span></button> : <div>
        <h3>{lastCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужно исправить" : "Repair needed")}</h3>
        <PracticalDecisionFeedback decision={decision} locale={locale} correct={Boolean(lastCorrect)} />
        <p className="support">{locale === "ru" ? "Это только первый контакт с навыком. Система вернёт его в новых ситуациях и позже проверит после паузы." : "This is only the first contact with the skill. The system will revisit it in new situations and later after a delay."}</p>
        <button className="secondary" onClick={advanceDecision}>{locale === "ru" ? "Следующий пример" : "Next example"} <span>→</span></button>
      </div>}
    </section> : practiceStarted ? <section className="today-card" style={{ marginTop: 20 }}><p>{locale === "ru" ? "Для этого навыка сейчас нет следующей независимой задачи. Система не будет засчитывать прогресс без новой проверки." : "There is no next independent item for this skill right now. The system will not grant progress without another check."}</p></section> : null}
  </main>;
}