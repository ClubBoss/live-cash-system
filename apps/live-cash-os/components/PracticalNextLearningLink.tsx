"use client";

import { type CSSProperties, type ReactNode } from "react";
import { usePracticalLocale } from "../lib/use-practical-locale";
import PracticalDocumentLink from "./PracticalDocumentLink";

export default function PracticalNextLearningLink({
  className,
  style,
  children,
  ariaCurrent,
  labelRu = "Продолжить обучение",
  labelEn = "Continue learning",
  focusSkillId,
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ariaCurrent?: "page";
  labelRu?: string;
  labelEn?: string;
  focusSkillId?: string;
}) {
  const [locale] = usePracticalLocale();
  const content = children ?? (locale === "ru" ? labelRu : labelEn);

  if (focusSkillId) {
    return <PracticalDocumentLink className={className} style={style} href={`/mastery/session?focus=${encodeURIComponent(focusSkillId)}`} aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
  }

  return <PracticalDocumentLink className={className} style={style} href="/mastery/journey" aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
}
