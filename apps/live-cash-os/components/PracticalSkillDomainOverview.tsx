"use client";

import { usePathname } from "next/navigation";
import { practicalSkillFamilies } from "../content/practical-mastery";
import { stageAtLeast } from "../lib/practical-mastery-core";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

const domains = [
  { key: "foundation", waves: ["W1_FOUNDATION", "W2_PREFLOP", "W3_BLINDS"], ru: "База и префлоп", en: "Foundations & preflop", range: "W1–W3", icon: "◫" },
  { key: "postflop", waves: ["W4_RECOGNITION", "W5_SRP_OOP", "W6_SRP_IP", "W7_3BET"], ru: "Постфлоп", en: "Postflop", range: "W4–W7", icon: "◎" },
  { key: "late", waves: ["W8_4BET_LOW_SPR", "W9_TURN", "W10_RIVER"], ru: "4-бет, тёрн и ривер", en: "4-bet, turn & river", range: "W8–W10", icon: "◇" },
  { key: "live", waves: ["W11_MULTIWAY_LIMP", "W12_DEEP_STRADDLE", "W13_EXPLOIT_LIVE"], ru: "Мультивей и live edge", en: "Multiway & live edge", range: "W11–W13", icon: "△" },
  { key: "integration", waves: ["W14_INTEGRATED"], ru: "Интеграция", en: "Integration", range: "W14", icon: "↗" },
] as const;

export default function PracticalSkillDomainOverview() {
  const pathname = usePathname();
  const [locale] = usePracticalLocale();
  const { mastery, ready } = usePracticalProfileState();
  if (pathname !== "/mastery" || !ready) return null;

  return <section className="practical-domain-overview" aria-label={locale === "ru" ? "Прогресс по игровым направлениям" : "Progress by poker domain"}>
    <div className="practical-domain-overview__head">
      <div>
        <p className="eyebrow">{locale === "ru" ? "НАВЫКИ" : "SKILLS"}</p>
        <h2>{locale === "ru" ? "Прогресс по игровым направлениям" : "Progress by poker domain"}</h2>
      </div>
      <p>{locale === "ru" ? "Процент показывает навыки, где уже отработаны самостоятельные решения. Это не глобальный «процент освоения покера»." : "The percentage shows skills with independent decision practice. It is not a global poker-mastery score."}</p>
    </div>
    <div className="practical-domain-overview__grid">
      {domains.map((domain) => {
        const skills = practicalSkillFamilies.filter((skill) => domain.waves.includes(skill.wave as never));
        const trained = skills.filter((skill) => stageAtLeast(mastery.skills[skill.id]?.evidenceStage ?? "SOURCE_SUPPORTED", "DECISION_TRAINED")).length;
        const pct = skills.length ? Math.round((trained / skills.length) * 100) : 0;
        return <article className={`practical-domain-card practical-domain-card--${domain.key}`} key={domain.key}>
          <div className="practical-domain-card__top"><span className="practical-domain-card__icon" aria-hidden="true">{domain.icon}</span><div><h3>{locale === "ru" ? domain.ru : domain.en}</h3><span>{domain.range}</span></div></div>
          <div className="practical-domain-card__bar" aria-label={`${pct}%`}><span style={{ width: `${pct}%` }} /></div>
          <div className="practical-domain-card__meta"><b>{pct}%</b><span>{trained} / {skills.length} {locale === "ru" ? "навыков" : "skills"}</span></div>
        </article>;
      })}
    </div>
  </section>;
}
