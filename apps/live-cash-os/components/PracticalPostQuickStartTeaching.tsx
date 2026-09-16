"use client";

import { useEffect, useMemo, useState } from "react";
import { practicalSkillById } from "../content/practical-mastery";
import { activeIntegratedRoundResume } from "../lib/practical-continuity-workspace";
import {
  beginPostQuickStartApplication,
  resolvePostQuickStartLearningTarget,
} from "../lib/practical-post-quick-start-learning";
import { usePracticalLocale } from "../lib/use-practical-locale";
import type { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalConceptPrimer from "./PracticalConceptPrimer";
import PracticalDocumentLink from "./PracticalDocumentLink";

type PracticalPostQuickStartProfileController = ReturnType<typeof usePracticalProfileState>;

export default function PracticalPostQuickStartTeaching({
  profile,
  requestedSkillId,
}: {
  profile: PracticalPostQuickStartProfileController;
  requestedSkillId: string | null;
}) {
  const [locale] = usePracticalLocale();
  const { mastery: state, studyWorkspace, setMastery, ready, recoveryBlocked } = profile;
  const [pendingPracticeSkillId, setPendingPracticeSkillId] = useState<string | null>(null);
  const [transitionFailed, setTransitionFailed] = useState(false);
  // An active, valid, incomplete round resumes before any new post-Quick-Start step.
  const activeResume = useMemo(
    () => (ready && !recoveryBlocked ? activeIntegratedRoundResume(studyWorkspace, state) : null),
    [ready, recoveryBlocked, studyWorkspace, state],
  );
  const target = useMemo(
    () => resolvePostQuickStartLearningTarget(state, requestedSkillId),
    [requestedSkillId, state],
  );
  const skill = target.skillId ? practicalSkillById.get(target.skillId) ?? null : null;
  const ruleAlreadyLearned = Boolean(target.kind === "TEACH" && target.asset.kind === "RULE" && target.asset.rule.skillIds.some((ruleSkillId) => ruleSkillId !== target.skillId && state.skills[ruleSkillId]?.conceptTaught));

  const primerTeachingTexts = target.kind === "TEACH"
    ? target.asset.kind === "RULE"
      ? [
          locale === "ru" ? target.asset.rule.triggerRu : target.asset.rule.triggerEn,
          locale === "ru" ? target.asset.rule.defaultRu : target.asset.rule.defaultEn,
          locale === "ru" ? target.asset.rule.whyRu : target.asset.rule.whyEn,
          ...(locale === "ru" ? target.asset.rule.reversalsRu : target.asset.rule.reversalsEn),
          locale === "ru" ? target.asset.rule.transferCueRu : target.asset.rule.transferCueEn,
        ]
      : target.asset.kind === "SOURCE_BOUND"
        ? [
            locale === "ru" ? target.asset.teaching.situationRu : target.asset.teaching.situationEn,
            locale === "ru" ? target.asset.teaching.mechanismRu : target.asset.teaching.mechanismEn,
            locale === "ru" ? target.asset.teaching.exampleRu : target.asset.teaching.exampleEn,
            locale === "ru" ? target.asset.teaching.boundaryRu : target.asset.teaching.boundaryEn,
          ]
        : [
            locale === "ru" ? target.asset.anchor.promptRu : target.asset.anchor.promptEn,
            locale === "ru" ? target.asset.anchor.answerRu : target.asset.anchor.answerEn,
            locale === "ru" ? target.asset.anchor.rationaleRu : target.asset.anchor.rationaleEn,
          ]
    : [];

  useEffect(() => {
    if (!activeResume || pendingPracticeSkillId || !ready || recoveryBlocked) return;
    window.location.replace(activeResume.href);
  }, [activeResume, pendingPracticeSkillId, ready, recoveryBlocked]);

  useEffect(() => {
    if (activeResume || pendingPracticeSkillId || !ready || recoveryBlocked || target.kind !== "PRACTICE") return;
    window.location.replace(target.href);
  }, [activeResume, pendingPracticeSkillId, ready, recoveryBlocked, target]);

  useEffect(() => {
    if (!pendingPracticeSkillId || !state.skills[pendingPracticeSkillId]?.conceptTaught) return;
    const href = `/mastery/session?focus=${encodeURIComponent(pendingPracticeSkillId)}`;
    const timer = window.setTimeout(() => window.location.assign(href), 0);
    return () => window.clearTimeout(timer);
  }, [pendingPracticeSkillId, state]);

  const startApplication = () => {
    if (target.kind !== "TEACH") return;
    setTransitionFailed(false);
    const nextState = beginPostQuickStartApplication(state, target.skillId);
    if (!setMastery(nextState)) {
      setTransitionFailed(true);
      return;
    }
    setPendingPracticeSkillId(target.skillId);
  };

  if (!ready) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <p>{locale === "ru" ? "Загружаем прогресс…" : "Loading progress…"}</p>
    </main>;
  }

  if (recoveryBlocked) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <h1>{locale === "ru" ? "Прогресс требует восстановления" : "Progress needs recovery"}</h1>
      <p>{locale === "ru"
        ? "Ничего не будет перезаписано. Открой «Данные и восстановление» в инструментах Live Cash OS."
        : "Nothing will be overwritten. Open Data & Recovery in Live Cash OS tools."}</p>
      <PracticalDocumentLink href="/tools">
        {locale === "ru" ? "Открыть данные и восстановление" : "Open Data & Recovery"} →
      </PracticalDocumentLink>
    </main>;
  }

  if (activeResume) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <p>{locale === "ru" ? "Возвращаем тебя в незавершённый раунд…" : "Returning you to your round in progress…"}</p>
      <PracticalDocumentLink className="primary" href={activeResume.href}>
        {locale === "ru" ? "Продолжить раунд" : "Resume the round"} →
      </PracticalDocumentLink>
    </main>;
  }

  if (target.kind === "PRACTICE") {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
      <p>{locale === "ru" ? "Открываем следующую практику…" : "Opening the next practice…"}</p>
    </main>;
  }

  if (target.kind === "BLOCKED" || !skill) {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <p className="eyebrow">{locale === "ru" ? "СЛЕДУЮЩИЙ ШАГ" : "NEXT STEP"}</p>
      <h1>{locale === "ru" ? "Сейчас новый шаг недоступен" : "No new step is available yet"}</h1>
      <p>{locale === "ru"
        ? "Маршрут не откроет новый навык без нужных предпосылок, источников и поддержанной практики."
        : "The route will not open a new skill without its prerequisites, source support, and supported practice."}</p>
      <PracticalDocumentLink className="primary" href="/mastery">
        {locale === "ru" ? "Вернуться к карте" : "Back to map"} →
      </PracticalDocumentLink>
    </main>;
  }

  const asset = target.asset;
  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "24px 20px 64px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? "ПОСЛЕ БЫСТРОГО СТАРТА" : "AFTER QUICK START"}</p>
      <h1>{locale === "ru" ? skill.titleRu : skill.titleEn}</h1>
      <p>{ruleAlreadyLearned
        ? (locale === "ru" ? "Этот причинный механизм уже знаком. Здесь не повторяем теорию с нуля — переносим её в новый skill и сразу проверяем применение." : "You already know this causal mechanism. Do not reteach it from scratch here — transfer it to the new skill and test the application.")
        : (locale === "ru" ? "Быстрый старт 8/8 завершён. Сначала разберись в терминах и механизме; практика откроется только после явного перехода к примеру." : "Quick Start 8/8 is complete. First review the terms and mechanism; practice opens only after you explicitly move to an example.")}</p>
    </section>

    <PracticalConceptPrimer skillId={skill.id} locale={locale} teachingTexts={primerTeachingTexts} />

    <section className="surface" style={{ marginTop: 20 }}>
      <p className="eyebrow">{ruleAlreadyLearned
        ? (locale === "ru" ? "ЗНАКОМЫЙ МЕХАНИЗМ · НОВОЕ ПРИМЕНЕНИЕ" : "KNOWN MECHANISM · NEW APPLICATION")
        : (locale === "ru" ? "МЕХАНИЗМ" : "MECHANISM")}</p>
      {asset.kind === "RULE" && ruleAlreadyLearned ? <>
        <h2>{locale === "ru" ? "Не переучиваем правило — переносим его" : "Do not relearn the rule — transfer it"}</h2>
        <p>{locale === "ru" ? asset.rule.transferCueRu : asset.rule.transferCueEn}</p>
        <p className="support">{locale === "ru" ? "Новая ценность — распознать тот же механизм в другом узле и принять новое решение, а не перечитать прежний разбор." : "The new value is recognizing the same mechanism in a different node and making a new decision, not rereading the old explanation."}</p>
      </> : asset.kind === "RULE" ? <>
        <h2>{locale === "ru" ? asset.rule.defaultRu : asset.rule.defaultEn}</h2>
        <p><b>{locale === "ru" ? "Почему:" : "Why:"}</b> {locale === "ru" ? asset.rule.whyRu : asset.rule.whyEn}</p>
        <p><b>{locale === "ru" ? "Когда правило меняется:" : "When it changes:"}</b> {(locale === "ru" ? asset.rule.reversalsRu : asset.rule.reversalsEn).join(" · ")}</p>
        <p className="support">{locale === "ru" ? asset.rule.transferCueRu : asset.rule.transferCueEn}</p>
      </> : asset.kind === "SOURCE_BOUND" ? <>
        <p><b>{locale === "ru" ? "Ситуация:" : "Situation:"}</b> {locale === "ru" ? asset.teaching.situationRu : asset.teaching.situationEn}</p>
        <h2>{locale === "ru" ? asset.teaching.mechanismRu : asset.teaching.mechanismEn}</h2>
        <p><b>{locale === "ru" ? "Пример:" : "Example:"}</b> {locale === "ru" ? asset.teaching.exampleRu : asset.teaching.exampleEn}</p>
        <p className="support"><b>{locale === "ru" ? "Граница:" : "Boundary:"}</b> {locale === "ru" ? asset.teaching.boundaryRu : asset.teaching.boundaryEn}</p>
      </> : <>
        <h2>{locale === "ru" ? asset.anchor.promptRu : asset.anchor.promptEn}</h2>
        <p><b>{locale === "ru" ? "Разбор:" : "Answer:"}</b> {locale === "ru" ? asset.anchor.answerRu : asset.anchor.answerEn}</p>
        <p>{locale === "ru" ? asset.anchor.rationaleRu : asset.anchor.rationaleEn}</p>
      </>}

      <button className="primary" onClick={startApplication} disabled={pendingPracticeSkillId !== null} style={{ marginTop: 16 }}>
        {pendingPracticeSkillId
          ? (locale === "ru" ? "Открываем пример…" : "Opening example…")
          : (locale === "ru" ? "Проверить на примере" : "Try an example")} <span>→</span>
      </button>
      {transitionFailed ? <p role="alert" className="support">
        {locale === "ru" ? "Не удалось сохранить переход. Прогресс не изменён." : "The transition could not be saved. Progress was not changed."}
      </p> : null}
    </section>
  </main>;
}
