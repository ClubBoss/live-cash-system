"use client";

import { practicalSkillById } from "../content/practical-mastery";
import { practicalConceptsForTexts } from "../content/practical-mastery/novice-concepts";

type Locale = "ru" | "en";

export default function PracticalConceptPrimer({
  skillId,
  locale,
  teachingTexts = [],
  compact = false,
}: {
  skillId: string;
  locale: Locale;
  teachingTexts?: Array<string | null | undefined>;
  compact?: boolean;
}) {
  const skill = practicalSkillById.get(skillId);
  const texts = [
    skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : "",
    skill ? (locale === "ru" ? skill.objectiveRu : skill.objectiveEn) : "",
    ...teachingTexts,
  ];
  const concepts = practicalConceptsForTexts(locale, texts);
  if (!concepts.length) return null;

  return <div className="today-card" style={{ marginTop: compact ? 12 : 20 }}>
    <p className="eyebrow">{locale === "ru" ? "ТЕРМИНЫ ЭТОГО ШАГА" : "TERMS FOR THIS STEP"}</p>
    <p className="support">{locale === "ru"
      ? "Ничего из этого не нужно было знать заранее. Это термины текущего разбора, поэтому сначала зафиксируй их простой смысл."
      : "You were not expected to know these in advance. These are terms from the current teaching step, so first anchor their plain meaning."}</p>
    <dl style={{ margin: 0 }}>
      {concepts.map((concept) => <div key={concept.id} style={{ marginTop: 10 }}>
        <dt><b>{locale === "ru" ? concept.labelRu : concept.labelEn}</b></dt>
        <dd style={{ margin: "3px 0 0" }}>{locale === "ru" ? concept.meaningRu : concept.meaningEn}</dd>
      </div>)}
    </dl>
  </div>;
}
