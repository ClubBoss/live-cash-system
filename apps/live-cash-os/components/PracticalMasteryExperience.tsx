"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { practicalAnchors, practicalDecisions, practicalSkillFamilies } from "../content/practical-mastery";
import { hardDependenciesFor } from "../content/practical-mastery/learning-route";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import type { PracticalDecision, PracticalSkillFamily } from "../content/practical-mastery";
import {
  availablePracticalSkills,
  markPracticalConceptTaught,
  nextPracticalDecision,
  practicalPrerequisitesMet,
  practicalRepairQueue,
  practicalSkillCorpusCanReach,
  practicalSkillCorpusStats,
  recommendNextPracticalSkill,
  recordPracticalDecision,
  stageAtLeast,
  trainablePracticalSkills,
  type PracticalMasteryState,
} from "../lib/practical-mastery-core";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

type Locale = "ru" | "en";

function waveLabel(wave: string, locale: Locale): string {
  const number = wave.match(/^W(\d+)_/)?.[1] ?? "";
  const tail = wave.replace(/^W\d+_/, "").replaceAll("_", " ");
  return locale === "ru" ? `Этап ${number}` : `Wave ${number} · ${tail}`;
}

function evidenceLabel(locale: Locale, stage: string): string {
  const ru: Record<string, string> = {
    SOURCE_SUPPORTED: "есть источник",
    CONCEPT_TAUGHT: "механизм изучен",
    RECOGNITION_TRAINED: "распознавание отработано",
    DECISION_TRAINED: "решения отработаны",
    CHANGED_NODE_TRANSFER: "перенос на похожие споты",
    BOUNDARY_TESTED: "границы правила проверены",
    DELAYED_RETRIEVAL: "сохраняется после паузы",
    REAL_HAND_TRANSFER: "применён в реальной руке",
  };
  return locale === "ru" ? ru[stage] ?? stage : stage.toLowerCase().replaceAll("_", " ");
}

function skillTitle(skill: PracticalSkillFamily, locale: Locale): string { return locale === "ru" ? skill.titleRu : skill.titleEn; }
function optionText(option: { textRu: string; textEn: string }, locale: Locale): string { return locale === "ru" ? option.textRu : option.textEn; }

function DecisionCard({ locale, decision, state, onState }: { locale: Locale; decision: PracticalDecision; state: PracticalMasteryState; onState: (state: PracticalMasteryState) => void }) {
  const [actionId, setActionId] = useState("");
  const [reasonId, setReasonId] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [revealed, setRevealed] = useState(false);
  const [wasCorrect, setWasCorrect] = useState<boolean | null>(null);

  useEffect(() => { setActionId(""); setReasonId(""); setConfidence(65); setRevealed(false); setWasCorrect(null); }, [decision.id]);
  const submit = () => {
    if (!actionId || !reasonId) return;
    const correct = actionId === decision.correctActionId && reasonId === decision.correctReasonId;
    onState(recordPracticalDecision(state, { decisionId: decision.id, actionId, reasonId, confidence }));
    setWasCorrect(correct); setRevealed(true);
  };

  return <article className="today-card" style={{ marginTop: 18 }}>
    <p className="eyebrow">{locale === "ru" ? "РЕШЕНИЕ" : decision.kind.toUpperCase()} · {decision.id}</p>
    <h2>{locale === "ru" ? decision.cueRu : decision.cueEn}</h2>
    <p>{locale === "ru" ? decision.questionRu : decision.questionEn}</p>
    <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}><legend><b>{locale === "ru" ? "Действие / вывод" : "Action / conclusion"}</b></legend>{decision.actionOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}><input type="radio" name={`${decision.id}-action`} checked={actionId === option.id} disabled={revealed} onChange={() => setActionId(option.id)} /> {optionText(option, locale)}</label>)}</fieldset>
    <fieldset style={{ border: 0, padding: 0, margin: "18px 0" }}><legend><b>{locale === "ru" ? "Почему" : "Why"}</b></legend>{decision.reasonOptions.map((option) => <label key={option.id} style={{ display: "block", marginTop: 9 }}><input type="radio" name={`${decision.id}-reason`} checked={reasonId === option.id} disabled={revealed} onChange={() => setReasonId(option.id)} /> {optionText(option, locale)}</label>)}</fieldset>
    <label style={{ display: "block", marginBottom: 15 }}>{locale === "ru" ? "Уверенность" : "Confidence"}: <b>{confidence}%</b><br /><input aria-label={locale === "ru" ? "Уверенность" : "Confidence"} type="range" min="0" max="100" value={confidence} disabled={revealed} onChange={(event) => setConfidence(Number(event.target.value))} /></label>
    {!revealed ? <button className="primary" disabled={!actionId || !reasonId} onClick={submit}>{locale === "ru" ? "Ответить" : "Answer"} <span>→</span></button> : <div><p><b>{wasCorrect ? (locale === "ru" ? "Верно" : "Correct") : (locale === "ru" ? "Нужно исправить" : "Repair needed")}</b></p><p>{locale === "ru" ? decision.explanationRu : decision.explanationEn}</p><p className="support">{locale === "ru" ? "Источники" : "Sources"}: {decision.sourceRefs.join(", ")}</p></div>}
  </article>;
}

export default function PracticalMasteryExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery: state, setMastery, ready, syncStatus, cloudMode, recoveryBlocked } = usePracticalProfileState();
  const [selectedSkillId, setSelectedSkillId] = useState("FND-01");

  const skill = practicalSkillFamilies.find((candidate) => candidate.id === selectedSkillId) ?? practicalSkillFamilies[0];
  const progress = state.skills[skill.id];
  const available = practicalPrerequisitesMet(state, skill.id);
  const corpusStats = practicalSkillCorpusStats(skill.id);
  const decisionTrainable = practicalSkillCorpusCanReach(skill.id, "DECISION_TRAINED");
  const decision = available && progress?.conceptTaught ? nextPracticalDecision(state, skill.id) : null;
  const gap = practicalSourceGapBySkillId.get(skill.id);
  const lessonAnchors = practicalAnchors.filter((anchor) => anchor.skillId === skill.id);
  const hardPrerequisiteIds = hardDependenciesFor(skill.id).map((dependency) => dependency.fromSkillId);
  const availableIds = useMemo(() => new Set(availablePracticalSkills(state).map((candidate) => candidate.id)), [state]);
  const trainableIds = useMemo(() => new Set(trainablePracticalSkills(state).map((candidate) => candidate.id)), [state]);
  const repairIds = useMemo(() => new Set(practicalRepairQueue(state)), [state]);
  const grouped = useMemo(() => {
    const map = new Map<string, PracticalSkillFamily[]>();
    for (const item of practicalSkillFamilies) { const list = map.get(item.wave) ?? []; list.push(item); map.set(item.wave, list); }
    return [...map.entries()];
  }, []);
  const attempted = state.attempts.length;
  const correct = state.attempts.filter((attempt) => attempt.correct).length;
  const trained = practicalSkillFamilies.filter((item) => stageAtLeast(state.skills[item.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "DECISION_TRAINED")).length;
  const recommendation = useMemo(() => recommendNextPracticalSkill(state), [state]);
  const recommendedSkill = recommendation ? practicalSkillFamilies.find((item) => item.id === recommendation.skillId) ?? null : null;

  if (!ready) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><p>{locale === "ru" ? "Прогресс не будет перезаписан. Вернись в Live Cash OS и открой раздел «Данные и восстановление»." : "Practical progress will not be overwritten. Return to Live Cash OS and use Data & Recovery."}</p><Link href="/">Live Cash OS →</Link></main>;

  return <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">PRACTICAL MASTERY · W0–W14</p>
      <h1>{locale === "ru" ? "Не пройти курс." : "Not finish a course."}<br /><em>{locale === "ru" ? "Научиться принимать решения." : "Build a decision engine."}</em></h1>
      <p className="lede">{locale === "ru" ? "Карта навыков ведёт от понимания к распознаванию, решениям, переносу на новые споты и проверке после паузы." : "The skill graph moves from understanding to recognition, decisions, transfer, and delayed retrieval."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}><div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div><Link className="secondary" href="/mastery/session">{locale === "ru" ? "Смешанная практика" : "Mixed session"} →</Link></div>
      <p className="support">{locale === "ru" ? (cloudMode === "cloud" ? `Облако · ${syncStatus}` : `На устройстве · ${syncStatus}`) : (cloudMode === "cloud" ? `Cloud · ${syncStatus}` : `Local · ${syncStatus}`)}</p>
    </section>

    <section className="metrics">
      <div><b>{practicalSkillFamilies.length}</b><span>{locale === "ru" ? "навыков" : "skill families"}</span></div>
      <div><b>{practicalDecisions.length}</b><span>{locale === "ru" ? "задач" : "scored decisions"}</span></div>
      <div><b>{trained}</b><span>{locale === "ru" ? "навыков с отработанными решениями" : "decision-trained skills"}</span></div>
      <div><b>{attempted ? Math.round((correct / attempted) * 100) : 0}%</b><span>{locale === "ru" ? "точность" : "accuracy"}</span></div>
    </section>

    {recommendedSkill ? <section className="today-card" style={{ marginTop: 22 }}><p className="eyebrow">{locale === "ru" ? "РЕКОМЕНДОВАНО СЕЙЧАС" : "RECOMMENDED NOW"}</p><h2>{skillTitle(recommendedSkill, locale)}</h2><p>{locale === "ru" ? recommendedSkill.objectiveRu : recommendedSkill.titleEn}</p><p className="support">{locale === "ru" ? "Система выбрала этот навык с учётом текущих ошибок, готовности и пользы за реальным столом." : recommendation?.whyNow}</p><button className="primary" onClick={() => setSelectedSkillId(recommendedSkill.id)}>{locale === "ru" ? "Продолжить обучение" : "Continue learning"} <span>→</span></button></section> : null}

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "КАРТА НАВЫКОВ" : "SKILL GRAPH"}</p><h2>{locale === "ru" ? "Что уже отработано и что дальше" : "Skill map"}</h2></div>{grouped.map(([wave, skills]) => <details key={wave} open={wave === skill.wave} style={{ marginBottom: 12 }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{waveLabel(wave, locale)} · {skills.length}</summary><div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{skills.map((item) => {
      const itemGap = practicalSourceGapBySkillId.get(item.id); const itemProgress = state.skills[item.id]; const locked = !availableIds.has(item.id); const trainable = trainableIds.has(item.id);
      const suffix = itemGap?.status === "SOURCE_BLOCKED" ? (locale === "ru" ? " · НЕТ ИСТОЧНИКА" : " · SOURCE BLOCKED") : repairIds.has(item.id) ? (locale === "ru" ? " · ИСПРАВИТЬ" : " · REPAIR") : !trainable && !locked ? (locale === "ru" ? " · НУЖНЫ ЕЩЁ ЗАДАЧИ" : " · CONTENT BUILD") : itemProgress ? ` · ${evidenceLabel(locale, itemProgress.evidenceStage)}` : "";
      return <button key={item.id} className={item.id === skill.id ? "primary" : "secondary"} onClick={() => setSelectedSkillId(item.id)} style={{ opacity: locked ? 0.58 : 1 }}>{item.id} · {skillTitle(item, locale)}{suffix}</button>;
    })}</div></details>)}</section>

    <section className="surface" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? `НАВЫК · ${skill.id}` : `${skill.wave} · ${skill.livePriority}`}</p><h1>{skillTitle(skill, locale)}</h1><p>{locale === "ru" ? skill.objectiveRu : skill.titleEn}</p>
      <p className="support">{locale === "ru" ? "Цель" : "Target evidence"}: {evidenceLabel(locale, skill.targetEvidenceStage)} · {locale === "ru" ? "Сейчас" : "Current"}: {evidenceLabel(locale, progress?.evidenceStage ?? "SOURCE_SUPPORTED")}</p>
      <p className="support">{locale === "ru" ? `Практика: распознавание ${corpusStats.recognition} · решения ${corpusStats.direct} · перенос ${corpusStats.transfer} · границы ${corpusStats.boundary}` : `Corpus: R ${corpusStats.recognition} · D ${corpusStats.direct} · T ${corpusStats.transfer} · B ${corpusStats.boundary}`}</p>
      <p className="support">{locale === "ru" ? "Источники" : "Sources"}: {skill.sourceRefs.join(", ")}</p>

      {gap ? <div className="today-card" style={{ marginTop: 14 }}><p className="eyebrow">{locale === "ru" ? "ОГРАНИЧЕНИЕ ИСТОЧНИКА" : `SOURCE ${gap.status}`}</p><p>{locale === "ru" ? gap.reasonRu : gap.reason}</p><p className="support">{locale === "ru" ? gap.nextEvidenceNeededRu : gap.nextEvidenceNeeded}</p></div> : null}
      {!available ? <p className="support">{locale === "ru" ? `Пока закрыто: сначала отработай обязательные навыки — ${hardPrerequisiteIds.join(", ") || "—"}.` : `Locked: first decision-train HARD prerequisites — ${hardPrerequisiteIds.join(", ") || "—"}.`}</p> : null}
      {available && !decisionTrainable && (!gap || gap.status !== "SOURCE_BLOCKED") ? <p className="support">{locale === "ru" ? "Для следующего уровня пока не хватает разных независимых задач." : "The corpus is not yet sufficient for an honest stage advance."}</p> : null}

      {available && (!gap || gap.status !== "SOURCE_BLOCKED") && !progress?.conceptTaught && lessonAnchors.length > 0 ? <div className="today-card" style={{ marginTop: 18 }}><p className="eyebrow">{locale === "ru" ? "СНАЧАЛА ПОЙМИ МЕХАНИЗМ" : "UNDERSTAND THE MECHANISM FIRST"}</p>{lessonAnchors.map((anchor) => <div key={anchor.id} style={{ marginTop: 14 }}><h3>{locale === "ru" ? anchor.titleRu : anchor.titleEn}</h3><p>{locale === "ru" ? anchor.bodyRu : anchor.bodyEn}</p><p className="support">{locale === "ru" ? "Источники" : "Sources"}: {anchor.sourceRefs.join(", ")}</p></div>)}<button className="primary" onClick={() => setMastery(markPracticalConceptTaught(state, skill.id))}>{locale === "ru" ? "Механизм понятен — к практике" : "Mechanism understood — practice"} <span>→</span></button></div> : null}
      {available && !progress?.conceptTaught && lessonAnchors.length === 0 ? <p className="support">{locale === "ru" ? "Для этого навыка пока нет отдельного подтверждённого объяснения. Система не будет засчитывать понимание автоматически." : "There is no source-backed teaching anchor for this skill yet; concept evidence will not be granted automatically."}</p> : null}
      {available && progress?.conceptTaught && decision ? <DecisionCard locale={locale} decision={decision} state={state} onState={setMastery} /> : null}
      {available && progress?.conceptTaught && !decision && (!gap || gap.status !== "SOURCE_BLOCKED") ? <p className="support">{locale === "ru" ? "На текущем уровне пока нет следующей независимой задачи. Нужна дополнительная практика, проверка после паузы или разбор реальной руки." : "There is no next independent item at this stage. Additional practice, delayed retrieval, or real-hand review is required."}</p> : null}
    </section>
  </main>;
}
