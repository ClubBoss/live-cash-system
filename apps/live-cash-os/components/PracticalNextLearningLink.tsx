"use client";

import { type CSSProperties, type ReactNode } from "react";
import { isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDocumentLink from "./PracticalDocumentLink";

type Props = {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  ariaCurrent?: "page";
  labelRu?: string;
  labelEn?: string;
  focusSkillId?: string;
};

function FocusedLearningLink({ className, style, content, ariaCurrent, focusSkillId }: { className?: string; style?: CSSProperties; content: ReactNode; ariaCurrent?: "page"; focusSkillId: string }) {
  const { mastery, ready } = usePracticalProfileState();
  if (!ready || !isIntegratedFocusAdmissible(mastery, focusSkillId)) {
    return <span className={className} style={style} aria-disabled="true" data-focus-unavailable={focusSkillId}>{content}</span>;
  }
  return <PracticalDocumentLink className={className} style={style} href={`/mastery/session?focus=${encodeURIComponent(focusSkillId)}`} aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
}

export default function PracticalNextLearningLink({
  className,
  style,
  children,
  ariaCurrent,
  labelRu = "Продолжить обучение",
  labelEn = "Continue learning",
  focusSkillId,
}: Props) {
  const [locale] = usePracticalLocale();
  const content = children ?? (locale === "ru" ? labelRu : labelEn);

  if (focusSkillId) {
    return <FocusedLearningLink className={className} style={style} content={content} ariaCurrent={ariaCurrent} focusSkillId={focusSkillId} />;
  }

  return <PracticalDocumentLink className={className} style={style} href="/mastery/journey" aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
}
