"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { practicalSkillFamilies } from "../content/practical-mastery";
import { hardDependenciesFor } from "../content/practical-mastery/learning-route";
import { practicalSourceGapBySkillId } from "../content/practical-mastery/source-gaps";
import type { PracticalSkillFamily } from "../content/practical-mastery";
import {
  availablePracticalSkills,
  practicalRepairQueue,
  recommendNextPracticalSkill,
  stageAtLeast,
} from "../lib/practical-mastery-core";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalNextLearningLink from "./PracticalNextLearningLink";

type Locale = "ru" | "en";

const waveLabels: Record<string, { ru: string; en: string }> = {
  W1_FOUNDATION: { ru: "База решений", en: "Decision foundations" },
  W2_PREFLOP: { ru: "Префлоп", en: "Preflop" },
  W3_BLINDS: { ru: "Блайнды", en: "Blinds" },
  W4_RECOGNITION: { ru: "Распознавание досок и рук", en: "Board and hand recognition" },
  W5_SRP_OOP: { ru: "SRP вне позиции", en: "SRP out of position" },
  W6_SRP_IP: { ru: "SRP в позиции", en: "SRP in position" },
  W7_3BET: { ru: "3-бет-банки", en: "3-bet pots" },
  W8_4BET_LOW_SPR: { ru: "4-бет и низкий SPR", en: "4-bet and low SPR" },
  W9_TURN: { ru: "Тёрн", en: "Turn" },
  W10_RIVER: { ru: "Ривер", en: "River" },
  W11_MULTIWAY_LIMP: { ru: "Мультивей и лимпы", en: "Multiway and limped pots" },
  W12_DEEP_STRADDLE: { ru: "Глубокие стеки и страддлы", en: "Deep stacks and straddles" },
  W13_EXPLOIT_LIVE: { ru: "Эксплойт и live-наблюдения", en: "Exploit and live reads" },
  W14_INTEGRATED: { ru: "Интеграция", en: "Integration" },
};

function waveLabel(wave: string, locale: Locale): string {
  const label = waveLabels[wave];
  return label ? (locale === "ru" ? label.ru : label.en) : wave.replaceAll("_", " ");
}

function evidenceLabel(locale: Locale, stage: string): string {
  const ru: Record<string, string> = {
    SOURCE_SUPPORTED: "не начато",
    CONCEPT_TAUGHT: "механизм изучен",
    RECOGNITION_TRAINED: "распознавание отработано",
    DECISION_TRAINED: "решения отработаны",
    CHANGED_NODE_TRANSFER: "перенос на новые условия",
    BOUNDARY_TESTED: "границы правила проверены",
    DELAYED_RETRIEVAL: "сохраняется после паузы",
    REAL_HAND_TRANSFER: "применён в реальной руке",
  };
  return locale === "ru" ? ru[stage] ?? stage : stage.toLowerCase().replaceAll("_", " ");
}

function skillTitle(skill: PracticalSkillFamily, locale: Locale): string {
  return locale === "ru" ? skill.titleRu : skill.titleEn;
}

export default function PracticalMasteryExperience() {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery: state, ready, syncStatus, cloudMode, recoveryBlocked } = usePracticalProfileState();
  const [selectedSkillId, setSelectedSkillId] = useState("FND-01");

  const skill = practicalSkillFamilies.find((candidate) => candidate.id === selectedSkillId) ?? practicalSkillFamilies[0];
  const progress = state.skills[skill.id];
  const gap = practicalSourceGapBySkillId.get(skill.id);
  const hardPrerequisiteIds = hardDependenciesFor(skill.id).map((dependency) => dependency.fromSkillId);
  const hardPrerequisiteTitles = hardPrerequisiteIds
    .map((id) => practicalSkillFamilies.find((candidate) => candidate.id === id))
    .filter((item): item is PracticalSkillFamily => Boolean(item))
    .map((item) => skillTitle(item, locale));
  const availableIds = useMemo(() => new Set(availablePracticalSkills(state).map((candidate) => candidate.id)), [state]);
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
  const trained = practicalSkillFamilies.filter((item) => stageAtLeast(state.skills[item.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "DECISION_TRAINED")).length;
  const retained = practicalSkillFamilies.filter((item) => stageAtLeast(state.skills[item.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "DELAYED_RETRIEVAL")).length;
  const field = practicalSkillFamilies.filter((item) => stageAtLeast(state.skills[item.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "REAL_HAND_TRANSFER")).length;
  const recommendation = useMemo(() => recommendNextPracticalSkill(state), [state]);
  const recommendedSkill = recommendation ? practicalSkillFamilies.find((item) => item.id === recommendation.skillId) ?? null : null;

  if (!ready) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p></main>;
  if (recoveryBlocked) return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}><h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1><p>{locale === "ru" ? "Прогресс не будет перезаписан. Открой «Данные и восстановление» в инструментах Live Cash OS." : "Practical progress will not be overwritten. Open Data & Recovery in Live Cash OS tools."}</p><Link href="/tools">{locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →</Link></main>;

  return <main style={{ maxWidth: 1180, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? "КАРТА НАВЫКОВ" : "SKILL MAP"}</p>
      <h1>{locale === "ru" ? "Смотри прогресс." : "See your progress."}<br /><em>{locale === "ru" ? "Учись через один маршрут." : "Learn through one route."}</em></h1>
      <p className="lede">{locale === "ru" ? "Карта показывает, что уже получается и что ещё нужно закрепить. Она не является отдельным курсом: для обучения и практики используй «Продолжить обучение»." : "The map shows what is working and what still needs reinforcement. It is not a separate course: use Continue learning for teaching and practice."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <PracticalNextLearningLink className="primary" />
      </div>
      <p className="support">{locale === "ru" ? (cloudMode === "cloud" ? `Облако · ${syncStatus}` : `На устройстве · ${syncStatus}`) : (cloudMode === "cloud" ? `Cloud · ${syncStatus}` : `Local · ${syncStatus}`)}</p>
    </section>

    <section className="metrics">
      <div><b>{trained}</b><span>{locale === "ru" ? "навыков в рабочей практике" : "skills in working practice"}</span></div>
      <div><b>{retained}</b><span>{locale === "ru" ? "сохранились после паузы" : "retained after a delay"}</span></div>
      <div><b>{field}</b><span>{locale === "ru" ? "применены в реальных руках" : "applied in real hands"}</span></div>
      <div><b>{repairIds.size}</b><span>{locale === "ru" ? "нужно повторить" : "need repair"}</span></div>
    </section>

    {recommendedSkill ? <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "СЕЙЧАС ПОЛЕЗНЕЕ ВСЕГО" : "BEST NEXT FOCUS"}</p>
      <h2>{skillTitle(recommendedSkill, locale)}</h2>
      <p>{locale === "ru" ? recommendedSkill.objectiveRu : recommendedSkill.titleEn}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <PracticalNextLearningLink className="primary" />
        <button className="secondary" onClick={() => setSelectedSkillId(recommendedSkill.id)}>{locale === "ru" ? "Посмотреть на карте" : "View on map"} <span>→</span></button>
      </div>
    </section> : null}

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">{locale === "ru" ? "ВСЕ НАВЫКИ" : "ALL SKILLS"}</p><h2>{locale === "ru" ? "По игровым ситуациям" : "Grouped by poker situation"}</h2></div>
      {grouped.map(([wave, skills]) => <details key={wave} open={wave === skill.wave} style={{ marginBottom: 12 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700 }}>{waveLabel(wave, locale)} · {skills.length}</summary>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 10 }}>{skills.map((item) => {
          const itemGap = practicalSourceGapBySkillId.get(item.id);
          const itemProgress = state.skills[item.id];
          const locked = !availableIds.has(item.id);
          const status = itemGap?.status === "SOURCE_BLOCKED"
            ? (locale === "ru" ? "ограничено" : "limited")
            : repairIds.has(item.id)
              ? (locale === "ru" ? "повторить" : "repair")
              : locked
                ? (locale === "ru" ? "пока закрыто" : "locked")
                : evidenceLabel(locale, itemProgress?.evidenceStage ?? "SOURCE_SUPPORTED");
          return <button key={item.id} className={item.id === skill.id ? "primary" : "secondary"} onClick={() => setSelectedSkillId(item.id)} style={{ opacity: locked ? 0.62 : 1 }}>{skillTitle(item, locale)} · {status}</button>;
        })}</div>
      </details>)}
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "ВЫБРАННЫЙ НАВЫК" : "SELECTED SKILL"}</p>
      <h1>{skillTitle(skill, locale)}</h1>
      <p>{locale === "ru" ? skill.objectiveRu : skill.titleEn}</p>
      <p className="support">{locale === "ru" ? "Сейчас" : "Current"}: <b>{evidenceLabel(locale, progress?.evidenceStage ?? "SOURCE_SUPPORTED")}</b> · {locale === "ru" ? "Цель" : "Goal"}: {evidenceLabel(locale, skill.targetEvidenceStage)}</p>

      {gap ? <div className="today-card" style={{ marginTop: 14 }}><p className="eyebrow">{locale === "ru" ? "ПОКА ЕСТЬ ОГРАНИЧЕНИЕ" : "CURRENT LIMIT"}</p><p>{locale === "ru" ? gap.reasonRu : gap.reason}</p><p className="support">{locale === "ru" ? gap.nextEvidenceNeededRu : gap.nextEvidenceNeeded}</p></div> : null}
      {!availableIds.has(skill.id) ? <p className="support">{locale === "ru" ? `Сначала нужны: ${hardPrerequisiteTitles.join(", ") || "предыдущие базовые навыки"}.` : `First complete: ${hardPrerequisiteTitles.join(", ") || "the required foundations"}.`}</p> : null}

      <div className="today-card" style={{ marginTop: 18 }}>
        <p className="eyebrow">{locale === "ru" ? "ЧТО ДЕЛАТЬ ДАЛЬШЕ" : "WHAT TO DO NEXT"}</p>
        <p>{locale === "ru"
          ? repairIds.has(skill.id)
            ? "Этот навык стоит повторить. Основной маршрут сам вернёт нужную задачу и не засчитает исправление как удержание после паузы."
            : "Продолжай через основной маршрут: он сам решит, нужен новый механизм, самостоятельная задача, изменённые условия или повторение после паузы."
          : repairIds.has(skill.id)
            ? "This skill needs repair. The primary route will bring back the right item without pretending an immediate repair is delayed retention."
            : "Continue through the primary route; it will choose whether you need teaching, an independent decision, changed conditions, or delayed review."}</p>
        <PracticalNextLearningLink className="primary" />
      </div>
    </section>
  </main>;
}
