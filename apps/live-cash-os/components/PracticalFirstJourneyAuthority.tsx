"use client";

import Link from "next/link";
import { firstJourneyStepForSkill } from "../content/practical-mastery/first-journey";
import { practicalSkillById } from "../content/practical-mastery";
import { restoreQuickStartPostAnswer } from "../lib/practical-continuity-workspace";
import { firstJourneyPresentationState } from "../lib/practical-first-journey-authority";
import { firstJourneyProgress, recommendFirstJourneyStep } from "../lib/practical-first-journey";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalFirstJourneyExperience from "./PracticalFirstJourneyExperience";

export default function PracticalFirstJourneyAuthority() {
  const [locale] = usePracticalLocale();
  const { mastery: state, studyWorkspace, ready, recoveryBlocked } = usePracticalProfileState();
  if (!ready || recoveryBlocked) return <PracticalFirstJourneyExperience />;

  const continuity = restoreQuickStartPostAnswer(studyWorkspace, state);
  if (continuity.status === "VALID") return <PracticalFirstJourneyExperience />;

  const progress = firstJourneyProgress(state);
  const recommendation = recommendFirstJourneyStep(state);
  const skill = recommendation ? practicalSkillById.get(recommendation.skillId) ?? null : null;
  const journeyStep = recommendation ? firstJourneyStepForSkill(recommendation.skillId) : null;
  const presentation = firstJourneyPresentationState(progress, Boolean(recommendation && skill && journeyStep));

  if (presentation === "ACTIVE") return <PracticalFirstJourneyExperience />;

  if (presentation === "COMPLETE") {
    return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
      <p className="eyebrow">{locale === "ru" ? "БЫСТРЫЙ СТАРТ" : "QUICK START"}</p>
      <h1>{locale === "ru" ? "Быстрый старт завершён" : "Quick start complete"}</h1>
      <p>{locale === "ru" ? `Пройдено ${progress.reached} из ${progress.total} ключевых моделей. Это не означает полное освоение: дальше система будет смешивать задачи, возвращать ошибки, менять условия и позже проверять сохранение навыка после паузы.` : `You have completed ${progress.reached} of ${progress.total} core models. This is not full mastery: the system will now mix decisions, revisit mistakes, change conditions, and later test retention after a delay.`}</p>
      <p><b>{progress.reached}/{progress.total}</b></p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 16 }}><Link className="primary" href="/mastery/session">{locale === "ru" ? "Продолжить обучение →" : "Continue learning →"}</Link><Link className="secondary" href="/mastery">{locale === "ru" ? "Посмотреть карту" : "View map"}</Link></div>
    </main>;
  }

  return <main style={{ maxWidth: 820, margin: "0 auto", padding: "32px 20px 64px" }}>
    <p className="eyebrow">{locale === "ru" ? "БЫСТРЫЙ СТАРТ" : "QUICK START"}</p>
    <h1>{locale === "ru" ? "Быстрый старт ещё не завершён" : "Quick Start is not complete yet"}</h1>
    <p>{locale === "ru" ? `Пройдено ${progress.reached} из ${progress.total}. Сейчас нет следующего допустимого шага для Quick Start. Система не будет выдавать незавершённый маршрут за завершённый и не станет придумывать прогресс.` : `${progress.reached} of ${progress.total} are complete. There is no currently admissible next Quick Start step. The system will not present an incomplete route as complete or fabricate progress.`}</p>
    <p className="support">{locale === "ru" ? "Вернись к карте обучения: следующий шаг появится, когда его предпосылки и доступная практика будут действительно готовы." : "Return to the learning map. The next step will appear when its prerequisites and supported practice are actually available."}</p>
    <Link className="primary" href="/mastery">{locale === "ru" ? "Вернуться к карте →" : "Back to map →"}</Link>
  </main>;
}
