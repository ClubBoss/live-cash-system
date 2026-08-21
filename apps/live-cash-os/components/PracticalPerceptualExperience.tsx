"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { allPracticalTableStates, practicalDecisionById, practicalSkillById, type PracticalTableState } from "../content/practical-mastery";
import { recordPracticalDecision } from "../lib/practical-mastery-core";
import { effectivePracticalScaffold, practicalScaffoldCue } from "../lib/practical-scaffold-fading";
import { createPracticalPerformanceEvent } from "../lib/practical-performance-telemetry";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

function Table({ state, locale }: { state: PracticalTableState; locale: "ru" | "en" }) {
  const heroSeat = state.seats.find((seat) => seat.position === state.hero);
  return <div aria-label="poker table state" style={{ margin: "18px auto", maxWidth: 720 }}>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginBottom: 8 }}>{state.seats.slice(0, 3).map((seat) => <Seat key={seat.position} seat={seat} hero={seat.position === state.hero} />)}</div>
    <div style={{ border: "2px solid currentColor", borderRadius: "44%", minHeight: 220, padding: 22, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>{state.board?.map((card) => <Card key={card} card={card} />)}</div>
      {state.potBb !== undefined ? <p><b>{locale === "ru" ? "Банк" : "Pot"} {state.potBb}bb</b></p> : null}
      {state.straddle ? <p>{locale === "ru" ? "Страддл" : "Straddle"}: <b>{state.straddle.position} {state.straddle.amountBb}bb</b></p> : null}
      <div style={{ fontSize: 14, maxWidth: 560 }}>{state.actions.map((action) => <div key={action}>{action}</div>)}</div>
      {state.irrelevantCues?.map((cue) => <div key={cue} style={{ fontSize: 12, opacity: 0.6, marginTop: 4 }}>• {cue}</div>)}
      {heroSeat && state.heroCards ? <div style={{ marginTop: 14 }}><b>Hero {state.hero}</b><div style={{ display: "flex", gap: 6, justifyContent: "center", marginTop: 5 }}>{state.heroCards.map((card) => <Card key={card} card={card} />)}</div></div> : null}
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: 8, marginTop: 8 }}>{state.seats.slice(3).map((seat) => <Seat key={seat.position} seat={seat} hero={seat.position === state.hero} />)}</div>
  </div>;
}
function Seat({ seat, hero }: { seat: PracticalTableState["seats"][number]; hero: boolean }) { return <div style={{ border: "1px solid currentColor", borderRadius: 12, padding: "8px 6px", textAlign: "center", opacity: seat.status === "folded" ? 0.45 : 1, fontWeight: hero ? 800 : 500 }}><div>{seat.position}{hero ? " · HERO" : ""}</div><div>{seat.stackBb}bb</div></div>; }
function Card({ card }: { card: string }) { return <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 56, border: "1px solid currentColor", borderRadius: 7, fontWeight: 800, background: "var(--surface, white)" }}>{card}</span>; }

export default function PracticalPerceptualExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery: state, setMasteryWithPerformance, ready, recoveryBlocked } = usePracticalProfileState();
  const [index, setIndex] = useState(0);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);
  const [startedAt, setStartedAt] = useState(() => new Date());

  const eligible = useMemo(() => {
    const attempted = new Set(state.attempts.map((attempt) => attempt.decisionId));
    const exposed = allPracticalTableStates.filter((table) => state.skills[practicalDecisionById.get(table.decisionId)?.skillId ?? ""]?.conceptTaught);
    return [...exposed.filter((table) => !attempted.has(table.decisionId)), ...exposed.filter((table) => attempted.has(table.decisionId))];
  }, [state]);
  const table = eligible[index % Math.max(eligible.length, 1)] ?? null;
  const decision = table ? practicalDecisionById.get(table.decisionId) ?? null : null;
  const skill = decision ? practicalSkillById.get(decision.skillId) ?? null : null;
  const scaffold = table && skill ? effectivePracticalScaffold(state, skill.id, table.scaffold) : "guided";
  const supportCue = practicalScaffoldCue(scaffold, locale);

  useEffect(() => { setStartedAt(new Date()); }, [table?.decisionId]);

  const submit = () => {
    if (!decision || !actionId || !reasonId) return;
    const answeredAt = new Date();
    const correct = decision.correctActionId === actionId && decision.correctReasonId === reasonId;
    const nextState = recordPracticalDecision(state, { decisionId: decision.id, actionId, reasonId, confidence: 65 });
    const event = createPracticalPerformanceEvent({ decisionId: decision.id, actionId, reasonId, confidence: 65, startedAt, answeredAt, mode: "PERCEPTUAL_TABLE", scaffold });
    if (!setMasteryWithPerformance(nextState, event)) return;
    setLastCorrect(correct); setRevealed(true);
  };
  const next = () => { setIndex((value) => value + 1); setActionId(""); setReasonId(""); setRevealed(false); setLastCorrect(null); };

  if (!ready) return <main style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><Link href="/">Live Cash OS →</Link></main>;
  if (!table || !decision || !skill) return <main style={{ maxWidth: 760, margin: "0 auto", padding: "32px 20px 64px" }}><p className="eyebrow">{locale === "ru" ? "ЧТЕНИЕ СТОЛА" : "PERCEPTUAL PRACTICE"}</p><h1>{locale === "ru" ? "Сначала познакомься с механизмами" : "Learn the mechanisms first"}</h1><p>{locale === "ru" ? "Этот режим не проверяет незнакомые темы. Сначала пройди первый круг, а затем изученные навыки появятся здесь уже как реальные состояния стола." : "This mode does not test unseen topics. Complete First Journey first; learned skills will then appear here as table states."}</p><Link className="primary" href="/mastery/journey">{locale === "ru" ? "Первый круг" : "First Journey"} →</Link></main>;

  const scaffoldLabel = locale === "ru" ? (scaffold === "guided" ? "с подсказкой" : scaffold === "reduced" ? "меньше подсказок" : "без подсказки") : scaffold.toUpperCase();
  return <main style={{ maxWidth: 900, margin: "0 auto", padding: "24px 18px 64px" }}>
    <section className="hero compact-hero"><p className="eyebrow">{locale === "ru" ? `ЧТЕНИЕ СТОЛА · ${scaffoldLabel}` : `PERCEPTUAL PRACTICE · ${scaffoldLabel}`}</p><h1>{locale === "ru" ? "Прочитай стол до того, как назовёшь тему" : "Read the table before naming the topic"}</h1>{supportCue ? <p>{supportCue}</p> : <p>{locale === "ru" ? "Подсказка снята: сам найди переменную, которая меняет решение." : "The cue has faded: identify the decision-changing variable yourself."}</p>}<div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div></section>
    <section className="surface" style={{ marginTop: 18 }}><Table state={table} locale={locale} /><h2>{locale === "ru" ? decision.questionRu : decision.questionEn}</h2>
      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}><legend><b>{locale === "ru" ? "Что важно и куда сдвигается решение" : "What matters / which way does the decision move"}</b></legend>{decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", padding: "7px 0" }}><input type="radio" name={`${decision.id}-a`} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}</label>)}</fieldset>
      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}><legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>{decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", padding: "7px 0" }}><input type="radio" name={`${decision.id}-r`} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}</label>)}</fieldset>
      {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Зафиксировать решение" : "Commit decision"} <span>→</span></button> : <div className="today-card" style={{ marginTop: 16 }}><p className="eyebrow">{locale === "ru" ? "ПОСЛЕ ОТВЕТА" : "REVEAL AFTER COMMITMENT"}</p><h3>{lastCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужно исправить" : "Repair needed")}</h3><p><b>{locale === "ru" ? "Навык:" : "Skill:"}</b> {locale === "ru" ? skill.titleRu : skill.titleEn}</p><p><b>{locale === "ru" ? "Ключевой сигнал:" : "Cue that mattered:"}</b> {locale === "ru" ? table.revealCueRu : table.revealCueEn}</p><p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p><button className="secondary" onClick={next}>{locale === "ru" ? "Следующий стол" : "Next table"} <span>→</span></button></div>}
    </section>
  </main>;
}
