"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allPracticalTableStates, practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession, isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { advanceIntegratedContinuity, recordIntegratedAnswerContinuity, recordIntegratedRoundStartContinuity, restoreIntegratedRound } from "../lib/practical-continuity-workspace";
import { INTEGRATED_SESSION_SIZE, recordIntegratedDecision, type IntegratedSessionItem } from "../lib/practical-integrated-session";
import { classifyPracticalIntegratedSessionState } from "../lib/practical-integrated-session-state";
import { createPracticalPerformanceEvent } from "../lib/practical-performance-telemetry";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDecisionFeedback from "./PracticalDecisionFeedback";
import PracticalTableStateStimulus from "./PracticalTableStateStimulus";

type Locale = "ru" | "en";
type RestoredPostAnswer = {
  decisionId: string;
  attemptId: string;
  actionId: string;
  reasonId: string;
  confidence: number;
  correct: boolean;
};
function optionText(option: { textRu: string; textEn: string }, locale: Locale) { return locale === "ru" ? option.textRu : option.textEn; }

function reasonCopy(locale: Locale, reason: IntegratedSessionItem["reason"]): string {
  const copy: Record<IntegratedSessionItem["reason"], { ru: string; en: string }> = {
    REPAIR: { ru: "Эта задача возвращает недавнюю ошибку на новом примере.", en: "This decision revisits a recent mistake with a different item." },
    RETENTION: { ru: "Пора проверить, сохранился ли навык после паузы.", en: "It is time to check whether the skill still holds after a delay." },
    TRANSFER: { ru: "Здесь проверяется тот же механизм при изменённых условиях.", en: "This tests the same mechanism after important conditions change." },
    REINFORCE: { ru: "Навыку нужна ещё самостоятельная практика.", en: "This skill needs more independent practice." },
    RECOGNITION: { ru: "Здесь важно сначала распознать нужный механизм.", en: "The first job here is to recognize the relevant mechanism." },
  };
  return copy[reason][locale];
}

export default function PracticalIntegratedSessionExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const {
    mastery: state,
    performance,
    studyWorkspace,
    setMasteryWithPerformanceAndStudyWorkspace,
    setStudyWorkspace,
    ready,
    recoveryBlocked,
  } = usePracticalProfileState();
  const [items, setItems] = useState<IntegratedSessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [initializedRevision, setInitializedRevision] = useState<number | null>(null);
  const [requestedFocus, setRequestedFocus] = useState<string | null | undefined>(undefined);
  const [workspaceRecovery, setWorkspaceRecovery] = useState(false);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [restoredPostAnswer, setRestoredPostAnswer] = useState<RestoredPostAnswer | null>(null);
  const [advancing, setAdvancing] = useState(false);
  const [startedAt, setStartedAt] = useState(() => new Date());

  useEffect(() => {
    const syncFocusFromUrl = () => setRequestedFocus(new URLSearchParams(window.location.search).get("focus"));
    syncFocusFromUrl();
    window.addEventListener("popstate", syncFocusFromUrl);
    return () => window.removeEventListener("popstate", syncFocusFromUrl);
  }, []);

  useEffect(() => {
    if (requestedFocus === undefined) return;
    setInitializedRevision(null);
    setItems([]);
    setIndex(0);
    setRestoredPostAnswer(null);
    setWorkspaceRecovery(false);
  }, [requestedFocus]);

  useEffect(() => {
    if (!ready || requestedFocus === undefined || initializedRevision !== null) return;
    const focusAdmissible = !requestedFocus || isIntegratedFocusAdmissible(state, requestedFocus);
    if (!focusAdmissible) {
      setItems([]);
      setIndex(0);
      setRestoredPostAnswer(null);
      setInitializedRevision(state.revision);
      return;
    }

    const restored = restoreIntegratedRound(studyWorkspace, state, requestedFocus);
    if (restored.status === "VALID") {
      setItems(restored.items);
      setIndex(restored.nextIndex);
      setRestoredPostAnswer(restored.postAnswerAttempt ? {
        decisionId: restored.postAnswerAttempt.decisionId,
        attemptId: restored.postAnswerAttempt.id,
        actionId: restored.postAnswerAttempt.actionId,
        reasonId: restored.postAnswerAttempt.reasonId,
        confidence: restored.postAnswerAttempt.confidence,
        correct: restored.postAnswerAttempt.correct,
      } : null);
      setInitializedRevision(state.revision);
      return;
    }
    if (restored.status === "STALE" || restored.status === "INVALID") {
      setWorkspaceRecovery(true);
      setInitializedRevision(state.revision);
      return;
    }

    setItems(buildAdaptiveIntegratedSession(state, new Date(), INTEGRATED_SESSION_SIZE, performance, requestedFocus));
    setIndex(0);
    setRestoredPostAnswer(null);
    setInitializedRevision(state.revision);
  }, [initializedRevision, performance, ready, requestedFocus, state, studyWorkspace]);

  const item = items[index] ?? null;
  const decision = item ? practicalDecisionById.get(item.decisionId) ?? null : null;
  const skill = item ? practicalSkillById.get(item.skillId) ?? null : null;
  const tableState = item ? allPracticalTableStates.find((candidate) => candidate.decisionId === item.decisionId) ?? null : null;
  const requestedSkill = requestedFocus ? practicalSkillById.get(requestedFocus) ?? null : null;
  const resolvedFocus = requestedFocus ?? null;
  const focusAdmissible = !resolvedFocus || isIntegratedFocusAdmissible(state, resolvedFocus);
  const presentationState = classifyPracticalIntegratedSessionState({
    workspaceRecovery,
    requestedFocus: resolvedFocus,
    focusAdmissible,
    itemCount: items.length,
    index,
  });
  const schedulingReasonCopy = item?.whyAfterAnswer
    ? reasonCopy(locale, item.reason)
    : (locale === "ru" ? "Эта задача выбрана как следующий полезный шаг." : "This decision was selected as the next useful step.");
  const score = useMemo(() => {
    const ids = new Set(items.map((candidate) => candidate.decisionId));
    const attempts = state.attempts.filter((attempt) => ids.has(attempt.decisionId));
    const latest = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) latest.set(attempt.decisionId, attempt);
    return { correct: [...latest.values()].filter((attempt) => attempt.correct).length, total: Math.min(index + (revealed ? 1 : 0), items.length) };
  }, [state, items, index, revealed]);

  useEffect(() => {
    const restored = restoredPostAnswer?.decisionId === item?.decisionId ? restoredPostAnswer : null;
    setActionId(restored?.actionId ?? "");
    setReasonId(restored?.reasonId ?? "");
    setConfidence(restored?.confidence ?? 65);
    setRevealed(Boolean(restored));
    setWasCorrect(restored?.correct ?? null);
    setAdvancing(false);
    setStartedAt(new Date());
  }, [item?.decisionId, restoredPostAnswer]);

  const submit = () => {
    if (!item || !decision || !actionId || !reasonId) return;
    const answeredAt = new Date();
    const nextState = recordIntegratedDecision(state, item, { actionId, reasonId, confidence, now: answeredAt });
    const attempt = nextState.attempts.at(-1);
    if (!attempt || attempt.decisionId !== decision.id) return;
    const nextWorkspace = recordIntegratedAnswerContinuity(studyWorkspace, nextState.contentVersion, {
      focusSkillId: requestedFocus ?? null,
      items,
      answeredIndex: index,
      attemptId: attempt.id,
    }, answeredAt);
    if (!nextWorkspace) {
      setWorkspaceRecovery(true);
      return;
    }
    const event = createPracticalPerformanceEvent({ decisionId: decision.id, actionId, reasonId, confidence, startedAt, answeredAt, mode: tableState ? "PERCEPTUAL_TABLE" : "TEXT_MIXED", scaffold: tableState ? tableState.scaffold : "hidden" });
    if (!setMasteryWithPerformanceAndStudyWorkspace(nextState, event, nextWorkspace)) return;
    setRestoredPostAnswer({
      decisionId: attempt.decisionId,
      attemptId: attempt.id,
      actionId: attempt.actionId,
      reasonId: attempt.reasonId,
      confidence: attempt.confidence,
      correct: attempt.correct,
    });
    setWasCorrect(attempt.correct);
    setRevealed(true);
  };

  const advance = () => {
    if (advancing || !item || !restoredPostAnswer || restoredPostAnswer.decisionId !== item.decisionId) return;
    setAdvancing(true);
    const nextWorkspace = advanceIntegratedContinuity(studyWorkspace, state.contentVersion, {
      focusSkillId: requestedFocus ?? null,
      items,
      answeredIndex: index,
      attemptId: restoredPostAnswer.attemptId,
    }, new Date());
    if (!nextWorkspace || !setStudyWorkspace(nextWorkspace)) {
      setAdvancing(false);
      setWorkspaceRecovery(true);
      return;
    }
    setRestoredPostAnswer(null);
    setIndex((value) => value + 1);
  };

  const startFreshRound = (focusSkillId: string | null) => {
    const startedAt = new Date();
    const focusAdmissible = !focusSkillId || isIntegratedFocusAdmissible(state, focusSkillId);
    const nextItems = focusAdmissible ? buildAdaptiveIntegratedSession(state, startedAt, INTEGRATED_SESSION_SIZE, performance, focusSkillId) : [];
    if (nextItems.length > 0) {
      const nextWorkspace = recordIntegratedRoundStartContinuity(studyWorkspace, state.contentVersion, {
        focusSkillId,
        items: nextItems,
      }, startedAt);
      if (!nextWorkspace || !setStudyWorkspace(nextWorkspace)) {
        setWorkspaceRecovery(true);
        return;
      }
    }
    setItems(nextItems);
    setIndex(0);
    setRestoredPostAnswer(null);
    setWorkspaceRecovery(false);
    setInitializedRevision(state.revision);
  };

  const continueWithGenericSession = () => {
    const nextUrl = new URL(window.location.href);
    nextUrl.searchParams.delete("focus");
    window.history.replaceState(window.history.state, "", `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`);
    setRequestedFocus(null);
    startFreshRound(null);
  };

  if (!ready || requestedFocus === undefined || initializedRevision === null) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Подбираем следующую практику…" : "Preparing your next practice…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><p>{locale === "ru" ? "Прогресс не будет перезаписан. Открой «Данные и восстановление» в инструментах Live Cash OS." : "Practical progress will not be overwritten. Open Data & Recovery in Live Cash OS tools."}</p><Link href="/tools">{locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →</Link></main>;

  if (presentationState === "RECOVERY") return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
    <p className="eyebrow">{locale === "ru" ? "ВОССТАНОВЛЕНИЕ ПРАКТИКИ" : "PRACTICE RECOVERY"}</p>
    <h1>{locale === "ru" ? "Сохранённый раунд больше нельзя продолжить точно" : "The saved round can no longer be resumed exactly"}</h1>
    <p>{locale === "ru" ? "Прогресс и уже записанные ответы сохранены. Чтобы не повторять ответ и не смешивать старую версию заданий с новой, начни новый раунд." : "Your progress and submitted answers are preserved. To avoid repeating an answer or mixing an old item set with new content, start a fresh round."}</p>
    <button className="primary" onClick={() => startFreshRound(requestedFocus ?? null)}>{locale === "ru" ? "Начать новый раунд" : "Start a fresh round"} <span>→</span></button>
  </main>;

  if (presentationState === "FOCUS_UNAVAILABLE") return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
    <p className="eyebrow">{locale === "ru" ? "ВЫБРАННЫЙ ФОКУС" : "REQUESTED FOCUS"}</p>
    <h1>{requestedSkill ? (locale === "ru" ? requestedSkill.titleRu : requestedSkill.titleEn) : (locale === "ru" ? "Этот навык пока недоступен" : "This skill is not available yet")}</h1>
    <p>{locale === "ru" ? "Сейчас этот навык нельзя честно поставить в самостоятельную практику: сначала нужны его обязательные предпосылки, знакомство с механизмом или достаточная проверенная база задач. Система не подменит его другой темой молча." : "This skill cannot be placed into independent practice yet: it first needs its required prerequisites, concept exposure, or enough supported practice material. The system will not silently substitute a different topic."}</p>
    <p><Link className="primary" href="/mastery/journey">{locale === "ru" ? "Продолжить основной маршрут" : "Continue the primary route"} →</Link> · <Link className="secondary" href="/mastery">{locale === "ru" ? "Вернуться к карте" : "Back to map"}</Link></p>
  </main>;

  if (presentationState === "GENERIC_EMPTY") return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
    <p className="eyebrow">{locale === "ru" ? "ПРАКТИКА" : "PRACTICE"}</p>
    <h1>{locale === "ru" ? "Сейчас нет подходящих задач для общей практики" : "No eligible mixed practice right now"}</h1>
    <p>{locale === "ru" ? "Это не завершённый раунд: при текущем прогрессе система не может честно подобрать самостоятельную задачу. Продолжи основной маршрут, чтобы открыть следующий допустимый материал, или проверь карту навыков." : "This is not a completed round: with your current progress, the system cannot truthfully schedule an independent item. Continue the primary route to unlock the next admissible material, or review the skill map."}</p>
    <p><Link className="primary" href="/mastery/journey">{locale === "ru" ? "Продолжить основной маршрут" : "Continue the primary route"} →</Link> · <Link className="secondary" href="/mastery">{locale === "ru" ? "Посмотреть карту" : "View map"}</Link></p>
  </main>;

  if (presentationState === "FOCUSED_EMPTY") return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
    <p className="eyebrow">{locale === "ru" ? "ВЫБРАННЫЙ ФОКУС" : "REQUESTED FOCUS"}</p>
    <h1>{requestedSkill ? (locale === "ru" ? requestedSkill.titleRu : requestedSkill.titleEn) : (locale === "ru" ? "Для этого фокуса сейчас нет полезной задачи" : "No useful item for this focus right now")}</h1>
    <p>{locale === "ru" ? "Этот навык доступен, но сейчас для него нет полезного нового задания: допустимые примеры либо были недавно решены, либо пока не дают новой самостоятельной проверки. Система не будет заполнять раунд точным повтором. Это не завершённый раунд." : "This skill is available, but there is no useful new item for it right now: admissible examples were either solved recently or do not currently add a new independent check. The system will not fill the round with an exact repeat. This is not a completed round."}</p>
    <p><Link className="primary" href="/mastery/journey">{locale === "ru" ? "Продолжить основной маршрут" : "Continue the primary route"} →</Link> · <Link className="secondary" href="/mastery">{locale === "ru" ? "Посмотреть карту" : "View map"}</Link></p>
  </main>;

  if (presentationState === "COMPLETE") return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}><section className="hero compact-hero">
    <p className="eyebrow">{locale === "ru" ? "ПРАКТИКА" : "PRACTICE"}</p>
    <h1>{locale === "ru" ? "Раунд завершён" : "Round complete"}</h1>
    <p>{locale === "ru" ? "Система учтёт ошибки, уверенность, повторение и уже знакомые навыки. Следующий раунд снова подберёт наиболее полезные решения — тебе не нужно выбирать режим вручную." : "The system will use your mistakes, confidence, review timing, and prior exposure to choose the next useful decisions. You do not need to pick a mode manually."}</p>
    <p><b>{score.correct}/{items.length}</b></p>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
      <button className="primary" onClick={continueWithGenericSession}>{locale === "ru" ? "Продолжить обучение" : "Continue learning"} <span>→</span></button>
      <Link className="secondary" href="/mastery">{locale === "ru" ? "Посмотреть карту" : "View map"}</Link>
    </div>
  </section></main>;

  if (!item || !decision) return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
    <p className="eyebrow">{locale === "ru" ? "ПРАКТИКА" : "PRACTICE"}</p>
    <h1>{locale === "ru" ? "Сначала познакомься с ключевыми моделями" : "Learn the core models first"}</h1>
    <p>{locale === "ru" ? "Практика не будет проверять незнакомые темы. Пройди быстрый старт, после чего система начнёт смешивать знакомые навыки и возвращать ошибки." : "Practice will not test unseen concepts. Finish Quick Start first; then the system will mix familiar skills and revisit mistakes."}</p>
    <p><Link href="/mastery/journey">{locale === "ru" ? "Быстрый старт" : "Quick Start"} →</Link> · <Link href="/mastery">{locale === "ru" ? "Карта" : "Map"} →</Link></p>
  </main>;

  const focusedTitle = requestedFocus && requestedSkill ? (locale === "ru" ? requestedSkill.titleRu : requestedSkill.titleEn) : null;

  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{focusedTitle
        ? (locale === "ru" ? `ПРАКТИКА · ${focusedTitle} · ${index + 1}/${items.length}` : `PRACTICE · ${focusedTitle} · ${index + 1}/${items.length}`)
        : (locale === "ru" ? `ПРАКТИКА · ${index + 1}/${items.length}` : `PRACTICE · ${index + 1}/${items.length}`)}</p>
      <h1>{locale === "ru" ? "Прими решение до подсказки" : "Decide before the reveal"}</h1>
      <p>{focusedTitle
        ? (locale === "ru" ? "Фокус раунда задан заранее; каждое решение всё равно принимай до разбора ответа." : "This round has a fixed focus; still make each decision before the answer is revealed.")
        : (locale === "ru" ? "Тема скрыта до ответа. Так система проверяет, узнаёшь ли ты нужный механизм без названия раздела." : "The topic stays hidden until you answer, so the system can test whether you recognize the mechanism without a topic label.")}</p>
      <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
    </section>
    <section className="today-card" style={{ marginTop: 20 }} data-practical-decision-id={decision.id}>
      {tableState ? <PracticalTableStateStimulus state={tableState} locale={locale} /> : null}
      <h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2><p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>
      <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}><legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>{decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}><input type="radio" name={`${decision.id}-action`} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {optionText(option, locale)}</label>)}</fieldset>
      <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}><legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>{decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}><input type="radio" name={`${decision.id}-reason`} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {optionText(option, locale)}</label>)}</fieldset>
      <label style={{ display: "block", marginBottom: 15 }}>{locale === "ru" ? "Уверенность" : "Confidence"}: <b>{confidence}%</b><br /><input aria-label={locale === "ru" ? "Уверенность" : "Confidence"} type="range" min="0" max="100" value={confidence} disabled={revealed} onChange={(event) => setConfidence(Number(event.target.value))} /></label>
      {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Ответить" : "Answer"} <span>→</span></button> : <div>
        <h3>{wasCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужно исправить" : "Repair needed")}</h3>
        <PracticalDecisionFeedback decision={decision} locale={locale} correct={Boolean(wasCorrect)} selectedActionId={actionId} selectedReasonId={reasonId} />
        <div className="today-card" style={{ marginTop: 14 }}>
          <p className="eyebrow">{locale === "ru" ? "ЧТО ПРОВЕРЯЛОСЬ" : "WHAT THIS TESTED"}</p>
          <p><b>{locale === "ru" ? "Навык:" : "Skill:"}</b> {skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : (locale === "ru" ? "Знакомый навык" : "Known skill")}</p>
          <p>{schedulingReasonCopy}</p>
          {item.retentionTierDays ? <p><b>{locale === "ru" ? "Вернётся позже:" : "Returns later:"}</b> {item.retentionTierDays} {locale === "ru" ? "дн. · на новом примере" : "d · with a different item"}</p> : null}
        </div>
        <button className="primary" disabled={advancing} onClick={advance} style={{ marginTop: 14 }}>{locale === "ru" ? "Следующее решение" : "Next decision"} <span>→</span></button>
      </div>}
    </section>
  </main>;
}
