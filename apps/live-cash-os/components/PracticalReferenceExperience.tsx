"use client";

import Link from "next/link";
import { practicalReferenceBaselines, referenceBaselineCounts, type ReferenceBaselineStatus } from "../content/practical-mastery";
import { usePracticalLocale } from "../lib/use-practical-locale";

type Locale = "ru" | "en";

function statusLabel(status: ReferenceBaselineStatus, locale: Locale): string {
  if (status === "SOURCE_SUPPORTED_SHAPE") return locale === "ru" ? "Форма диапазона подтверждена" : "Range shape reviewed";
  return locale === "ru" ? "Точные частоты ещё не проверены" : "Exact frequencies not yet verified";
}

export default function PracticalReferenceExperience() {
  const [locale, setLocale] = usePracticalLocale();
  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? "ОРИЕНТИРЫ ДИАПАЗОНОВ" : "RANGE REFERENCES"}</p>
      <h1>{locale === "ru" ? "Не запоминать сотни картинок. Видеть форму диапазона и то, что её меняет." : "Do not memorize hundreds of charts. See the range shape and what changes it."}</h1>
      <p className="lede">{locale === "ru" ? "Здесь собраны проверенные префлоп-ориентиры. Они помогают видеть форму диапазона и направление поправки, но не выдают ещё не проверенные чарты за точные частоты и границы рук." : "These are reviewed preflop reference shapes. They show the direction of a range and how key conditions change it without pretending unverified charts provide exact hand frequencies."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <Link className="secondary" href="/mastery">← {locale === "ru" ? "Карта навыков" : "Skill map"}</Link>
        <Link className="secondary" href="/mastery/study">{locale === "ru" ? "Разбор и работа над игрой" : "Study loop"} →</Link>
      </div>
    </section>

    <section className="metrics">
      <div><b>{referenceBaselineCounts.total}</b><span>{locale === "ru" ? "ориентиров" : "reference spots"}</span></div>
      <div><b>{referenceBaselineCounts.sourceSupportedShape}</b><span>{locale === "ru" ? "с проверенной формой" : "reviewed range shapes"}</span></div>
      <div><b>{referenceBaselineCounts.exactVisualPending}</b><span>{locale === "ru" ? "без проверенных точных частот" : "without verified exact frequencies"}</span></div>
    </section>

    <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "НАСКОЛЬКО ЭТО ТОЧНО" : "HOW PRECISE IS THIS?"}</p>
      <p>{locale === "ru" ? "Исходный материал использует равновесные чарты как ориентир и отдельно учитывает рейк, глубину, анте, страддл и игроков позади. Для части ситуаций точные частоты и границы отдельных рук ещё не проверены по исходным чартам. Поэтому здесь показано только то, что можно использовать без ложной точности." : "The underlying material uses equilibrium charts as starting points and adjusts for rake, depth, ante, straddle, and players behind. For some spots, exact frequencies and hand-by-hand boundaries have not yet been verified against the original charts. This page therefore shows only what can be used without false precision."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">{locale === "ru" ? "СИТУАЦИЯ → ОРИЕНТИР → ПОПРАВКА → ГРАНИЦА" : "SPOT → BASELINE → ADJUSTMENT → LIMIT"}</p><h2>{locale === "ru" ? "Практические ориентиры" : "Practical range references"}</h2></div>
      {practicalReferenceBaselines.map((item) => <article key={item.id} className="today-card" style={{ marginTop: 12 }}>
        <p className="eyebrow">{statusLabel(item.status, locale)}</p>
        <h3>{locale === "ru" ? item.titleRu : item.titleEn}</h3>
        <p><b>{locale === "ru" ? "Ситуация:" : "Spot:"}</b> {locale === "ru" ? item.triggerRu : item.triggerEn}</p>
        <p><b>{locale === "ru" ? "Ориентир:" : "Baseline:"}</b> {locale === "ru" ? item.baselineRu : item.baselineEn}</p>
        <p><b>{locale === "ru" ? "Что меняется:" : "Adjustment:"}</b> {locale === "ru" ? item.deltaRu : item.deltaEn}</p>
        <p><b>{locale === "ru" ? "Граница:" : "Limit:"}</b> {locale === "ru" ? item.boundaryRu : item.boundaryEn}</p>
      </article>)}
    </section>
  </main>;
}
