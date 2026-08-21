"use client";

import { useEffect, useState } from "react";

const LOCALE_KEY = "live-cash-os:locale";
type Locale = "ru" | "en";

export default function PracticalMasteryGateway() {
  const [locale, setLocale] = useState<Locale>("ru");

  useEffect(() => {
    try {
      setLocale(window.localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ru");
    } catch {
      setLocale("ru");
    }
  }, []);

  return <section
    aria-label={locale === "ru" ? "Основной маршрут Practical Mastery" : "Primary Practical Mastery route"}
    className="surface"
    style={{ maxWidth: 1180, margin: "18px auto 0", padding: "18px 20px" }}
  >
    <p className="eyebrow">PRACTICAL MASTERY</p>
    <h2>{locale === "ru" ? "Основной маршрут: тренируй решения, а не прохождение модулей" : "Primary route: train decisions, not module completion"}</h2>
    <p>{locale === "ru"
      ? "Skill graph ведёт от распознавания спота к решению, переносу, retention и реальным рукам. Старые разделы ниже остаются полезными для диагностики, карточек, разбора рук и данных."
      : "The skill graph moves from spot recognition to decisions, transfer, retention, and real hands. The legacy tools below remain useful for diagnostics, cards, hand review, and data."}</p>
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
      <a className="primary" href="/mastery/journey">{locale === "ru" ? "Продолжить Practical Mastery" : "Continue Practical Mastery"} <span>→</span></a>
      <a className="secondary" href="/mastery">{locale === "ru" ? "Карта навыков" : "Skill map"}</a>
    </div>
  </section>;
}
