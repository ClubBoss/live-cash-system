"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePracticalLocale } from "../lib/use-practical-locale";
import PracticalNextLearningLink from "./PracticalNextLearningLink";

const tools = [
  { href: "/mastery", ru: "Карта", en: "Map" },
  { href: "/mastery/perception", ru: "Чтение стола", en: "Table reading" },
  { href: "/mastery/study", ru: "После игры", en: "After play" },
  { href: "/mastery/reference", ru: "Справочник", en: "Reference" },
] as const;

export default function PracticalMasteryNav() {
  const [locale] = usePracticalLocale();
  const pathname = usePathname();
  const learningActive = pathname === "/mastery/journey" || pathname === "/mastery/session";

  return <nav
    aria-label="Practical Mastery navigation"
    style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 20px", display: "grid", gap: 10 }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <Link href="/" style={{ color: "var(--muted)", fontSize: 13, fontWeight: 800, textDecoration: "none", minHeight: 40, display: "inline-flex", alignItems: "center" }}>
        {locale === "ru" ? "← Главная Live Cash OS" : "← Live Cash OS home"}
      </Link>
      <span style={{ color: "var(--muted)", fontSize: 11, fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase" }}>
        {locale === "ru" ? "Обучение" : "Learning"}
      </span>
      <Link href="/?tab=field" style={{ color: "var(--ink)", fontSize: 13, fontWeight: 800, textDecoration: "none", minHeight: 40, display: "inline-flex", alignItems: "center" }}>
        {locale === "ru" ? "Реальные руки →" : "Real hands →"}
      </Link>
    </div>

    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
      <PracticalNextLearningLink
        labelRu="Учиться"
        labelEn="Learn"
        ariaCurrent={learningActive ? "page" : undefined}
        style={{
          flex: "none",
          minHeight: 44,
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "10px 16px",
          border: `1px solid ${learningActive ? "var(--ink)" : "var(--line)"}`,
          borderRadius: 999,
          background: learningActive ? "var(--ink)" : "transparent",
          color: learningActive ? "white" : "var(--ink)",
          fontSize: 13,
          fontWeight: 800,
          textDecoration: "none",
          whiteSpace: "nowrap",
        }}
      />
      {tools.map((item) => {
        const active = pathname === item.href;
        return <Link
          key={item.href}
          href={item.href}
          aria-current={active ? "page" : undefined}
          style={{
            flex: "none",
            minHeight: 44,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px 14px",
            border: `1px solid ${active ? "var(--ink)" : "var(--line)"}`,
            borderRadius: 999,
            background: active ? "var(--ink)" : "transparent",
            color: active ? "white" : "var(--ink)",
            fontSize: 13,
            fontWeight: 800,
            textDecoration: "none",
            whiteSpace: "nowrap",
          }}
        >{locale === "ru" ? item.ru : item.en}</Link>;
      })}
    </div>

    <p style={{ margin: 0, color: "var(--muted)", fontSize: 12 }}>
      {locale === "ru"
        ? "Основной маршрут — «Учиться». Карта и остальные разделы помогают посмотреть прогресс, потренировать чтение стола или разобрать игру."
        : "“Learn” is the primary route. The map and other sections are supporting tools for progress, table reading, and review."}
    </p>
  </nav>;
}
