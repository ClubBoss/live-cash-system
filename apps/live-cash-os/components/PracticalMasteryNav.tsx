"use client";

import Link from "next/link";
import { usePracticalLocale } from "../lib/use-practical-locale";

export default function PracticalMasteryNav() {
  const [locale] = usePracticalLocale();
  return <nav
    aria-label="Practical Mastery navigation"
    style={{ maxWidth: 1180, margin: "18px auto 0", padding: "0 20px", display: "flex", gap: 10, flexWrap: "wrap" }}
  >
    <Link className="secondary" href="/">Live Cash OS</Link>
    <Link className="secondary" href="/mastery">{locale === "ru" ? "Карта навыков" : "Skill map"}</Link>
    <Link className="secondary" href="/mastery/journey">{locale === "ru" ? "Первый круг" : "First Journey"}</Link>
    <Link className="secondary" href="/mastery/session">{locale === "ru" ? "Смешанная практика" : "Mixed session"}</Link>
    <Link className="secondary" href="/mastery/perception">{locale === "ru" ? "Чтение стола" : "Table reading"}</Link>
    <Link className="secondary" href="/mastery/study">{locale === "ru" ? "Работа над игрой" : "Study loop"}</Link>
    <Link className="secondary" href="/mastery/reference">{locale === "ru" ? "Ориентиры" : "Reference"}</Link>
    <Link className="secondary" href="/">{locale === "ru" ? "Реальные руки · Live Cash OS" : "Real Hands · Live Cash OS"}</Link>
  </nav>;
}
