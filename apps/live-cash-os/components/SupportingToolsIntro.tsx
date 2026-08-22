"use client";

import { usePracticalLocale } from "../lib/use-practical-locale";

export default function SupportingToolsIntro() {
  const [locale] = usePracticalLocale();
  return <section
    aria-label={locale === "ru" ? "Дополнительные инструменты Live Cash OS" : "Supporting Live Cash OS tools"}
    className="surface"
    style={{ maxWidth: 1180, margin: "28px auto 8px", padding: "14px 20px" }}
  >
    <p className="eyebrow" style={{ marginBottom: 6 }}>{locale === "ru" ? "ДОПОЛНИТЕЛЬНЫЕ ИНСТРУМЕНТЫ" : "SUPPORTING TOOLS"}</p>
    <p style={{ margin: 0, color: "var(--muted)" }}>{locale === "ru"
      ? "Ниже — дополнительные инструменты: план на сегодня, старые уроки, повторение, карточки, реальные руки и диагностика. Для основного обучения используй «Учиться» выше."
      : "Below are supporting tools: Today, legacy lessons, review, cards, real hands, and diagnostics. Use “Learn” above for the primary learning route."}</p>
  </section>;
}
