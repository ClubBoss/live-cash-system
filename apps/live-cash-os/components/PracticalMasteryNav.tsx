"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { usePracticalLocale } from "../lib/use-practical-locale";
import { usePracticalProfileState } from "../lib/use-practical-profile-state";
import PracticalDocumentLink, { warmPracticalDocument } from "./PracticalDocumentLink";
import PracticalNextLearningLink from "./PracticalNextLearningLink";

type IconName = "home" | "learn" | "eye" | "review" | "book" | "hands" | "settings";

function NavIcon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>;
  if (name === "learn") return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>;
  if (name === "eye") return <svg {...common}><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>;
  if (name === "review") return <svg {...common}><path d="M4 7h6M14 7h6M7 4v6M17 4v6"/><path d="m5 16 3 3 5-6"/><path d="M15 15h4v4"/></svg>;
  if (name === "book") return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5Z"/></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.4 1a8 8 0 0 0-1.8-1L14.4 3h-4.8l-.3 3.1a8 8 0 0 0-1.8 1l-2.4-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.4-1a8 8 0 0 0 1.8 1l.3 3.1h4.8l.3-3.1a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z"/></svg>;
  return <svg {...common}><path d="M7 13c-2.5-2-3-4.5-1.3-6.2 1.4-1.4 3.5-.9 5.3.6l1 1 1-1c1.8-1.5 3.9-2 5.3-.6C20 8.5 19.5 11 17 13l-5 4-5-4Z"/><path d="M5 17h14"/></svg>;
}

const tools = [
  { href: "/mastery/improve", ru: "Улучшить", en: "Improve", icon: "review" as IconName },
  { href: "/mastery/perception", ru: "Чтение стола", en: "Table reading", icon: "eye" as IconName },
  { href: "/mastery/study", ru: "После игры", en: "After play", icon: "review" as IconName },
  { href: "/mastery/reference", ru: "Справочник", en: "Reference", icon: "book" as IconName },
] as const;

const warmRoutes = ["/mastery", "/mastery/journey", "/mastery/improve", "/mastery/perception", "/mastery/study", "/mastery/reference", "/tools?tab=data"] as const;

export default function PracticalMasteryNav() {
  const [locale, setLocale] = usePracticalLocale();
  const { cloudMode } = usePracticalProfileState();
  const pathname = usePathname();
  const learningActive = pathname === "/mastery/journey" || pathname === "/mastery/session";
  const homeActive = pathname === "/mastery";
  const syncLabel = locale === "ru" ? (cloudMode === "cloud" ? "Облако" : "На устройстве") : (cloudMode === "cloud" ? "Cloud" : "On device");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      for (const route of warmRoutes) warmPracticalDocument(route);
    }, 250);
    return () => window.clearTimeout(timer);
  }, []);

  return <nav aria-label="Practical Mastery navigation" className="practical-mastery-nav">
    <div className="practical-mastery-nav__brand">LIVE CASH OS</div>
    <div className="practical-mastery-nav__rail">
      <PracticalDocumentLink href="/mastery" aria-current={homeActive ? "page" : undefined} className={`practical-mastery-nav__item practical-mastery-nav__home ${homeActive ? "is-active" : ""}`}>
        <NavIcon name="home"/><span>{locale === "ru" ? "Главная" : "Home"}</span>
      </PracticalDocumentLink>
      <PracticalNextLearningLink className={`practical-mastery-nav__item ${learningActive ? "is-active" : ""}`} ariaCurrent={learningActive ? "page" : undefined}>
        <NavIcon name="learn"/><span>{locale === "ru" ? "Продолжить обучение" : "Continue learning"}</span>
      </PracticalNextLearningLink>
      {tools.map((item) => {
        const active = pathname === item.href;
        return <PracticalDocumentLink key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`practical-mastery-nav__item ${active ? "is-active" : ""}`}>
          <NavIcon name={item.icon}/><span>{locale === "ru" ? item.ru : item.en}</span>
        </PracticalDocumentLink>;
      })}
    </div>
    <div className="practical-mastery-nav__utilities" aria-label={locale === "ru" ? "Настройки обучения" : "Learning utilities"} style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
      <div className="mode-switch" aria-label={locale === "ru" ? "Язык" : "Language"}><button aria-pressed={locale === "ru"} onClick={() => setLocale("ru")}>RU</button><button aria-pressed={locale === "en"} onClick={() => setLocale("en")}>EN</button></div>
      <span className="support" data-testid="practical-sync-status" style={{ margin: 0 }}>{syncLabel}</span>
      <PracticalDocumentLink href="/tools?tab=data" className="practical-mastery-nav__item" data-testid="data-recovery-entry" style={{ minHeight: 40, padding: "7px 10px", flex: "0 1 auto", flexDirection: "row", border: "1px solid var(--line)", borderRadius: 12 }}><NavIcon name="settings"/><span>{locale === "ru" ? "Данные" : "Data"}</span></PracticalDocumentLink>
    </div>
    <PracticalDocumentLink href="/tools?tab=field" className="practical-mastery-nav__hands"><NavIcon name="hands"/><span>{locale === "ru" ? "Реальные руки →" : "Real hands →"}</span></PracticalDocumentLink>
  </nav>;
}
