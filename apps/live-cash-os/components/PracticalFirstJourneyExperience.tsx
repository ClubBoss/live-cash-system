"use client";

import { useEffect, useMemo, useState } from "react";
import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey";
import { practicalAnchors, practicalRuleById, practicalSkillById } from "../content/practical-mastery";
import {
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  createPracticalMasteryState,
  markPracticalConceptTaught,
  nextPracticalDecision,
  recordPracticalDecision,
  type PracticalMasteryState,
} from "../lib/practical-mastery-core";
import { firstJourneyProgress, recommendFirstJourneyStep } from "../lib/practical-first-journey";

const STORAGE_KEY = "live-cash-os:practical-mastery:v2";
type Locale = "ru" | "en";

function loadState(): PracticalMasteryState {
  if (typeof window === "undefined") return createPracticalMasteryState(new Date(), true);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createPracticalMasteryState(new Date(), true);
    const parsed = JSON.parse(raw) as PracticalMasteryState;
    if (parsed.schemaVersion !== PRACTICAL_MASTERY_STATE_SCHEMA_VERSION || !parsed.skills || !Array.isArray(parsed.attempts)) throw new Error("invalid practical state");
    return parsed;
  } catch {
    return createPracticalMasteryState(new Date(), true);
  }
}

export default function PracticalFirstJourneyExperience() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [state, setState] = useState<PracticalMasteryState>(() => createPracticalMasteryState(new Date(), true));
  const [hydrated, setHydrated] = useState(false);
  const [prediction, setPrediction] = useState("");
  const [ruleRevealed, setRuleRevealed] = useState(false);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [answerRevealed, setAnswerRevealed] = useState(false);
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const recommendation = useMemo(() => recommendFirstJourneyStep(state), [state]);
  const progress = useMemo(() => firstJourneyProgress(state), [state]);
  const skill = recommendation ? practicalSkillById.get(recommendation.skillId) ?? null : null;
  const journeyStep = recommendation ? firstJourneyStepForSkill(recommendation.skillId) : null;
  const rules = journeyStep?.memoryRuleIds.map((ruleId) => practicalRuleById.get(ruleId)).filter(Boolean) ?? [];
  const rule = rules[0] ?? null;
  const anchor = skill ? practicalAnchors.find((item) => item.skillId === skill.id) ?? null : null;
  const decision = skill && state.skills[skill.id]?.conceptTaught ? nextPracticalDecision(state, skill.id) : null;

  useEffect(() => {
    setPrediction("");
    setRuleRevealed(false);
    setActionId("");
    setReasonId("");
    setAnswerRevealed(false);
    setLastCorrect(null);
  }, [recommendation?.skillId, decision?.id]);

  const revealMechanism = () => {
    if (!skill) return;
    setRuleRevealed(true);
    if (!state.skills[skill.id]?.conceptTaught) setState(markPracticalConceptTaught(state, skill.id));
  };

  const submitDecision = () => {
    if (!decision || !actionId || !reasonId) return;
    const correct = actionId === decision.correctActionId && reasonId === decision.correctReasonId;
    setState(recordPracticalDecision(state, { decisionId: decision.id, actionId, reasonId, confidence: 65 }));
    setLastCorrect(correct);
    setAnswerRevealed(true);
  };

  if (!hydrated) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>Loading…</p></main>;

  if (!recommendation || !skill || !journeyStep) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <p className="eyebrow">FIRST JOURNEY</p>
      <h1>{locale === "ru" ? "Первый круг завершён" : "First loop complete"}</h1>
      <p>{locale === "ru" ? "Ты прошёл первый spiral-pass. Это не означает mastery: следующие сессии вернут эти навыки через direct decisions, changed nodes, boundaries и mixed retrieval." : "You completed the first spiral pass. This is not mastery: later sessions revisit these skills through direct decisions, changed nodes, boundaries and mixed retrieval."}</p>
      <p><b>{progress.reached}/{progress.total}</b></p>
      <a href="/mastery">{locale === "ru" ? "Открыть полную карту навыков →" : "Open the full skill map →"}</a>
    </main>;
  }

  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">FIRST JOURNEY · {progress.reached}/{progress.total}</p>
      <h1>{locale === "ru" ? skill.titleRu : skill.titleEn}</h1>
      <p>{locale === "ru" ? journeyStep.purposeRu : journeyStep.purposeEn}</p>
      <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
    </section>

    <section className="today-card" style={{ marginTop: 20 }}>
      <p className="eyebrow">WHY NOW</p>
      <p>{locale === "ru" ? recommendation.whyNowRu : recommendation.whyNowEn}</p>
    </section>

    {!ruleRevealed ? <section className="surface" style={{ marginTop: 20 }}>
      <p className="eyebrow">PREDICT FIRST</p>
      <h2>{locale === "ru" ? "До объяснения — что здесь должно измениться?" : "Before the explanation — what should change here?"}</h2>
      <p>{rule ? (locale === "ru" ? rule.triggerRu : rule.triggerEn) : anchor ? (locale === "ru" ? anchor.promptRu : anchor.promptEn) : (locale === "ru" ? skill.objectiveRu : skill.titleEn)}</p>
      <textarea
        aria-label={locale === "ru" ? "Твой прогноз" : "Your prediction"}
        value={prediction}
        onChange={(event) => setPrediction(event.target.value)}
        placeholder={locale === "ru" ? "Коротко: куда двигается решение и почему?" : "Briefly: which way does the decision move, and why?"}
        style={{ width: "100%", minHeight: 88, margin: "12px 0" }}
      />
      <button className="primary" onClick={revealMechanism}>{locale === "ru" ? "Показать механизм" : "Reveal mechanism"} <span>→</span></button>
    </section> : <section className="surface" style={{ marginTop: 20 }}>
      <p className="eyebrow">MECHANISM</p>
      {rule ? <>
        <h2>{locale === "ru" ? rule.defaultRu : rule.defaultEn}</h2>
        <p><b>{locale === "ru" ? "Почему:" : "Why:"}</b> {locale === "ru" ? rule.whyRu : rule.whyEn}</p>
        <p><b>{locale === "ru" ? "Когда правило слабеет/ломается:" : "When it weakens/breaks:"}</b> {(locale === "ru" ? rule.reversalsRu : rule.reversalsEn).join(" · ")}</p>
        <p className="support">{locale === "ru" ? rule.transferCueRu : rule.transferCueEn}</p>
      </> : anchor ? <>
        <h2>{locale === "ru" ? anchor.answerRu : anchor.answerEn}</h2>
        <p>{locale === "ru" ? anchor.rationaleRu : anchor.rationaleEn}</p>
        <p className="support">{anchor.sourceRefs.join(", ")}</p>
      </> : null}
    </section>}

    {ruleRevealed && decision ? <section className="today-card" style={{ marginTop: 20 }}>
      <p className="eyebrow">{journeyStep.requiresHiddenCue ? "HIDDEN-CUE RETRIEVAL" : decision.kind.toUpperCase()}</p>
      <h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2>
      <p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>

      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}>
        <legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>
        {decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 8 }}>
          <input type="radio" name={`${decision.id}-a`} checked={actionId === option.id} disabled={answerRevealed} onChange={() => setActionId(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}
        </label>)}
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: "16px 0" }}>
        <legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>
        {decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 8 }}>
          <input type="radio" name={`${decision.id}-r`} checked={reasonId === option.id} disabled={answerRevealed} onChange={() => setReasonId(option.id)} /> {locale === "ru" ? option.textRu : option.textEn}
        </label>)}
      </fieldset>

      {!answerRevealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submitDecision}>{locale === "ru" ? "Ответить" : "Answer"} <span>→</span></button> : <div>
        <h3>{lastCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Repair needed" : "Repair needed")}</h3>
        <p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p>
        <p className="support">{decision.sourceRefs.join(", ")}</p>
        <button className="secondary" onClick={() => { setActionId(""); setReasonId(""); setAnswerRevealed(false); setLastCorrect(null); }}>{locale === "ru" ? "Следующий шаг" : "Next step"} <span>→</span></button>
      </div>}
    </section> : ruleRevealed ? <section className="today-card" style={{ marginTop: 20 }}><p>{locale === "ru" ? "Для этого узла сейчас нет следующего честно доступного scored stimulus. Journey не будет выдавать fake completion." : "There is no next honestly available scored stimulus for this node. The journey will not grant fake completion."}</p></section> : null}
  </main>;
}
