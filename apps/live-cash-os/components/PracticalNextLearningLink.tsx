"use client";

import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { recommendNextPracticalSkill } from "../lib/practical-mastery-core";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDocumentLink from "./PracticalDocumentLink";

export default function PracticalNextLearningLink({
  className,
  style,
  children,
  ariaCurrent,
  labelRu = "Продолжить обучение",
  labelEn = "Continue learning",
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ariaCurrent?: "page";
  labelRu?: string;
  labelEn?: string;
}) {
  const [locale] = usePracticalLocale();
  const { mastery, ready } = usePracticalProfileState();
  const [onSkillMap, setOnSkillMap] = useState(false);

  useEffect(() => { setOnSkillMap(window.location.pathname === "/mastery"); }, []);
  const recommendation = useMemo(() => onSkillMap && ready ? recommendNextPracticalSkill(mastery) : null, [mastery, onSkillMap, ready]);
  const href = recommendation ? `/mastery/session?focus=${encodeURIComponent(recommendation.skillId)}` : "/mastery/journey";

  return <PracticalDocumentLink className={className} style={style} href={href} aria-current={ariaCurrent}>{children ?? (locale === "ru" ? labelRu : labelEn)}</PracticalDocumentLink>;
}
