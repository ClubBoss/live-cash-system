"use client";

import { type CSSProperties, type ReactNode } from "react";
import { isIntegratedFocusAdmissible } from "../lib/practical-adaptive-session";
import { activeIntegratedRoundResume } from "../lib/practical-continuity-workspace";
import { recommendFirstJourneyStep } from "../lib/practical-first-journey";
import { resolvePostQuickStartLearningTarget } from "../lib/practical-post-quick-start-learning";
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

function PrimaryLearningLink({ className, style, content, ariaCurrent }: { className?: string; style?: CSSProperties; content: ReactNode; ariaCurrent?: "page" }) {
  const { mastery, studyWorkspace, ready, recoveryBlocked } = usePracticalProfileState();
  // An active, valid, incomplete round resumes before a new lesson is started.
  const resume = ready && !recoveryBlocked ? activeIntegratedRoundResume(studyWorkspace, mastery) : null;
  if (resume) {
    return <PracticalDocumentLink className={className} style={style} href={resume.href} aria-current={ariaCurrent} data-active-round-resume="1">{content}</PracticalDocumentLink>;
  }
  return <PracticalDocumentLink className={className} style={style} href="/mastery/journey" aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
}

function FocusedLearningLink({ className, style, content, ariaCurrent, focusSkillId }: { className?: string; style?: CSSProperties; content: ReactNode; ariaCurrent?: "page"; focusSkillId: string }) {
  const { mastery, studyWorkspace, ready, recoveryBlocked } = usePracticalProfileState();
  if (!ready || recoveryBlocked) {
    return <span className={className} style={style} aria-disabled="true" data-focus-unavailable={focusSkillId}>{content}</span>;
  }

  // A different in-progress round outranks starting this recommended skill fresh;
  // a round already on this focus is resumed by the normal focused href below.
  const resume = activeIntegratedRoundResume(studyWorkspace, mastery);
  if (resume && resume.focusSkillId !== focusSkillId) {
    return <PracticalDocumentLink className={className} style={style} href={resume.href} aria-current={ariaCurrent} data-active-round-resume="1">{content}</PracticalDocumentLink>;
  }

  if (isIntegratedFocusAdmissible(mastery, focusSkillId)) {
    return <PracticalDocumentLink className={className} style={style} href={`/mastery/session?focus=${encodeURIComponent(focusSkillId)}`} aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
  }

  const target = resolvePostQuickStartLearningTarget(mastery, focusSkillId);
  if (target.kind !== "BLOCKED") {
    return <PracticalDocumentLink className={className} style={style} href={target.href} aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
  }

  if (target.reason === "QUICK_START_INCOMPLETE" && recommendFirstJourneyStep(mastery)?.skillId === focusSkillId) {
    return <PracticalDocumentLink className={className} style={style} href={`/mastery/journey?focus=${encodeURIComponent(focusSkillId)}`} aria-current={ariaCurrent}>{content}</PracticalDocumentLink>;
  }

  return <span className={className} style={style} aria-disabled="true" data-focus-unavailable={focusSkillId}>{content}</span>;
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

  return <PrimaryLearningLink className={className} style={style} content={content} ariaCurrent={ariaCurrent} />;
}
