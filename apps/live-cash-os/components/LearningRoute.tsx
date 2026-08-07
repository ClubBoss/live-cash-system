import { getLearningRoute } from "../content/i18n/learning-route";
import type { LocaleCode } from "../lib/model";

export default function LearningRoute({ locale }: { locale: LocaleCode }) {
  const route = getLearningRoute(locale);
  const title = locale === "ru" ? "Что означает путь 0→100%" : "What the 0→100% route means";
  const boundary = locale === "ru"
    ? "Это не общий процент мастерства. Каждый этап подтверждается отдельной практикой."
    : "This is not one overall mastery score. Each step is confirmed by a different kind of practice.";

  return <section className="surface learning-route" aria-labelledby="learning-route-title">
    <div className="section-head">
      <p className="eyebrow">{locale === "ru" ? "МАРШРУТ НАВЫКА" : "SKILL ROUTE"}</p>
      <h2 id="learning-route-title">{title}</h2>
      <p>{boundary}</p>
    </div>
    <div className="route-grid">
      {route.map((stage) => <article key={stage.percent}>
        <span>{stage.percent}%</span>
        <h3>{stage.title}</h3>
        <p>{stage.description}</p>
        <small>{stage.evidenceGate}</small>
      </article>)}
    </div>
  </section>;
}
