"use client";

import { useState } from "react";
import { practicalReferenceBaselines, referenceBaselineCounts } from "../content/practical-mastery";

type Locale = "ru" | "en";

export default function PracticalReferenceExperience() {
  const [locale, setLocale] = useState<Locale>("ru");
  return <main style={{ maxWidth: 980, margin: "0 auto", padding: "28px 20px 60px" }}>
    <section className="hero compact-hero">
      <p className="eyebrow">REFERENCE BASELINES · C2</p>
      <h1>{locale === "ru" ? "Не запоминать 980 картинок. Видеть форму и дельту." : "Do not memorize 980 images. See the shape and the delta."}</h1>
      <p className="lede">{locale === "ru" ? "Reference layer сохраняет source-backed preflop structure, но не превращает непросмотренные chart pixels в точные hand/frequency claims." : "The reference layer preserves source-backed preflop structure without turning unreviewed chart pixels into exact hand/frequency claims."}</p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <div className="mode-switch"><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
        <a className="secondary" href="/mastery">← {locale === "ru" ? "Карта навыков" : "Skill map"}</a>
        <a className="secondary" href="/mastery/study">{locale === "ru" ? "Study loop" : "Study loop"} →</a>
      </div>
    </section>

    <section className="metrics">
      <div><b>{referenceBaselineCounts.total}</b><span>{locale === "ru" ? "reference anchors" : "reference anchors"}</span></div>
      <div><b>{referenceBaselineCounts.sourceSupportedShape}</b><span>{locale === "ru" ? "shape-safe" : "shape-safe"}</span></div>
      <div><b>{referenceBaselineCounts.exactVisualPending}</b><span>{locale === "ru" ? "exact visual pending" : "exact visual pending"}</span></div>
    </section>

    <section className="today-card" style={{ marginTop: 22 }}>
      <p className="eyebrow">AUTHORITY BOUNDARY</p>
      <p>{locale === "ru" ? "Smash M01 допускает equilibrium charts как baseline shape и требует deliberate deviation по rake/depth/ante/straddle/players behind. Indexed squeeze pack содержит 980 routed scenarios, но сам registry помечает strategy extraction как незавершённую. Поэтому здесь нет выдуманных A5s=37% или exact colour weights." : "Smash M01 supports equilibrium charts as baseline shapes and deliberate deviation for rake/depth/ante/straddle/players behind. The indexed squeeze pack contains 980 routed scenarios, but its registry still marks strategy extraction incomplete. Therefore this layer contains no invented A5s=37% claims or exact color weights."}</p>
    </section>

    <section className="surface" style={{ marginTop: 22 }}>
      <div className="section-head"><p className="eyebrow">TRIGGER → BASELINE → DELTA → BOUNDARY</p><h2>{locale === "ru" ? "Практические reference anchors" : "Practical reference anchors"}</h2></div>
      {practicalReferenceBaselines.map((item) => <article key={item.id} className="today-card" style={{ marginTop: 12 }}>
        <p className="eyebrow">{item.id} · {item.status}</p>
        <h3>{locale === "ru" ? item.titleRu : item.titleEn}</h3>
        <p><b>{locale === "ru" ? "Trigger" : "Trigger"}:</b> {locale === "ru" ? item.triggerRu : item.triggerEn}</p>
        <p><b>{locale === "ru" ? "Baseline" : "Baseline"}:</b> {locale === "ru" ? item.baselineRu : item.baselineEn}</p>
        <p><b>{locale === "ru" ? "Delta" : "Delta"}:</b> {locale === "ru" ? item.deltaRu : item.deltaEn}</p>
        <p><b>{locale === "ru" ? "Boundary" : "Boundary"}:</b> {locale === "ru" ? item.boundaryRu : item.boundaryEn}</p>
        <p className="support">Sources: {item.sourceRefs.join(", ")}</p>
      </article>)}
    </section>
  </main>;
}
