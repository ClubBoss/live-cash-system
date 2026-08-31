"use client";

import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { practicalSkillById } from "../content/practical-mastery";
import {
  practicalImprovementTopics,
  type PracticalImprovementTopicKey,
} from "../content/practical-mastery/improvement-topics";
import {
  buildAdaptiveIntegratedSession,
  isIntegratedFocusAdmissible,
  requestedIntegratedFocusItem,
} from "../lib/practical-adaptive-session";
import {
  activeIntegratedRoundResume,
  recordIntegratedRoundStartContinuity,
  type ActiveIntegratedRoundResume,
} from "../lib/practical-continuity-workspace";
import { currentPracticalMistakes } from "../lib/practical-current-mistakes";
import {
  practicalMistakeLearnerPresentation,
  reviewedRealHandRepairSkillIds,
  type PracticalImprovementLocale,
} from "../lib/practical-improvement-context";
import {
  resolvePracticalImprovementFocus,
  type PracticalImprovementResolution,
} from "../lib/practical-improvement-focus";
import { INTEGRATED_SESSION_SIZE } from "../lib/practical-integrated-session";
import { recommendNextPracticalSkill, type PracticalMasteryState } from "../lib/practical-mastery-core";
import { hasFocusedPracticalTableState } from "../lib/practical-perceptual-focus";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDocumentLink from "./PracticalDocumentLink";
import PracticalNextLearningLink from "./PracticalNextLearningLink";

function skillTitle(skillId: string, locale: PracticalImprovementLocale): string {
  const skill = practicalSkillById.get(skillId);
  if (!skill) return locale === "ru" ? "Игровой навык" : "Poker skill";
  return locale === "ru" ? skill.titleRu : skill.titleEn;
}

function exactPracticeAvailable(state: PracticalMasteryState, skillId: string): boolean {
  return isIntegratedFocusAdmissible(state, skillId)
    && requestedIntegratedFocusItem(state, skillId) !== null;
}

function ExactPracticeAction({
  skillId,
  available,
  activeResume,
  locale,
  startFailed,
  onStart,
}: {
  skillId: string;
  available: boolean;
  activeResume: ActiveIntegratedRoundResume | null;
  locale: PracticalImprovementLocale;
  startFailed: boolean;
  onStart: (skillId: string) => void;
}) {
  if (activeResume) {
    if (activeResume.focusSkillId === skillId) {
      return <PracticalDocumentLink className="primary" href={activeResume.href}>
        {locale === "ru" ? "Продолжить этот раунд" : "Continue this round"} <span>→</span>
      </PracticalDocumentLink>;
    }
    return <span className="secondary" aria-disabled="true" data-improve-action="active-round-first">
      {locale === "ru" ? "Сначала закончи текущий раунд" : "Finish the current round first"}
    </span>;
  }

  if (!available || startFailed) {
    return <span className="secondary" aria-disabled="true" data-improve-action={startFailed ? "no-useful-item" : "unavailable"}>
      {startFailed
        ? (locale === "ru" ? "Сейчас нет полезной точной задачи" : "No useful exact item is ready right now")
        : (locale === "ru" ? "Самостоятельная практика пока недоступна" : "Independent practice is not available yet")}
    </span>;
  }

  return <button className="primary" type="button" onClick={() => onStart(skillId)}>
    {locale === "ru" ? "Поработать над этим" : "Work on this"} <span>→</span>
  </button>;
}

function ExactTableReadingAction({
  skillId,
  available,
  activeResume,
  locale,
}: {
  skillId: string;
  available: boolean;
  activeResume: ActiveIntegratedRoundResume | null;
  locale: PracticalImprovementLocale;
}) {
  if (activeResume) {
    return <span className="secondary" aria-disabled="true" data-table-reading-focus="active-round-first">
      {locale === "ru" ? "Чтение стола — после текущего раунда" : "Table reading — after the current round"}
    </span>;
  }
  if (!available) {
    return <span className="secondary" aria-disabled="true" data-table-reading-focus="unavailable">
      {locale === "ru" ? "Для этого фокуса пока нет подходящего стола" : "No eligible table state for this focus yet"}
    </span>;
  }
  return <PracticalDocumentLink className="secondary" href={`/mastery/perception?focus=${encodeURIComponent(skillId)}`}>
    {locale === "ru" ? "Проверить чтение стола" : "Test table reading"} →
  </PracticalDocumentLink>;
}

function ManualResolutionCard({
  resolution,
  state,
  activeResume,
  locale,
  startFailureSkillId,
  onStart,
}: {
  resolution: PracticalImprovementResolution;
  state: PracticalMasteryState;
  activeResume: ActiveIntegratedRoundResume | null;
  locale: PracticalImprovementLocale;
  startFailureSkillId: string | null;
  onStart: (skillId: string) => void;
}) {
  if (resolution.kind === "COMPLETE") {
    return <div className="today-card" data-manual-resolution="complete">
      <h3>{locale === "ru" ? "Эта тема уже закрыта на текущем целевом уровне" : "This topic is complete at its current target"}</h3>
      <p>{locale === "ru" ? "Выбор темы ничего не меняет в прогрессе. Можно выбрать другую область или вернуться к системной рекомендации." : "Browsing this topic changes nothing in your progress. Choose another area or return to the system recommendation."}</p>
    </div>;
  }

  if (resolution.kind === "NO_ELIGIBLE") {
    return <div className="today-card" data-manual-resolution="no-eligible">
      <h3>{locale === "ru" ? "Сейчас здесь нет доступного самостоятельного фокуса" : "No independent focus is available here yet"}</h3>
      <p>{locale === "ru" ? "Нужны обязательные предпосылки, знакомство с механизмом или достаточная подтверждённая база задач. Другая тема не будет подставлена автоматически." : "This area still needs prerequisites, concept exposure, or enough supported practice material. Another topic will not be substituted automatically."}</p>
    </div>;
  }

  if (resolution.kind === "NO_USEFUL_ITEM") {
    return <div className="today-card" data-manual-resolution="no-useful-item">
      <h3>{locale === "ru" ? "Тема доступна, но сейчас нет полезной точной задачи" : "The topic is available, but no useful exact item is ready"}</h3>
      <p>{locale === "ru" ? "Мы не заменим выбранную тему другой ради заполнения раунда. Попробуй позже или выбери другую область сам." : "We will not replace your chosen topic just to fill a round. Try later or choose another area yourself."}</p>
    </div>;
  }

  const focusSkillId = resolution.focusSkillId;
  if (!focusSkillId) return null;
  const tableAvailable = hasFocusedPracticalTableState(state, focusSkillId);
  return <div className="today-card" data-manual-resolution="exact-focus">
    <p className="eyebrow">{locale === "ru" ? "ТОЧНЫЙ ФОКУС" : "EXACT FOCUS"}</p>
    <h3>{skillTitle(focusSkillId, locale)}</h3>
    <p>{resolution.reason === "SYSTEM_RECOMMENDATION_IN_TOPIC"
      ? (locale === "ru" ? "Системная рекомендация попала внутрь выбранной темы, поэтому она получает приоритет внутри этой темы." : "The system recommendation is inside your selected topic, so it gets first claim within this topic.")
      : (locale === "ru" ? "Выбран первый доступный точный навык в каноническом порядке этой темы." : "The first eligible exact skill in this topic's canonical order was selected.")}</p>
    <div className="button-row">
      <ExactPracticeAction
        skillId={focusSkillId}
        available
        activeResume={activeResume}
        locale={locale}
        startFailed={startFailureSkillId === focusSkillId}
        onStart={onStart}
      />
      <ExactTableReadingAction skillId={focusSkillId} available={tableAvailable} activeResume={activeResume} locale={locale} />
    </div>
  </div>;
}

export default function PracticalImproveExperience() {
  const router = useRouter();
  const [locale, setLocale] = usePracticalLocale();
  const {
    mastery,
    performance,
    studyWorkspace,
    fieldNotes,
    setStudyWorkspace,
    ready,
    recoveryBlocked,
  } = usePracticalProfileState();
  const [manualTopic, setManualTopic] = useState<PracticalImprovementTopicKey | null>(null);
  const [startFailureSkillId, setStartFailureSkillId] = useState<string | null>(null);

  const activeResume = useMemo(
    () => ready && !recoveryBlocked ? activeIntegratedRoundResume(studyWorkspace, mastery) : null,
    [mastery, ready, recoveryBlocked, studyWorkspace],
  );
  const recommendation = useMemo(() => recommendNextPracticalSkill(mastery), [mastery]);
  const currentMistakes = useMemo(() => currentPracticalMistakes(mastery), [mastery]);
  const realHandRepairSkillIds = useMemo(() => reviewedRealHandRepairSkillIds(fieldNotes), [fieldNotes]);
  const manualResolution = useMemo(
    () => manualTopic ? resolvePracticalImprovementFocus(mastery, manualTopic) : null,
    [manualTopic, mastery],
  );

  const startExactRound = useCallback((skillId: string) => {
    if (activeResume || recoveryBlocked || !exactPracticeAvailable(mastery, skillId)) return;
    const startedAt = new Date();
    const items = buildAdaptiveIntegratedSession(
      mastery,
      startedAt,
      INTEGRATED_SESSION_SIZE,
      performance,
      skillId,
    );
    if (!items.length) {
      setStartFailureSkillId(skillId);
      return;
    }
    const nextWorkspace = recordIntegratedRoundStartContinuity(
      studyWorkspace,
      mastery.contentVersion,
      { focusSkillId: skillId, items },
      startedAt,
    );
    if (!nextWorkspace || !setStudyWorkspace(nextWorkspace)) {
      setStartFailureSkillId(skillId);
      return;
    }
    setStartFailureSkillId(null);
    router.push(`/mastery/session?focus=${encodeURIComponent(skillId)}`);
  }, [activeResume, mastery, performance, recoveryBlocked, router, setStudyWorkspace, studyWorkspace]);

  if (!ready) {
    return <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  }
  if (recoveryBlocked) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1>
      <p>{locale === "ru" ? "Прогресс не будет перезаписан. Открой «Данные и восстановление» в инструментах Live Cash OS." : "Practical progress will not be overwritten. Open Data & Recovery in Live Cash OS tools."}</p>
      <Link href="/tools?tab=data">{locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →</Link>
    </main>;
  }

  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 72px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? "УЛУЧШЕНИЕ ИГРЫ" : "IMPROVE"}</p>
      <h1>{locale === "ru" ? "Выбери, что исправить дальше" : "Choose what to improve next"}</h1>
      <p className="lede">{locale === "ru" ? "Система по-прежнему рекомендует следующий шаг сама. Здесь ты также можешь открыть текущую ошибку или вручную выбрать область — без изменения прогресса до начала реальной практики." : "The system still owns the next recommendation. You can also open a current mistake or browse an area manually without changing progress until real practice begins."}</p>
      <div className="mode-switch" aria-label={locale === "ru" ? "Язык" : "Language"}>
        <button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button>
        <button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
      </div>
    </section>

    {activeResume ? <section className="today-card" data-improve-section="active-round">
      <p className="eyebrow">{locale === "ru" ? "СНАЧАЛА ТЕКУЩИЙ РАУНД" : "ACTIVE ROUND FIRST"}</p>
      <h2>{activeResume.focusSkillId ? skillTitle(activeResume.focusSkillId, locale) : (locale === "ru" ? "Текущий смешанный раунд" : "Current mixed round")}</h2>
      <p>{locale === "ru" ? "У тебя уже есть незавершённый валидный раунд. Новый фокус не заменит и не сбросит его." : "You already have a valid unfinished round. A new focus will not replace or discard it."}</p>
      <PracticalDocumentLink className="primary" href={activeResume.href}>{locale === "ru" ? "Продолжить раунд" : "Continue round"} <span>→</span></PracticalDocumentLink>
    </section> : null}

    <section className="surface" data-improve-section="recommendation">
      <div className="section-head">
        <p className="eyebrow">{locale === "ru" ? "РЕКОМЕНДОВАНО СИСТЕМОЙ" : "SYSTEM RECOMMENDATION"}</p>
        <h2>{locale === "ru" ? "Что полезнее всего сейчас" : "What is most useful now"}</h2>
      </div>
      {recommendation ? <div className="today-card">
        <h3>{skillTitle(recommendation.skillId, locale)}</h3>
        <p>{locale === "ru" ? "Эта рекомендация остаётся отдельной от ручного выбора и списка текущих ошибок." : "This recommendation remains separate from manual browsing and Current Mistakes."}</p>
        {activeResume
          ? <PracticalDocumentLink className="primary" href={activeResume.href}>{locale === "ru" ? "Сначала продолжить текущий раунд" : "Continue the active round first"} <span>→</span></PracticalDocumentLink>
          : <PracticalNextLearningLink className="primary" focusSkillId={recommendation.skillId} labelRu="Продолжить рекомендацию" labelEn="Continue recommendation" />}
      </div> : <div className="empty-state"><p>{locale === "ru" ? "Сейчас система не предлагает новый самостоятельный фокус." : "The system has no new independent focus to recommend right now."}</p></div>}
    </section>

    <section className="surface" data-improve-section="current-mistakes">
      <div className="section-head">
        <p className="eyebrow">{locale === "ru" ? "ТЕКУЩИЕ ОШИБКИ" : "CURRENT MISTAKES"}</p>
        <h2>{locale === "ru" ? "Исправь точный повторяющийся сбой" : "Repair an exact recurring mistake"}</h2>
        <p>{locale === "ru" ? "Порядок здесь берётся напрямую из текущих доказательств ошибок и не меняется из-за доступности практики, языка или ручного выбора." : "This order comes directly from current mistake evidence and does not change with practice availability, language, or manual browsing."}</p>
      </div>
      {currentMistakes.length ? currentMistakes.map((row) => {
        const presentation = practicalMistakeLearnerPresentation(row, locale);
        const practiceAvailable = exactPracticeAvailable(mastery, row.skillId);
        const tableAvailable = hasFocusedPracticalTableState(mastery, row.skillId);
        return <article className="today-card" key={`${row.skillId}:${row.misconceptionId}`} data-current-mistake-row="1">
          <h3>{skillTitle(row.skillId, locale)}</h3>
          {presentation.pattern ? <p><strong>{locale === "ru" ? "Где сбой" : "Mistake pattern"}:</strong> {presentation.pattern}</p> : null}
          <p>{presentation.evidenceCopy}</p>
          <div className="button-row">
            <ExactPracticeAction
              skillId={row.skillId}
              available={practiceAvailable}
              activeResume={activeResume}
              locale={locale}
              startFailed={startFailureSkillId === row.skillId}
              onStart={startExactRound}
            />
            <ExactTableReadingAction skillId={row.skillId} available={tableAvailable} activeResume={activeResume} locale={locale} />
          </div>
        </article>;
      }) : <div className="empty-state"><p>{locale === "ru" ? "Сейчас нет нерешённых ошибок с точно диагностированным механизмом." : "There are no unresolved mistakes with a specifically diagnosed mechanism right now."}</p></div>}
    </section>

    <section className="surface" data-improve-section="manual-topics">
      <div className="section-head">
        <p className="eyebrow">{locale === "ru" ? "ВЫБРАТЬ ВРУЧНУЮ" : "BROWSE MANUALLY"}</p>
        <h2>{locale === "ru" ? "Что хочешь улучшить" : "What do you want to improve"}</h2>
        <p>{locale === "ru" ? "Выбор темы живёт только на этой странице. Он не становится предпочтением системы и не записывается в прогресс." : "Your topic choice exists only on this page. It does not become a system preference and is not saved to progress."}</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 220px), 1fr))", gap: 10 }}>
        {practicalImprovementTopics.map((topic) => <button
          key={topic.key}
          className="secondary"
          type="button"
          aria-pressed={manualTopic === topic.key}
          onClick={() => {
            setStartFailureSkillId(null);
            setManualTopic(topic.key);
          }}
          style={{ minHeight: 48, justifyContent: "flex-start", textAlign: "left" }}
        >{locale === "ru" ? topic.titleRu : topic.titleEn}</button>)}
      </div>
      {manualResolution ? <ManualResolutionCard
        resolution={manualResolution}
        state={mastery}
        activeResume={activeResume}
        locale={locale}
        startFailureSkillId={startFailureSkillId}
        onStart={startExactRound}
      /> : null}
    </section>

    <section className="surface" data-improve-section="real-hands">
      <div className="section-head">
        <p className="eyebrow">{locale === "ru" ? "РЕАЛЬНЫЕ РУКИ" : "REAL HANDS"}</p>
        <h2>{locale === "ru" ? "Вернись к тому, что уже определил разбор" : "Return to what a review already established"}</h2>
        <p>{locale === "ru" ? "Точный фокус появляется здесь только после сохранённого разбора с валидной привязкой к навыку. Текст руки, результат и шоудаун ничего не угадывают автоматически." : "An exact focus appears here only after a saved review with a valid skill binding. Hand text, result, and showdown are never used to guess a focus."}</p>
      </div>
      <PracticalDocumentLink className="secondary" href="/tools?tab=field">{locale === "ru" ? "Открыть реальные руки" : "Open Real Hands"} →</PracticalDocumentLink>
      {realHandRepairSkillIds.length ? realHandRepairSkillIds.map((skillId) => {
        const practiceAvailable = exactPracticeAvailable(mastery, skillId);
        const tableAvailable = hasFocusedPracticalTableState(mastery, skillId);
        return <article className="today-card" key={skillId} data-reviewed-real-hand-focus="1">
          <h3>{skillTitle(skillId, locale)}</h3>
          <p>{locale === "ru" ? "Разбор уже привязал эту ремонтную задачу к точному навыку." : "A completed review already bound this repair to an exact skill."}</p>
          <div className="button-row">
            <ExactPracticeAction
              skillId={skillId}
              available={practiceAvailable}
              activeResume={activeResume}
              locale={locale}
              startFailed={startFailureSkillId === skillId}
              onStart={startExactRound}
            />
            <ExactTableReadingAction skillId={skillId} available={tableAvailable} activeResume={activeResume} locale={locale} />
          </div>
        </article>;
      }) : <p className="support">{locale === "ru" ? "Пока нет рассмотренной реальной руки с точной ремонтной привязкой. Это нормально: здесь ничего не угадывается автоматически." : "No reviewed real hand currently has an exact repair binding. Nothing is guessed automatically here."}</p>}
    </section>

    <section className="surface" data-improve-section="table-reading">
      <div className="section-head">
        <p className="eyebrow">{locale === "ru" ? "ЧТЕНИЕ СТОЛА" : "TABLE READING"}</p>
        <h2>{locale === "ru" ? "Проверь точный навык в визуальном споте" : "Test an exact skill in a visual spot"}</h2>
        <p>{locale === "ru" ? "Если для выбранного точного навыка есть подходящее состояние стола, ссылка выше ведёт только к нему. Если такого состояния нет, общий режим не подставляется вместо выбранного фокуса." : "When an eligible table state exists for an exact skill, the contextual links above route only to that skill. If none exists, generic table reading is not substituted for that focus."}</p>
      </div>
      <PracticalDocumentLink className="secondary" href="/mastery/perception">{locale === "ru" ? "Открыть обычное чтение стола" : "Open generic table reading"} →</PracticalDocumentLink>
    </section>
  </main>;
}
