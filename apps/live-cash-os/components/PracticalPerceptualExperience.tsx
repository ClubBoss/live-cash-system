"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allPracticalTableStates, practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import { recordPracticalDecision } from "../lib/practical-mastery-core";
import { effectivePracticalScaffold, practicalScaffoldCue } from "../lib/practical-scaffold-fading";
import { createPracticalPerformanceEvent } from "../lib/practical-performance-telemetry";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDecisionFeedback from "./PracticalDecisionFeedback";
import PracticalTableStateStimulus from "./PracticalTableStateStimulus";

export default function PracticalPerceptualExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery: state, setMasteryWithPerformance, ready, recoveryBlocked } = usePracticalProfileState();
  const [index, setIndex] = useState(0);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [submittedDecisionId, setSubmittedDecisionId] = useState<string | null>(null);
  const [submittedScaffold, setSubmittedScaffold] = useState<ReturnType<typeof effectivePracticalScaffold> | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date());

  const eligible = useMemo(() => {
    const attempted = new Set(state.attempts.map((attempt) => attempt.decisionId));
    const exposed = allPracticalTableStates.filter((candidate) => state.skills[practicalDecisionById.get(candidate.decisionId)?.skillId ?? ""]?.conceptTaught);
    return [...exposed.filter((candidate) => !attempted.has(candidate.decisionId)), ...exposed.filter((candidate) => attempted.has(candidate.decisionId))];
  }, [state]);

  const queuedTable = eligible[index % Math.max(eligible.length, 1)] ?? null;
  const table = submittedDecisionId
    ? allPracticalTableStates.find((candidate) => candidate.decisionId === submittedDecisionId) ?? queuedTable
    : queuedTable;
  const decision = table ? practicalDecisionById.get(table.decisionId) ?? null : null;
  const skill = decision ? practicalSkillById.get(decision.skillId) ?? null : null;
  const liveScaffold = table && skill ? effectivePracticalScaffold(state, skill.id, table.scaffold) : "guided";
  const scaffold = submittedScaffold ?? liveScaffold;
  const supportCue = practicalScaffoldCue(scaffold, locale);

  useEffect(() => { setStartedAt(new Date()); }, [table?.decisionId]);

  const submit = () => {
    if (!decision || !actionId || !reasonId) return;
    const answeredAt = new Date();
    const correct = decision.correctActionId === actionId && decision.correctReasonId === reasonId;
    const nextState = recordPracticalDecision(state, { decisionId: decision.id, actionId, reasonId, confidence: 65 });
    const event = createPracticalPerformanceEvent({ decisionId: decision.id, actionId, reasonId, confidence: 65, startedAt, answeredAt, mode: "PERCEPTUAL_TABLE", scaffold });
    if (!setMasteryWithPerformance(nextState, event)) return;
    setSubmittedDecisionId(decision.id);
    setSubmittedScaffold(scaffold);
    setLastCorrect(correct);
    setRevealed(true);
  };

  const next = () => {
    const attempted = new Set(state.attempts.map((attempt) => attempt.decisionId));
    const firstUnattempted = eligible.findIndex((candidate) => !attempted.has(candidate.decisionId));
    setIndex(firstUnattempted >= 0 ? firstUnattempted : index + 1);
    setSubmittedDecisionId(null);
    setSubmittedScaffold(null);
    setActionId("");
    setReasonId("");
    setRevealed(false);
    setLastCorrect(null);
  };

  if (!ready) return <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><p>{locale === "ru" ? "Прогресс не будет перезаписан. Открой «Данные и восстановление» в инструментах Live Cash OS." : "Practical progress will not be overwritten. Open Data & Recovery in Live Cash OS tools."}</p><Link href="/tools">{locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →</Link></main>;
  if (!table || !decision || !skill) return <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}><p className="eyebrow">{locale === "ru" ? "ЧТЕНИЕ СТОЛА" : "PERCEPTUAL PRACTICE"}</p><h1>{locale === "ru" ? "Сначала познакомься с механизмами" : "Learn the mechanisms first"}</h1><p>{locale === "ru" ? "Этот режим не проверяет незнакомые темы. Сначала пройди первый круг, а затем изученные навыки появятся здесь уже как реальные состояния стола." : "This mode does not test unseen topics. Complete First Journey first; learned skills will then appear here as table states."}</p><Link className="primary" href="/mastery/journey">{locale === "ru" ? "Первый круг" : "First Journey"} →</Link></main>;

  const scaffoldLabel = locale === "ru"
    ? (scaffold === "guided" ? "с подсказкой" : scaffold === "reduced" ? "меньше подсказок" : "без подсказки")
    : (scaffold === "guided" ? "guided" : scaffold === "reduced" ? "reduced cues" : "no cue");

  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 18px 64px" }}>
    <section className="hero compact-hero"><p className="eyebrow">{locale === "ru" ? `ЧТЕНИЕ СТОЛА · ${scaffoldLabel}` : `PERCEPTUAL PRACTICE · ${scaffoldLabel}`}</p><h1>{locale === "ru" ? "Прочитай стол до того, как назовёшь тему" : "Read the table before naming the topic"}</h1>{supportCue ? <p>{supportCue}</p> : <p>{locale === "ru" ? "Подсказка снята: сам найди переменную, которая меняет решение." : "The cue has faded: identify the decision-changing variable yourself."}</p>}<div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div></section>
    <section className="surface" style={{ marginTop: 18 }} data-practical-decision-id={decision.id}>
      <PracticalTableStateStimulus state={table} locale={locale} />
      <h2>{locale === "ru" ? decision.questionRu : decision.questionEn}</h2>
      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}><legend><b>{locale === "ru" ? "Что важно и куда сдвигается решение" : "What matters / which way does the decision move"}</b></legend>{decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", padding: "7px 0" }}><input type="radio" name={`${decision.id}-a`} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}</label>)}</fieldset>
      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}><legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>{decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", padding: "7px 0" }}><input type="radio" name={`${decision.id}-r`} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}</label>)}</fieldset>
      {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Зафиксировать решение" : "Commit decision"} <span>→</span></button> : <div className="today-card" style={{ marginTop: 16 }}><p className="eyebrow">{locale === "ru" ? "ПОСЛЕ ОТВЕТА" : "AFTER YOUR ANSWER"}</p><h3>{lastCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужно исправить" : "Repair needed")}</h3><p><b>{locale === "ru" ? "Навык:" : "Skill:"}</b> {locale === "ru" ? skill.titleRu : skill.titleEn}</p><p><b>{locale === "ru" ? "Ключевой сигнал:" : "Cue that mattered:"}</b> {locale === "ru" ? table.revealCueRu : table.revealCueEn}</p><PracticalDecisionFeedback decision={decision} locale={locale} correct={Boolean(lastCorrect)} /><button className="secondary" onClick={next}>{locale === "ru" ? "Следующий стол" : "Next table"} <span>→</span></button></div>}
    </section>
  </main>;
}
