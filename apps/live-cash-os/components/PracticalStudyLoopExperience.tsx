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
      <p className="eyebrow">{locale === "ru" ? "РАБОТА НАД ИГРОЙ" : "PLAYER DEVELOPMENT"}</p>
      <h1>{locale === "ru" ? "Играй → разбирай → исправляй → проверяй снова" : "Play → review → repair → retest"}</h1>
      <p className="lede">{locale === "ru" ? "Это не второй курс и не отдельная оценка. Раздел берёт реальные ошибки из твоего прогресса и превращает их в следующий короткий цикл работы." : "This is not a second course or a separate score. It uses your current mistakes to build the next short review cycle."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <Link className="secondary" href="/mastery">← {locale === "ru" ? "Карта навыков" : "Skill map"}</Link>
        <Link className="secondary" href="/mastery/session">{locale === "ru" ? "Проверить исправление" : "Test the repair"} →</Link>
      </div>
    </section>

    <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "ОДИН ФОКУС ДО ИГРЫ" : "ONE FOCUS BEFORE PLAY"}</p>
      {recommendedSkill ? <><h2>{locale === "ru" ? recommendedSkill.titleRu : recommendedSkill.titleEn}</h2><p>{locale === "ru" ? "Сейчас полезнее всего продолжить этот навык: система учитывает текущие ошибки, готовность и ценность переноса за стол." : "This is the most useful skill to continue now based on current mistakes, readiness, and transfer value."}</p></> : <p>{locale === "ru" ? "Сейчас нет следующей подходящей новой темы. Вернись к повторению и текущим ошибкам вместо того, чтобы добавлять новый материал." : "There is no suitable new topic right now. Return to review and current mistakes instead of adding new material."}</p>}
      <label style={{ display: "block", marginTop: 14 }}><b>{locale === "ru" ? "Твоя сохранённая заметка на эту сессию" : "Your saved session note"}</b><input value={workspace.focus} onChange={(event) => updateWorkspace({ focus: event.target.value })} placeholder={locale === "ru" ? "Напр.: сначала история линии, потом цена river call" : "E.g. line history before river call price"} style={{ display: "block", width: "100%", marginTop: 8, padding: 10 }} /></label>
      <p className="support">{locale === "ru" ? "Это твоя собственная сохранённая заметка. Системная рекомендация выше меняется отдельно; поле не заменяет её и не обновляется автоматически." : "This is your own saved note. The system recommendation above changes separately; this field neither replaces it nor updates automatically."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "ЦИКЛ РАБОТЫ" : "REVIEW LOOP"}</p><h2>{locale === "ru" ? "Шесть шагов" : "Six steps"}</h2></div>{practicalStudyLoop.map((step, index) => <article key={step.id} className="today-card" style={{ marginTop: 12 }}><p className="eyebrow">{index + 1}</p><h3>{locale === "ru" ? step.titleRu : step.titleEn}</h3><p>{locale === "ru" ? step.instructionRu : step.instructionEn}</p><p className="support">{locale === "ru" ? `Как проверяем: ${step.evidenceRuleRu}` : `How we check: ${step.evidenceRule}`}</p></article>)}</section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "ТЕКУЩИЕ ОШИБКИ" : "CURRENT MISTAKES"}</p><h2>{locale === "ru" ? "Что повторяется сейчас" : "What is repeating now"}</h2></div>{leakRows.length ? leakRows.map((row) => { const skill = practicalSkillFamilies.find((candidate) => candidate.id === row.skillId); return <div key={row.skillId} className="today-card" style={{ marginTop: 10 }}><b>{skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : (locale === "ru" ? "Игровой навык" : "Poker skill")}</b><p>{locale === "ru" ? `Актуальных ошибок: ${row.wrong}; из них с высокой уверенностью: ${row.highConfidenceWrong}.` : `Current mistakes: ${row.wrong}; high-confidence mistakes: ${row.highConfidenceWrong}.`}</p></div>; }) : <p>{locale === "ru" ? "Сейчас нет повторяющейся нерешённой ошибки. Продолжай обычную практику и отложенные проверки." : "There are no repeating unresolved mistakes right now. Continue regular practice and delayed review."}</p>}{repairSkills.length ? <p className="support">{locale === "ru" ? "Вернуться к" : "Return to"}: {repairSkills.map((skill) => locale === "ru" ? skill?.titleRu : skill?.titleEn).filter(Boolean).join(" → ")}</p> : null}</section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "СЖАТЬ ВЫВОД" : "COMPRESS"}</p><h2>{locale === "ru" ? "Одно рабочее правило" : "One repair rule"}</h2></div><p>{locale === "ru" ? "Формат: Сигнал → Что он значит → Действие → Когда правило перестаёт работать. Не записывай действие из solver без условий задачи." : "Format: Trigger → Meaning → Action → Boundary. Do not store a solver action without the assumptions that make it valid."}</p><textarea value={workspace.repairRule} onChange={(event) => updateWorkspace({ repairRule: event.target.value })} rows={5} style={{ width: "100%", padding: 10 }} placeholder={locale === "ru" ? "Сигнал → Значение → Действие → Граница" : "Trigger → Meaning → Action → Boundary"} /><p className="support">{locale === "ru" ? "Записанное правило — материал для учёбы, а не доказательство навыка. Проверка — новые споты, задача без подсказки, возврат позже и разбор реальной руки." : "A written rule is a study note, not proof of skill. Check it in new situations, without hints, after a delay, and in reviewed real hands."}</p></section>

    <section className="surface" style={{ marginTop: 22 }}><div className="section-head"><p className="eyebrow">{locale === "ru" ? "КАЧЕСТВО СЕССИИ" : "SESSION QUALITY"}</p><h2>{locale === "ru" ? "Не путай стратегию со своим состоянием" : "Do not confuse strategy with state"}</h2></div>{sessionPerformanceChecks.map((check) => <article key={check.id} className="today-card" style={{ marginTop: 10 }}><label><input type="checkbox" checked={workspace.performanceFlags.includes(check.id)} onChange={() => toggleFlag(check.id)} /> <b>{locale === "ru" ? check.promptRu : check.promptEn}</b></label>{workspace.performanceFlags.includes(check.id) ? <p>{locale === "ru" ? check.responseRu : check.responseEn}</p> : null}</article>)}<p className="support">{locale === "ru" ? "Это небольшой контроль качества сессии, а не психологическая диагностика и не правило stop-loss." : "This is a small session-quality check, not a psychological diagnosis or a stop-loss rule."}</p></section>
  </main>;
}
