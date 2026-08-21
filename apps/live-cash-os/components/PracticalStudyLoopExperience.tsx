"use client";

import { useEffect, useMemo, useState } from "react";
import { practicalSkillFamilies, practicalStudyLoop, sessionPerformanceChecks } from "../content/practical-mastery";
import {
  PRACTICAL_MASTERY_STATE_SCHEMA_VERSION,
  createPracticalMasteryState,
  practicalRepairQueue,
  recommendNextPracticalSkill,
  type PracticalMasteryState,
} from "../lib/practical-mastery-core";

const MASTERY_STORAGE_KEY = "live-cash-os:practical-mastery:v3";
const STUDY_STORAGE_KEY = "live-cash-os:study-loop:v1";

type Locale = "ru" | "en";
type StudyWorkspace = {
  version: 1;
  focus: string;
  repairRule: string;
  performanceFlags: string[];
  updatedAt: string;
};

const emptyWorkspace = (): StudyWorkspace => ({ version: 1, focus: "", repairRule: "", performanceFlags: [], updatedAt: new Date(0).toISOString() });

function loadMastery(): PracticalMasteryState {
  if (typeof window === "undefined") return createPracticalMasteryState(new Date(), true);
  try {
    const raw = window.localStorage.getItem(MASTERY_STORAGE_KEY);
    if (!raw) return createPracticalMasteryState(new Date(), true);
    const parsed = JSON.parse(raw) as PracticalMasteryState;
    if (parsed.schemaVersion !== PRACTICAL_MASTERY_STATE_SCHEMA_VERSION || !parsed.skills || !Array.isArray(parsed.attempts)) throw new Error("invalid mastery state");
    return parsed;
  } catch {
    return createPracticalMasteryState(new Date(), true);
  }
}

function loadWorkspace(): StudyWorkspace {
  if (typeof window === "undefined") return emptyWorkspace();
  try {
    const raw = window.localStorage.getItem(STUDY_STORAGE_KEY);
    if (!raw) return emptyWorkspace();
    const parsed = JSON.parse(raw) as StudyWorkspace;
    if (parsed.version !== 1 || typeof parsed.focus !== "string" || typeof parsed.repairRule !== "string" || !Array.isArray(parsed.performanceFlags)) throw new Error("invalid study workspace");
    return parsed;
  } catch {
    return emptyWorkspace();
  }
}

export default function PracticalStudyLoopExperience() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [mastery, setMastery] = useState<PracticalMasteryState>(() => createPracticalMasteryState(new Date(), true));
  const [workspace, setWorkspace] = useState<StudyWorkspace>(() => emptyWorkspace());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setMastery(loadMastery());
    setWorkspace(loadWorkspace());
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STUDY_STORAGE_KEY, JSON.stringify({ ...workspace, updatedAt: new Date().toISOString() }));
  }, [workspace, hydrated]);

  const recommendation = useMemo(() => recommendNextPracticalSkill(mastery), [mastery]);
  const recommendedSkill = recommendation ? practicalSkillFamilies.find((skill) => skill.id === recommendation.skillId) ?? null : null;
  const repairIds = useMemo(() => practicalRepairQueue(mastery), [mastery]);
  const repairSkills = repairIds.map((id) => practicalSkillFamilies.find((skill) => skill.id === id)).filter(Boolean).slice(0, 3);
  const leakRows = useMemo(() => {
    const latest = new Map<string, (typeof mastery.attempts)[number]>();
    for (const attempt of mastery.attempts) latest.set(attempt.decisionId, attempt);
    const bySkill = new Map<string, { wrong: number; highConfidenceWrong: number }>();
    for (const attempt of latest.values()) {
      if (attempt.correct) continue;
      const row = bySkill.get(attempt.skillId) ?? { wrong: 0, highConfidenceWrong: 0 };
      row.wrong += 1;
      if (attempt.confidence >= 75) row.highConfidenceWrong += 1;
      bySkill.set(attempt.skillId, row);
    }
    return [...bySkill.entries()]
      .map(([skillId, row]) => ({ skillId, ...row, score: row.wrong + row.highConfidenceWrong * 2 }))
      .sort((a, b) => b.score - a.score || a.skillId.localeCompare(b.skillId))
      .slice(0, 3);
  }, [mastery]);

  const toggleFlag = (id: string) => setWorkspace((current) => ({
    ...current,
    performanceFlags: current.performanceFlags.includes(id) ? current.performanceFlags.filter((item) => item !== id) : [...current.performanceFlags, id],
  }));

  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">PLAYER DEVELOPMENT · C1</p>
      <h1>{locale === "ru" ? "Играй → разбирай → исправляй → проверяй снова" : "Play → review → repair → retest"}</h1>
      <p className="lede">{locale === "ru" ? "Это не второй курс и не второй mastery score. Loop использует текущую Practical Mastery truth и превращает реальные ошибки в следующий bounded repair." : "This is not a second course or a second mastery score. The loop uses current Practical Mastery truth and turns real errors into the next bounded repair."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <a className="secondary" href="/mastery">← {locale === "ru" ? "Карта навыков" : "Skill map"}</a>
        <a className="secondary" href="/mastery/session">{locale === "ru" ? "Проверить repair" : "Test the repair"} →</a>
      </div>
    </section>

    <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "ОДИН ФОКУС ДО ИГРЫ" : "ONE FOCUS BEFORE PLAY"}</p>
      {recommendedSkill ? <><h2>{recommendedSkill.id} · {locale === "ru" ? recommendedSkill.titleRu : recommendedSkill.titleEn}</h2><p>{recommendation?.whyNow}</p></> : <p>{locale === "ru" ? "Scheduler сейчас не видит следующего честно trainable узла; используй review/retention, а не придумывай новый topic." : "The scheduler currently sees no next honestly trainable node; use review/retention rather than inventing a new topic."}</p>}
      <label style={{ display: "block", marginTop: 14 }}><b>{locale === "ru" ? "Моя короткая focus-cue" : "My short focus cue"}</b><input value={workspace.focus} onChange={(event) => setWorkspace((current) => ({ ...current, focus: event.target.value }))} placeholder={locale === "ru" ? "Напр.: ancestry до river price" : "E.g. ancestry before river price"} style={{ display: "block", width: "100%", marginTop: 8, padding: 10 }} /></label>
      <p className="support">{locale === "ru" ? "Focus note не повышает mastery — это только рабочая память на сессию." : "A focus note does not advance mastery; it is only session working memory."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">SOURCE-BACKED LOOP</p><h2>{locale === "ru" ? "Шесть шагов" : "Six steps"}</h2></div>
      {practicalStudyLoop.map((step, index) => <article key={step.id} className="today-card" style={{ marginTop: 12 }}>
        <p className="eyebrow">{index + 1} · {step.id}</p>
        <h3>{locale === "ru" ? step.titleRu : step.titleEn}</h3>
        <p>{locale === "ru" ? step.instructionRu : step.instructionEn}</p>
        <p className="support">Evidence: {step.evidenceRule}</p>
        <p className="support">Sources: {step.sourceRefs.join(", ")}</p>
      </article>)}
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">CURRENT REPAIR SIGNALS</p><h2>{locale === "ru" ? "Что повторяется сейчас" : "What is repeating now"}</h2></div>
      {leakRows.length ? leakRows.map((row) => {
        const skill = practicalSkillFamilies.find((candidate) => candidate.id === row.skillId);
        return <div key={row.skillId} className="today-card" style={{ marginTop: 10 }}><b>{row.skillId} · {skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : row.skillId}</b><p>{locale === "ru" ? `Нерешённых latest misses: ${row.wrong}; high-confidence wrong: ${row.highConfidenceWrong}.` : `Unresolved latest misses: ${row.wrong}; high-confidence wrong: ${row.highConfidenceWrong}.`}</p></div>;
      }) : <p>{locale === "ru" ? "Пока нет unresolved latest misses. Не создавай искусственный leak — продолжай scheduler/retention." : "There are no unresolved latest misses. Do not manufacture a leak; continue with scheduler/retention."}</p>}
      {repairSkills.length ? <p className="support">Repair queue: {repairSkills.map((skill) => skill?.id).join(" → ")}</p> : null}
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">COMPRESS</p><h2>{locale === "ru" ? "Один repair rule" : "One repair rule"}</h2></div>
      <p>{locale === "ru" ? "Формат: Trigger → Meaning → Action → reversal/boundary. Не записывай outcome или solver action без assumptions." : "Format: Trigger → Meaning → Action → reversal/boundary. Do not store the outcome or a solver action without assumptions."}</p>
      <textarea value={workspace.repairRule} onChange={(event) => setWorkspace((current) => ({ ...current, repairRule: event.target.value }))} rows={5} style={{ width: "100%", padding: 10 }} placeholder="Trigger → Meaning → Action → Boundary" />
      <p className="support">{locale === "ru" ? "Записанное правило — study artifact, не proof. Proof появляется только через scored changed/hidden/delayed reps и real-hand review." : "A written rule is a study artifact, not proof. Proof comes only from scored changed/hidden/delayed reps and real-hand review."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">SESSION QUALITY</p><h2>{locale === "ru" ? "Не путай стратегию с состоянием" : "Do not confuse strategy with state"}</h2></div>
      {sessionPerformanceChecks.map((check) => <article key={check.id} className="today-card" style={{ marginTop: 10 }}>
        <label><input type="checkbox" checked={workspace.performanceFlags.includes(check.id)} onChange={() => toggleFlag(check.id)} /> <b>{locale === "ru" ? check.promptRu : check.promptEn}</b></label>
        {workspace.performanceFlags.includes(check.id) ? <p>{locale === "ru" ? check.responseRu : check.responseEn}</p> : null}
        <p className="support">Sources: {check.sourceRefs.join(", ")}</p>
      </article>)}
      <p className="support">{locale === "ru" ? "Это bounded performance layer из FTGU E30, а не психологическая диагностика, stop-loss prescription или новая strategy authority." : "This is a bounded performance layer from FTGU E30, not psychological diagnosis, a stop-loss prescription, or new strategy authority."}</p>
    </section>
  </main>;
}
