"use client";

import { useEffect, useMemo, useState } from "react";
import { practicalSkillById } from "../content/practical-mastery";
import {
  beginPostQuickStartApplication,
  resolvePostQuickStartLearningTarget,
} from "../lib/practical-post-quick-start-learning";
import { usePracticalLocale } from "../lib/use-practical-locale";
import type { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDocumentLink from "./PracticalDocumentLink";

type PracticalPostQuickStartProfileController = ReturnType<typeof usePracticalProfileState>;

export default function PracticalPostQuickStartTeaching({
  profile,
  requestedSkillId,
}: {
  profile: PracticalPostQuickStartProfileController;
  requestedSkillId: string | null;
}) {
  const [locale, setLocale] = usePracticalLocale();
  const { mastery: state, setMastery, ready, recoveryBlocked } = profile;
  const [pendingPracticeSkillId, setPendingPracticeSkillId] = useState<string | null>(null);
  const [transitionFailed, setTransitionFailed] = useState(false);
  const target = useMemo(
    () => resolvePostQuickStartLearningTarget(state, requestedSkillId),
    [requestedSkillId, state],
  );
  const skill = target.skillId ? practicalSkillById.get(target.skillId) ?? null : null;

  useEffect(() => {
    if (!ready || recoveryBlocked || target.kind !== "PRACTICE") return;
    window.location.replace(target.href);
  }, [ready, recoveryBlocked, target]);

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
      <p>{locale === "ru"
        ? "Быстрый старт 8/8 завершён. Сначала разберись в следующем механизме; практика откроется только после явного перехода к примеру."
        : "Quick Start 8/8 is complete. First review the next mechanism; practice opens only after you explicitly move to an example."}</p>
      <div className="mode-switch">
        <button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button>
        <button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button>
      </div>
    </section>

    <section className="surface" style={{ marginTop: 20 }}>
      <p className="eyebrow">{locale === "ru" ? "МЕХАНИЗМ" : "MECHANISM"}</p>
      {asset.kind === "RULE" ? <>
        <h2>{locale === "ru" ? asset.rule.defaultRu : asset.rule.defaultEn}</h2>
        <p><b>{locale === "ru" ? "Почему:" : "Why:"}</b> {locale === "ru" ? asset.rule.whyRu : asset.rule.whyEn}</p>
        <p><b>{locale === "ru" ? "Когда правило меняется:" : "When it changes:"}</b> {(locale === "ru" ? asset.rule.reversalsRu : asset.rule.reversalsEn).join(" · ")}</p>
        <p className="support">{locale === "ru" ? asset.rule.transferCueRu : asset.rule.transferCueEn}</p>
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
