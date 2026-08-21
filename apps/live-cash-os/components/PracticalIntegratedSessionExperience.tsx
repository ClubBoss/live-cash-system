"use client";

import { useEffect, useMemo, useState } from "react";
import { practicalDecisionById, practicalSkillById } from "../content/practical-mastery";
import {
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  createPracticalMasteryState,
  type PracticalMasteryState,
} from "../lib/practical-mastery-core";
import {
  INTEGRATED_SESSION_SIZE,
  buildIntegratedSession,
  recordIntegratedDecision,
  type IntegratedSessionItem,
} from "../lib/practical-integrated-session";

const STORAGE_KEY = "live-cash-os:practical-mastery:v3";
type Locale = "ru" | "en";

function loadState(): PracticalMasteryState {
  if (typeof window === "undefined") return createPracticalMasteryState(new Date(), true);
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createPracticalMasteryState(new Date(), true);
    const parsed = JSON.parse(raw) as PracticalMasteryState;
    if (
      parsed.schemaVersion !== PRACTICAL_MASTERY_STATE_SCHEMA_VERSION ||
      !parsed.skills ||
      !Array.isArray(parsed.attempts) ||
      Object.values(parsed.skills).some((progress) => !Array.isArray(progress.retentionDaysPassed))
    ) throw new Error("invalid practical mastery v3 state");
    return parsed;
  } catch {
    return createPracticalMasteryState(new Date(), true);
  }
}

function optionText(option: { textRu: string; textEn: string }, locale: Locale) {
  return locale === "ru" ? option.textRu : option.textEn;
}

export default function PracticalIntegratedSessionExperience() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [state, setState] = useState<PracticalMasteryState>(() => createPracticalMasteryState(new Date(), true));
  const [items, setItems] = useState<IntegratedSessionItem[]>([]);
  const [index, setIndex] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    const loaded = loadState();
    setState(loaded);
    setItems(buildIntegratedSession(loaded, new Date(), INTEGRATED_SESSION_SIZE));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const item = items[index] ?? null;
  const decision = item ? practicalDecisionById.get(item.decisionId) ?? null : null;
  const skill = item ? practicalSkillById.get(item.skillId) ?? null : null;
  const completed = hydrated && (items.length === 0 || index >= items.length);
  const score = useMemo(() => {
    if (!hydrated) return { correct: 0, total: 0 };
    const ids = new Set(items.map((candidate) => candidate.decisionId));
    const attempts = state.attempts.filter((attempt) => ids.has(attempt.decisionId));
    const latest = new Map<string, (typeof attempts)[number]>();
    for (const attempt of attempts) latest.set(attempt.decisionId, attempt);
    return { correct: [...latest.values()].filter((attempt) => attempt.correct).length, total: Math.min(index + (revealed ? 1 : 0), items.length) };
  }, [state, items, index, revealed, hydrated]);

  useEffect(() => {
    setActionId("");
    setReasonId("");
    setConfidence(65);
    setRevealed(false);
    setWasCorrect(null);
  }, [item?.decisionId]);

  const submit = () => {
    if (!item || !decision || !actionId || !reasonId) return;
    const correct = actionId === decision.correctActionId && reasonId === decision.correctReasonId;
    const next = recordIntegratedDecision(state, item, { actionId, reasonId, confidence, now: new Date() });
    setState(next);
    setWasCorrect(correct);
    setRevealed(true);
  };

  const next = () => setIndex((value) => value + 1);

  if (!hydrated) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>Loading…</p></main>;

  if (completed) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <section className="hero compact-hero">
        <p className="eyebrow">INTEGRATED SESSION</p>
        <h1>{locale === "ru" ? "Сессия завершена" : "Session complete"}</h1>
        <p>{locale === "ru"
          ? "Следующая сессия заново соберётся из актуальных ошибок, due-retention и недоэкспонированных навыков. Тема заранее не выбирается."
          : "The next session will be rebuilt from current mistakes, due retention, and underexposed skills. The topic is not chosen in advance."}</p>
        <p><b>{score.correct}/{items.length}</b> {locale === "ru" ? "последних ответов в batch" : "latest answers in the batch"}</p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 18 }}>
          <button className="primary" onClick={() => { const nextItems = buildIntegratedSession(state, new Date(), INTEGRATED_SESSION_SIZE); setItems(nextItems); setIndex(0); }}>
            {locale === "ru" ? "Собрать следующую сессию" : "Build next session"} <span>→</span>
          </button>
          <a className="secondary" href="/mastery">{locale === "ru" ? "Изучить следующий навык" : "Learn the next skill"}</a>
        </div>
      </section>
    </main>;
  }

  if (!item || !decision) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <p className="eyebrow">INTEGRATED SESSION</p>
      <h1>{locale === "ru" ? "Сначала нужен изученный материал" : "Learn some material first"}</h1>
      <p>{locale === "ru" ? "Mixed practice не будет экзаменовать незнакомую концепцию. Открой карту навыков или First Journey." : "Mixed practice will not test an unseen concept. Open the skill map or First Journey."}</p>
      <p><a href="/mastery/journey">First Journey →</a> · <a href="/mastery">Skill map →</a></p>
    </main>;
  }

  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">MIXED PRACTICE · {index + 1}/{items.length}</p>
      <h1>{locale === "ru" ? "Какой механизм нужен здесь?" : "Which mechanism applies here?"}</h1>
      <p>{locale === "ru" ? "Тема скрыта до ответа — как за реальным столом." : "The topic stays hidden until you answer — like at a real table."}</p>
      <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
    </section>

    <section className="today-card" style={{ marginTop: 20 }}>
      <h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2>
      <p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>

      <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}>
        <legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>
        {decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}>
          <input type="radio" name={`${decision.id}-action`} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {optionText(option, locale)}
        </label>)}
      </fieldset>

      <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}>
        <legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>
        {decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}>
          <input type="radio" name={`${decision.id}-reason`} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {optionText(option, locale)}
        </label>)}
      </fieldset>

      <label style={{ display: "block", marginBottom: 15 }}>
        {locale === "ru" ? "Уверенность" : "Confidence"}: <b>{confidence}%</b><br />
        <input aria-label={locale === "ru" ? "Уверенность" : "Confidence"} type="range" min="0" max="100" value={confidence} disabled={revealed} onChange={(event) => setConfidence(Number(event.target.value))} />
      </label>

      {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Зафиксировать решение" : "Lock answer"} <span>→</span></button> : <div>
        <h3>{wasCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужен repair" : "Repair needed")}</h3>
        <p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p>
        <div className="today-card" style={{ marginTop: 14 }}>
          <p className="eyebrow">REVEAL AFTER COMMITMENT</p>
          <p><b>{locale === "ru" ? "Навык:" : "Skill:"}</b> {skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : item.skillId}</p>
          <p><b>{locale === "ru" ? "Почему сейчас:" : "Why now:"}</b> {item.whyAfterAnswer}</p>
          {item.retentionTierDays ? <p><b>Retention:</b> {item.retentionTierDays}d · non-identical retrieval</p> : null}
          <p className="support">{decision.sourceRefs.join(", ")}</p>
        </div>
        <button className="primary" onClick={next} style={{ marginTop: 14 }}>{locale === "ru" ? "Следующее решение" : "Next decision"} <span>→</span></button>
      </div>}
    </section>
  </main>;
}
