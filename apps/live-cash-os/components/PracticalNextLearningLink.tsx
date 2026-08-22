"use client";

import type { CSSProperties, ReactNode } from "react";
import { usePracticalLocale } from "../lib/use-practical-locale";
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
  return <PracticalDocumentLink className={className} style={style} href="/mastery/journey" aria-current={ariaCurrent}>{children ?? (locale === "ru" ? labelRu : labelEn)}</PracticalDocumentLink>;
}
