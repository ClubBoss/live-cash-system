"use client";

import { useEffect, useMemo, useState } from "react";
import { practicalAnchors, practicalDecisions, practicalSkillFamilies } from "../content/practical-mastery";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import type { PracticalDecision, PracticalSkillFamily } from "../content/practical-mastery";
import {
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  availablePracticalSkills,
  createPracticalMasteryState,
  markPracticalConceptTaught,
  nextPracticalDecision,
  practicalPrerequisitesMet,
  practicalRepairQueue,
  practicalSkillCorpusCanReach,
  practicalSkillCorpusStats,
  recordPracticalDecision,
  stageAtLeast,
  trainablePracticalSkills,
  type PracticalMasteryState,
} from "../lib/practical-mastery-core";

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

function waveLabel(wave: string): string {
  return wave.replace(/^W(\d+)_/, "Wave $1 · ").replaceAll("_", " ");
}

function evidenceLabel(locale: Locale, stage: string): string {
  const ru: Record<string, string> = {
    SOURCE_SUPPORTED: "есть источник",
    CONCEPT_TAUGHT: "концепт изучен",
    RECOGNITION_TRAINED: "распознаёт",
    DECISION_TRAINED: "решение тренировано",
    CHANGED_NODE_TRANSFER: "перенос на изменённый спот",
    BOUNDARY_TESTED: "границы проверены",
    DELAYED_RETRIEVAL: "вспоминает после паузы",
    REAL_HAND_TRANSFER: "перенос в реальные руки",
  };
  return locale === "ru" ? ru[stage] ?? stage : stage.toLowerCase().replaceAll("_", " ");
}

function skillTitle(skill: PracticalSkillFamily, locale: Locale): string {
  return locale === "ru" ? skill.titleRu : skill.titleEn;
}

function optionText(option: { textRu: string; textEn: string }, locale: Locale): string {
  return locale === "ru" ? option.textRu : option.textEn;
}

function DecisionCard({ locale, decision, state, onState }: { locale: Locale; decision: PracticalDecision; state: PracticalMasteryState; onState: (state: PracticalMasteryState) => void }) {
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    setActionId("");
    setReasonId("");
    setConfidence(65);
    setRevealed(false);
    setWasCorrect(null);
  }, [decision.id]);

  const submit = () => {
    if (!actionId || !reasonId) return;
    const correct = actionId === decision.correctActionId && reasonId === decision.correctReasonId;
    onState(recordPracticalDecision(state, { decisionId: decision.id, actionId, reasonId, confidence }));
    setWasCorrect(correct);
    setRevealed(true);
  };

  return <article className="today-card" style={{ marginTop: 18 }}>
    <p className="eyebrow">{decision.kind.toUpperCase()} · {decision.id}</p>
    <h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2>
    <p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>
    <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}>
      <legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>
      {decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}>
        <input type="radio" name={`${decision.id}-action`} value={option.id} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {optionText(option, locale)}
      </label>)}
    </fieldset>
    <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}>
      <legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>
      {decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}>
        <input type="radio" name={`${decision.id}-reason`} value={option.id} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {optionText(option, locale)}
      </label>)}
    </fieldset>
    <label style={{ display: "block", marginBottom: 15 }}>
      {locale === "ru" ? "Уверенность" : "Confidence"}: <b>{confidence}%</b><br />
      <input aria-label={locale === "ru" ? "Уверенность" : "Confidence"} type="range" min="0" max="100" value={confidence} disabled={revealed} onChange={(event) => setConfidence(Number(event.target.value))} />
    </label>
    {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Ответить" : "Answer"} <span>→</span></button> : <div>
      <p><b>{wasCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужно исправить" : "Repair needed")}</b></p>
      <p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p>
      <p className="support">{locale === "ru" ? "Источники" : "Sources"}: {decision.sourceRefs.join(", ")}</p>
    </div>}
  </article>;
}

export default function PracticalMasteryExperience() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [state, setState] = useState<PracticalMasteryState>(() => createPracticalMasteryState(new Date(), true));
  const [hydrated, setHydrated] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState("FND-01");

  useEffect(() => {
    setState(loadState());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state, hydrated]);

  const skill = practicalSkillFamilies.find((candidate) => candidate.id === selectedSkillId) ?? practicalSkillFamilies[0];
  const progress = state.skills[skill.id];
  const available = practicalPrerequisitesMet(state, skill.id);
  const corpusStats = practicalSkillCorpusStats(skill.id);
  const decisionTrainable = practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED");
  const decision = available && progress?.conceptTaught ? nextPracticalDecision(state, skill.id) : null;
  const gap = practicalSourceGapBySkillId.get(skill.id);
  const lessonAnchors = practicalAnchors.filter((anchor) => anchor.skillId === skill.id);
  const availableIds = useMemo(() => new Set(availablePracticalSkills(state).map((candidate) => candidate.id)), [state]);
  const trainableIds = useMemo(() => new Set(trainablePracticalSkills(state).map((candidate) => candidate.id)), [state]);
  const repairIds = useMemo(() => new Set(practicalRepairQueue(state)), [state]);
  const grouped = useMemo(() => {
    const map = new Map<string, PracticalSkillFamily[]>();
    for (const item of practicalSkillFamilies) {
      const list = map.get(item.wave) ?? [];
      list.push(item);
      map.set(item.wave, list);
    }
    return [...map.entries()];
  }, []);
  const attempted = state.attempts.length;
  const correct = state.attempts.filter((attempt) => attempt.correct).length;
  const trained = practicalSkillFamilies.filter((item) => stageAtLeast(state.skills[item.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "DECISION_TRAINED")).length;
  const recommendedSkill = practicalSkillFamilies.find((item) => trainableIds.has(item.id) && !stageAtLeast(state.skills[item.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "DECISION_TRAINED"));

  return <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">PRACTICAL MASTERY · W0–W14</p>
      <h1>{locale === "ru" ? "Не пройти курс." : "Not finish a course."}<br /><em>{locale === "ru" ? "Научиться принимать решения." : "Build a decision engine."}</em></h1>
      <p className="lede">{locale === "ru" ? "Новая skill-graph программа Live Cash OS. Теория здесь ведёт к распознаванию, решениям, переносу и delayed retrieval — а не к галочке за просмотр." : "The new Live Cash OS skill-graph program. Theory leads into recognition, decisions, transfer and delayed retrieval rather than a completion checkbox."}</p>
      <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
    </section>

    <section className="metrics">
      <div><b>{practicalSkillFamilies.length}</b><span>skill families</span></div>
      <div><b>{practicalDecisions.length}</b><span>{locale === "ru" ? "scored decisions сейчас" : "scored decisions now"}</span></div>
      <div><b>{trained}</b><span>{locale === "ru" ? "decision-trained skills" : "decision-trained skills"}</span></div>
      <div><b>{attempted ? Math.round((correct / attempted) * 100) : 0}%</b><span>{locale === "ru" ? "точность попыток" : "attempt accuracy"}</span></div>
    </section>

    {recommendedSkill ? <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "РЕКОМЕНДОВАНО СЕЙЧАС" : "RECOMMENDED NOW"}</p>
      <h2>{skillTitle(recommendedSkill, locale)}</h2>
      <p>{locale === "ru" ? recommendedSkill.objectiveRu : recommendedSkill.titleEn}</p>
      <button className="primary" onClick={() => setSelectedSkillId(recommendedSkill.id)}>{locale === "ru" ? "Продолжить обучение" : "Continue learning"} <span>→</span></button>
    </section> : <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">CONTENT READINESS</p>
      <p>{locale === "ru" ? "Сейчас нет следующего узла, для которого corpus уже способен честно доказать decision-trained уровень. Это content-production blocker, а не learner failure." : "There is currently no next node whose corpus can honestly prove decision-trained evidence. This is a content-production blocker, not a learner failure."}</p>
    </section>}

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">SKILL GRAPH</p><h2>{locale === "ru" ? "Карта навыков" : "Skill map"}</h2></div>
      {grouped.map(([wave, skills]) => <details key={wave} open={wave === skill.wave} style={{ marginBottom: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>{waveLabel(wave)} · {skills.length}</summary>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
          {skills.map((item) => {
            const itemGap = practicalSourceGapBySkillId.get(item.id);
            const itemProgress = state.skills[item.id];
            const locked = !availableIds.has(item.id);
            const trainable = trainableIds.has(item.id);
            return <button key={item.id} className={item.id === skill.id ? "primary" : "secondary"} onClick={() => setSelectedSkillId(item.id)} style={{ opacity: locked ? 0.58 : 1 }}>
              {item.id} · {skillTitle(item, locale)}{itemGap?.status === "SOURCE_BLOCKED" ? " · SOURCE BLOCKED" : repairIds.has(item.id) ? " · REPAIR" : !trainable && !locked ? " · CONTENT BUILD" : itemProgress ? ` · ${evidenceLabel(locale, itemProgress.evidenceStage)}` : ""}
            </button>;
          })}
        </div>
      </details>)}
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <p className="eyebrow">{skill.wave} · {skill.livePriority}</p>
      <h1>{skillTitle(skill, locale)}</h1>
      <p>{skill.objectiveRu}</p>
      <p className="support">{locale === "ru" ? "Целевой evidence" : "Target evidence"}: {evidenceLabel(locale, skill.targetEvidenceStage)} · {locale === "ru" ? "Текущий" : "Current"}: {evidenceLabel(locale, progress?.evidenceStage ?? "SOURCE_SUPPORTED")}</p>
      <p className="support">{locale === "ru" ? "Corpus" : "Corpus"}: R {corpusStats.recognition} · D {corpusStats.direct} · T {corpusStats.transfer} · B {corpusStats.boundary}</p>
      <p className="support">{locale === "ru" ? "Source routing" : "Source routing"}: {skill.sourceRefs.join(", ")}</p>
      {gap && <div className="today-card" style={{ marginTop: 14 }}><p className="eyebrow">SOURCE {gap.status}</p><p>{gap.reason}</p><p className="support">{gap.nextEvidenceNeeded}</p></div>}
      {available && !decisionTrainable && (!gap || gap.status !== "SOURCE_BLOCKED") && <div className="today-card" style={{ marginTop: 14 }}><p className="eyebrow">CONTENT BUILD</p><p>{locale === "ru" ? "Узел определён и source-routed, но corpus ещё недостаточен для честного DECISION_TRAINED. Его можно изучать как preview, но scheduler не должен выдавать его как полноценную mastery-сессию." : "The node is defined and source-routed, but its corpus is not yet sufficient for honest DECISION_TRAINED evidence. It can be previewed, but the scheduler must not present it as a full mastery session."}</p></div>}
      {!available && <p className="support">{locale === "ru" ? `Locked: сначала decision-trained prerequisites — ${skill.prerequisiteSkillIds.join(", ") || "—"}.` : `Locked: first decision-train prerequisites — ${skill.prerequisiteSkillIds.join(", ") || "—"}.`}</p>}
      {available && (!gap || gap.status !== "SOURCE_BLOCKED") && !progress?.conceptTaught && <div className="today-card" style={{ marginTop: 18 }}>
        <p className="eyebrow">{locale === "ru" ? "СНАЧАЛА ПОЙМИ МЕХАНИЗМ" : "UNDERSTAND THE MECHANISM FIRST"}</p>
        {lessonAnchors.length ? lessonAnchors.map((anchor) => <div key={anchor.id} style={{ marginTop: 18 }}>
          <h3>{locale === "ru" ? anchor.promptRu : anchor.promptEn}</h3>
          <p><b>{locale === "ru" ? anchor.answerRu : anchor.answerEn}</b></p>
          <p>{locale === "ru" ? anchor.rationaleRu : anchor.rationaleEn}</p>
          <p className="support">{anchor.sourceRefs.join(", ")}</p>
        </div>) : <p>{locale === "ru" ? "Для этого skill пока нет достаточно качественного teaching anchor. Он остаётся в graph, но не должен считаться изученным." : "This skill does not yet have a sufficiently strong teaching anchor. It remains in the graph but should not be considered taught."}</p>}
        {lessonAnchors.length > 0 && <button className="primary" onClick={() => setState(markPracticalConceptTaught(state, skill.id))}>{locale === "ru" ? "Понял — перейти к решениям" : "Understood — move to decisions"} <span>→</span></button>}
      </div>}
      {available && progress?.conceptTaught && decision && <DecisionCard locale={locale} decision={decision} state={state} onState={setState} />}
      {available && progress?.conceptTaught && !decision && (!gap || gap.status !== "SOURCE_BLOCKED") && <p className="support">{locale === "ru" ? "На текущем evidence-этапе нет следующего независимого stimulus. Skill не повышается автоматически: требуется дополнительный content или delayed/real-hand evidence." : "There is no next independent stimulus at the current evidence stage. The skill does not advance automatically: additional content or delayed/real-hand evidence is required."}</p>}
    </section>

    <section className="integrity" style={{ marginTop: 22 }}>
      <h2>{locale === "ru" ? "Evidence integrity" : "Evidence integrity"}</h2>
      <p>{locale === "ru" ? "Одна правильная задача не создаёт mastery. Нужны разные recognition-, direct-, transfer- и boundary-stimuli; delayed retention и real-hand transfer фиксируются отдельно. Legacy completion не переносится автоматически." : "One correct answer does not create mastery. Distinct recognition, direct, transfer and boundary stimuli are required; delayed retention and real-hand transfer are recorded separately. Legacy completion does not migrate automatically."}</p>
    </section>
  </main>;
}
