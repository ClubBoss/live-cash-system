"use client";

import Link from "next/link";
import { practicalReferenceBaselines, referenceBaselineCounts } from "../content/practical-mastery";
import { usePracticalLocale } from "../lib/use-practical-locale";

export default function PracticalReferenceExperience() {
  const [locale, setLocale] = usePracticalLocale();
  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">{locale === "ru" ? "ОРИЕНТИРЫ ДИАПАЗОНОВ" : "REFERENCE BASELINES · C2"}</p>
      <h1>{locale === "ru" ? "Не запоминать 980 картинок. Видеть форму диапазона и то, что её меняет." : "Do not memorize 980 images. See the shape and the delta."}</h1>
      <p className="lede">{locale === "ru" ? "Здесь собраны подтверждённые ориентиры для префлопа. Они помогают видеть форму диапазона и направление поправки, но не выдают непросмотренные чарты за точные частоты и границы рук." : "The reference layer preserves source-backed preflop structure without turning unreviewed chart pixels into exact hand/frequency claims."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <Link className="secondary" href="/mastery">← {locale === "ru" ? "Карта навыков" : "Skill map"}</Link>
        <Link className="secondary" href="/mastery/study">{locale === "ru" ? "Разбор и работа над игрой" : "Study loop"} →</Link>
      </div>
    </section>

    <section className="metrics">
      <div><b>{referenceBaselineCounts.total}</b><span>{locale === "ru" ? "ориентиров" : "reference anchors"}</span></div>
      <div><b>{referenceBaselineCounts.sourceSupportedShape}</b><span>{locale === "ru" ? "подтверждённых по форме" : "shape-safe"}</span></div>
      <div><b>{referenceBaselineCounts.exactVisualPending}</b><span>{locale === "ru" ? "ждут проверки чарта" : "exact visual pending"}</span></div>
    </section>

    <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">{locale === "ru" ? "ГРАНИЦА ТОЧНОСТИ" : "AUTHORITY BOUNDARY"}</p>
      <p>{locale === "ru" ? "Smash M01 использует равновесные чарты как исходный ориентир и отдельно учитывает рейк, глубину, анте, страддл и игроков позади. В репозитории проиндексировано 980 сценариев squeeze, но точная стратегия из самих изображений ещё не извлечена и не проверена. Поэтому здесь нет выдуманных процентов или точных весов отдельных рук." : "Smash M01 supports equilibrium charts as baseline shapes and deliberate deviation for rake/depth/ante/straddle/players behind. The indexed squeeze pack contains 980 routed scenarios, but its registry still marks strategy extraction incomplete. Therefore this layer contains no invented A5s=37% claims or exact color weights."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">{locale === "ru" ? "СИТУАЦИЯ → ОРИЕНТИР → ПОПРАВКА → ГРАНИЦА" : "TRIGGER → BASELINE → DELTA → BOUNDARY"}</p><h2>{locale === "ru" ? "Практические ориентиры" : "Practical reference anchors"}</h2></div>
      {practicalReferenceBaselines.map((item) => <article key={item.id} className="today-card" style={{ marginTop: 12 }}>
        <p className="eyebrow">{item.id} · {item.status}</p>
        <h3>{locale === "ru" ? item.titleRu : item.titleEn}</h3>
        <p><b>{locale === "ru" ? "Ситуация:" : "Trigger:"}</b> {locale === "ru" ? item.triggerRu : item.triggerEn}</p>
        <p><b>{locale === "ru" ? "Ориентир:" : "Baseline:"}</b> {locale === "ru" ? item.baselineRu : item.baselineEn}</p>
        <p><b>{locale === "ru" ? "Что меняется:" : "Delta:"}</b> {locale === "ru" ? item.deltaRu : item.deltaEn}</p>
        <p><b>{locale === "ru" ? "Граница:" : "Boundary:"}</b> {locale === "ru" ? item.boundaryRu : item.boundaryEn}</p>
        <p className="support">{locale === "ru" ? "Источники" : "Sources"}: {item.sourceRefs.join(", ")}</p>
      </article>)}
    </section>
  </main>;
}
