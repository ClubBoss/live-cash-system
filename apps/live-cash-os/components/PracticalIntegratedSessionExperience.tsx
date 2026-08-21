"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import { buildAdaptiveIntegratedSession } from "../lib/practical-adaptive-session";
import { INTEGRATED_SESSION_SIZE, recordIntegratedDecision, type IntegratedSessionItem } from "../lib/practical-integrated-session";
import { createPracticalPerformanceEvent } from "../lib/practical-performance-telemetry";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

type Locale = "ru" | "en";
function optionText(option: { textRu: string; textEn: string }, locale: Locale) { return locale === "ru" ? option.textRu : option.textEn; }

export default function PracticalIntegratedSessionExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery: state, performance, setMasteryWithPerformance, ready, recoveryBlocked } = usePracticalProfileState();
  const [items, setItems] = useState<IntegratedSessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [initializedRevision, setInitializedRevision] = useState<number | null>(null);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date());

  useEffect(() => {
    if (!ready || initializedRevision !== null) return;
    setItems(buildAdaptiveIntegratedSession(state, new Date(), INTEGRATED_SESSION_SIZE, performance));
    setInitializedRevision(state.revision);
  }, [initializedRevision, performance, ready, state]);

  const item = items[index] ?? null;
  const decision = item ? practicalDecisionById.get(item.decisionId) ?? null : null;
  const skill = item ? practicalSkillById.get(item.skillId) ?? null : null;
  const completed = ready && initializedRevision !== null && (items.length === 0 || index >= items.length);
  const score = useMemo(() => {
    const ids = new Set(items.map((candidate) => candidate.decisionId));
    const attempts = state.attempts.filter((attempt) => ids.has(attempt.decisionId));
    const latest = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) latest.set(attempt.decisionId, attempt);
    return { correct: [...latest.values()].filter((attempt) => attempt.correct).length, total: Math.min(index + (revealed ? 1 : 0), items.length) };
  }, [state, items, index, revealed]);

  useEffect(() => {
    setActionId("");
    setReasonId("");
    setConfidence(65);
    setRevealed(false);
    setWasCorrect(null);
    setStartedAt(new Date());
  }, [item?.decisionId]);

  const submit = () => {
    if (!item || !decision || !actionId || !reasonId) return;
    const answeredAt = new Date();
    const correct = actionId === decision.correctActionId && reasonId === decision.correctReasonId;
    const nextState = recordIntegratedDecision(state, item, { actionId, reasonId, confidence, now: answeredAt });
    const event = createPracticalPerformanceEvent({ decisionId: decision.id, actionId, reasonId, confidence, startedAt, answeredAt, mode: "TEXT_MIXED", scaffold: "hidden" });
    if (!setMasteryWithPerformance(nextState, event)) return;
    setWasCorrect(correct);
    setRevealed(true);
  };

  if (!ready || initializedRevision === null) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем сессию…" : "Loading session…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><Link href="/">Live Cash OS →</Link></main>;

  if (completed) return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}><section className="hero compact-hero"><p className="eyebrow">INTEGRATED SESSION</p><h1>{locale === "ru" ? "Сессия завершена" : "Session complete"}</h1><p>{locale === "ru" ? "Следующая сессия заново соберётся из актуальных ошибок, retention, automaticity и недоэкспонированных навыков." : "The next session will be rebuilt from current mistakes, retention, automaticity, and underexposed skills."}</p><p><b>{score.correct}/{items.length}</b></p><div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}><button className="primary" onClick={() => { setItems(buildAdaptiveIntegratedSession(state, new Date(), INTEGRATED_SESSION_SIZE, performance)); setIndex(0); }}>{locale === "ru" ? "Собрать следующую сессию" : "Build next session"} <span>→</span></button><Link className="secondary" href="/mastery">{locale === "ru" ? "Изучить следующий навык" : "Learn the next skill"}</Link></div></section></main>;

  if (!item || !decision) return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}><p className="eyebrow">INTEGRATED SESSION</p><h1>{locale === "ru" ? "Сначала нужен изученный материал" : "Learn some material first"}</h1><p>{locale === "ru" ? "Mixed practice не экзаменует незнакомую концепцию." : "Mixed practice will not test an unseen concept."}</p><p><Link href="/mastery/journey">First Journey →</Link> · <Link href="/mastery">Skill map →</Link></p></main>;

  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
    <section className="hero compact-hero"><p className="eyebrow">MIXED PRACTICE · {index + 1}/{items.length}</p><h1>{locale === "ru" ? "Какой механизм нужен здесь?" : "Which mechanism applies here?"}</h1><p>{locale === "ru" ? "Тема скрыта до ответа — как за реальным столом." : "The topic stays hidden until you answer — like at a real table."}</p><div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div></section>
    <section className="today-card" style={{ marginTop: 20 }}><h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2><p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>
      <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}><legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>{decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}><input type="radio" name={`${decision.id}-action`} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {optionText(option, locale)}</label>)}</fieldset>
      <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}><legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>{decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}><input type="radio" name={`${decision.id}-reason`} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {optionText(option, locale)}</label>)}</fieldset>
      <label style={{ display: "block", marginBottom: 15 }}>{locale === "ru" ? "Уверенность" : "Confidence"}: <b>{confidence}%</b><br /><input aria-label={locale === "ru" ? "Уверенность" : "Confidence"} type="range" min="0" max="100" value={confidence} disabled={revealed} onChange={(event) => setConfidence(Number(event.target.value))} /></label>
      {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Зафиксировать решение" : "Lock answer"} <span>→</span></button> : <div><h3>{wasCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужен ремонт" : "Repair needed")}</h3><p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p><div className="today-card" style={{ marginTop: 14 }}><p className="eyebrow">REVEAL AFTER COMMITMENT</p><p><b>{locale === "ru" ? "Навык:" : "Skill:"}</b> {skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : item.skillId}</p><p><b>{locale === "ru" ? "Почему сейчас:" : "Why now:"}</b> {item.whyAfterAnswer}</p>{item.retentionTierDays ? <p><b>Retention:</b> {item.retentionTierDays}d · non-identical retrieval</p> : null}<p className="support">{decision.sourceRefs.join(", ")}</p></div><button className="primary" onClick={() => setIndex((value) => value + 1)} style={{ marginTop: 14 }}>{locale === "ru" ? "Следующее решение" : "Next decision"} <span>→</span></button></div>}
    </section>
  </main>;
}
