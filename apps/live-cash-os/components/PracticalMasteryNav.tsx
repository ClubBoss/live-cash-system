"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { usePracticalLocale } from "../lib/use-practical-locale";

const items = [
  { href: "/mastery", ru: "Карта навыков", en: "Skill map" },
  { href: "/mastery/journey", ru: "Старт обучения", en: "Start learning" },
  { href: "/mastery/session", ru: "Практика", en: "Practice" },
  { href: "/mastery/perception", ru: "Чтение стола", en: "Table reading" },
  { href: "/mastery/study", ru: "После игры", en: "After play" },
  { href: "/mastery/reference", ru: "Справочник", en: "Reference" },
] as const;

export default function PracticalMasteryNav() {
  const [locale] = usePracticalLocale();
  const pathname = usePathname();

  return <nav
    aria-label="Practical Mastery navigation"
    style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 20px", display: "grid", gap: 10 }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
      <Link href="/" style={{ color: "var(--muted)", fontSize: 13, fontWeight: 800, textDecoration: "none", minHeight: 40, display: "inline-flex", alignItems: "center" }}>
        {locale === "ru" ? "← Главная Live Cash OS" : "← Live Cash OS home"}
      </Link>
      <span style={{ color: "var(--muted)", fontSize: 11, fontWeight: 800, letterSpacing: ".13em", textTransform: "uppercase" }}>
        {locale === "ru" ? "Практическое обучение" : "Practical learning"}
      </span>
      <Link href="/?tab=field" style={{ color: "var(--ink)", fontSize: 13, fontWeight: 800, textDecoration: "none", minHeight: 40, display: "inline-flex", alignItems: "center" }}>
        {locale === "ru" ? "Реальные руки →" : "Real hands →"}
      </Link>
    </div>

    <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4, scrollbarWidth: "thin" }}>
      {items.map((item) => {
        const active = item.href === "/mastery" ? pathname === item.href : pathname.startsWith(item.href);
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
  </nav>;
}
