"use client";

import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { firstJourneyProgress } from "../lib/practical-first-journey";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";

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
  const progress = firstJourneyProgress(mastery);
  const href = ready && progress.total > 0 && progress.reached >= progress.total ? "/mastery/session" : "/mastery/journey";

  return <Link className={className} style={style} href={href} aria-current={ariaCurrent}>{children ?? (locale === "ru" ? labelRu : labelEn)}</Link>;
}
