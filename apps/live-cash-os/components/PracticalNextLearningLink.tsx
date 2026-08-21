"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { firstJourneyProgress } from "../lib/practical-first-journey";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

export function usePracticalNextLearningHref(): string {
  const { mastery, ready } = usePracticalProfileState();
  if (!ready) return "/mastery/journey";
  return firstJourneyProgress(mastery).completed ? "/mastery/session" : "/mastery/journey";
}

export default function PracticalNextLearningLink({
  className,
  style,
  children,
  labelRu = "Продолжить обучение",
  labelEn = "Continue learning",
}: {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  labelRu?: string;
  labelEn?: string;
}) {
  const [locale] = usePracticalLocale();
  const href = usePracticalNextLearningHref();
  return <Link className={className} style={style} href={href}>{children ?? (locale === "ru" ? labelRu : labelEn)}</Link>;
}
