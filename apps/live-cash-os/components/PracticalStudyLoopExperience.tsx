"use client";

import Link from "next/link";
import { useMemo } from "react";
import { practicalSkillFamilies, practicalStudyLoop, sessionPerformanceChecks } from "../content/practical-mastery";
import { practicalRepairQueue, recommendNextPracticalSkill } from "../lib/practical-mastery-core";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

export default function PracticalStudyLoopExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery, studyWorkspace: workspace, setStudyWorkspace, ready, recoveryBlocked } = usePracticalProfileState();

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

  const updateWorkspace = (patch: Partial<typeof workspace>) => setStudyWorkspace({ ...workspace, ...patch, updatedAt: new Date().toISOString() });
  const toggleFlag = (id: string) => updateWorkspace({
    performanceFlags: workspace.performanceFlags.includes(id)
      ? workspace.performanceFlags.filter((item) => item !== id)
      : [...workspace.performanceFlags, id],
  });

  if (!ready) return <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><p>{locale === "ru" ? "Прогресс не будет перезаписан. Открой «Данные и восстановление» в инструментах Live Cash OS." : "Practical progress will not be overwritten. Open Data & Recovery in Live Cash OS tools."}</p><Link href="/tools">{locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →</Link></main>;

  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? "РАБОТА НАД ИГРОЙ" : "PLAYER DEVELOPMENT · C1"}</p>
      <h1>{locale === "ru" ? "Играй → разбирай → исправляй → проверяй снова" : "Play → review → repair → retest"}</h1>
      <p className="lede">{locale === "ru" ? "Это не второй курс и не отдельная оценка. Раздел берёт реальные ошибки из твоего прогресса и превращает их в следующий короткий цикл работы." : "This is not a second course or a second mastery score. The loop uses current Practical Mastery truth and turns real errors into the next bounded repair."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <Link className="secondary" href="/mastery">← {locale === "ru" ? "Карта навыков" : "Skill map"}</Link>
        <Link className="secondary" href="/mastery/session">{locale === "ru" ? "Проверить исправление" : "Test the repair"} →</Link>
      </div>
    </section>

    <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "ОДИН ФОКУС ДО ИГРЫ" : "ONE FOCUS BEFORE PLAY"}</p>
      {recommendedSkill ? <><h2>{recommendedSkill.id} · {locale === "ru" ? recommendedSkill.titleRu : recommendedSkill.titleEn}</h2><p>{locale === "ru" ? "Сейчас полезнее всего продолжить этот навык: система учитывает текущие ошибки, готовность и ценность переноса за стол." : recommendation?.whyNow}</p></> : <p>{locale === "ru" ? "Сейчас нет следующей подходящей новой темы. Вернись к повторению и текущим ошибкам вместо того, чтобы добавлять новый материал." : "The scheduler sees no next honestly trainable node; use review/retention rather than inventing a topic."}</p>}
      <label style={{ display: "block", marginTop: 14 }}><b>{locale === "ru" ? "Короткий фокус на сессию" : "My short focus cue"}</b><input value={workspace.focus} onChange={(event) => updateWorkspace({ focus: event.target.value })} placeholder={locale === "ru" ? "Напр.: сначала история линии, потом цена river call" : "E.g. ancestry before river price"} style={{ display: "block", width: "100%", marginTop: 8, padding: 10 }} /></label>
      <p className="support">{locale === "ru" ? "Эта заметка помогает держать фокус, но сама по себе не повышает уровень навыка." : "A focus note does not advance mastery; it is only session working memory."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "ЦИКЛ РАБОТЫ" : "SOURCE-BACKED LOOP"}</p><h2>{locale === "ru" ? "Шесть шагов" : "Six steps"}</h2></div>{practicalStudyLoop.map((step, index) => <article key={step.id} className="today-card" style={{ marginTop: 12 }}><p className="eyebrow">{index + 1}</p><h3>{locale === "ru" ? step.titleRu : step.titleEn}</h3><p>{locale === "ru" ? step.instructionRu : step.instructionEn}</p><p className="support">{locale === "ru" ? `Как проверяем: ${step.evidenceRuleRu}` : `Evidence: ${step.evidenceRule}`}</p><p className="support">{locale === "ru" ? "Источники" : "Sources"}: {step.sourceRefs.join(", ")}</p></article>)}</section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "ТЕКУЩИЕ ОШИБКИ" : "CURRENT REPAIR SIGNALS"}</p><h2>{locale === "ru" ? "Что повторяется сейчас" : "What is repeating now"}</h2></div>{leakRows.length ? leakRows.map((row) => { const skill = practicalSkillFamilies.find((candidate) => candidate.id === row.skillId); return <div key={row.skillId} className="today-card" style={{ marginTop: 10 }}><b>{row.skillId} · {skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : row.skillId}</b><p>{locale === "ru" ? `Актуальных ошибок: ${row.wrong}; из них с высокой уверенностью: ${row.highConfidenceWrong}.` : `Unresolved latest misses: ${row.wrong}; high-confidence wrong: ${row.highConfidenceWrong}.`}</p></div>; }) : <p>{locale === "ru" ? "Сейчас нет повторяющейся нерешённой ошибки. Продолжай обычную практику и отложенные проверки." : "There are no unresolved latest misses. Do not manufacture a leak; continue with scheduler/retention."}</p>}{repairSkills.length ? <p className="support">{locale === "ru" ? "Вернуться к" : "Repair queue"}: {repairSkills.map((skill) => skill?.id).join(" → ")}</p> : null}</section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "СЖАТЬ ВЫВОД" : "COMPRESS"}</p><h2>{locale === "ru" ? "Одно рабочее правило" : "One repair rule"}</h2></div><p>{locale === "ru" ? "Формат: Сигнал → Что он значит → Действие → Когда правило перестаёт работать. Не записывай действие из solver без условий задачи." : "Format: Trigger → Meaning → Action → reversal/boundary. Do not store the outcome or a solver action without assumptions."}</p><textarea value={workspace.repairRule} onChange={(event) => updateWorkspace({ repairRule: event.target.value })} rows={5} style={{ width: "100%", padding: 10 }} placeholder={locale === "ru" ? "Сигнал → Значение → Действие → Граница" : "Trigger → Meaning → Action → Boundary"} /><p className="support">{locale === "ru" ? "Записанное правило — материал для учёбы, а не доказательство навыка. Проверка — новые споты, задача без подсказки, возврат позже и разбор реальной руки." : "A written rule is a study artifact, not proof. Proof comes only from scored changed/hidden/delayed reps and real-hand review."}</p></section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "КАЧЕСТВО СЕССИИ" : "SESSION QUALITY"}</p><h2>{locale === "ru" ? "Не путай стратегию со своим состоянием" : "Do not confuse strategy with state"}</h2></div>{sessionPerformanceChecks.map((check) => <article key={check.id} className="today-card" style={{ marginTop: 10 }}><label><input type="checkbox" checked={workspace.performanceFlags.includes(check.id)} onChange={() => toggleFlag(check.id)} /> <b>{locale === "ru" ? check.promptRu : check.promptEn}</b></label>{workspace.performanceFlags.includes(check.id) ? <p>{locale === "ru" ? check.responseRu : check.responseEn}</p> : null}<p className="support">{locale === "ru" ? "Источники" : "Sources"}: {check.sourceRefs.join(", ")}</p></article>)}<p className="support">{locale === "ru" ? "Это небольшой слой контроля качества сессии из FTGU E30, а не психологическая диагностика и не правило stop-loss." : "This is a bounded performance layer from FTGU E30, not psychological diagnosis or a stop-loss prescription."}</p></section>
  </main>;
}
