"use client";

import { usePathname } from "next/navigation";
import { usePracticalLocale } from "../lib/use-practical-locale";
import PracticalNextLearningLink from "./PracticalNextLearningLink";

type IconName = "home" | "learn" | "map" | "eye" | "review" | "book" | "hands";

function NavIcon({ name }: { name: IconName }) {
  const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  if (name === "home") return <svg {...common}><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>;
  if (name === "learn") return <svg {...common}><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M2 12h2M20 12h2"/></svg>;
  if (name === "map") return <svg {...common}><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>;
  if (name === "eye") return <svg {...common}><path d="M2.5 12s3.5-5 9.5-5 9.5 5 9.5 5-3.5 5-9.5 5-9.5-5-9.5-5Z"/><circle cx="12" cy="12" r="2.5"/></svg>;
  if (name === "review") return <svg {...common}><path d="M4 7h6M14 7h6M7 4v6M17 4v6"/><path d="m5 16 3 3 5-6"/><path d="M15 15h4v4"/></svg>;
  if (name === "book") return <svg {...common}><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H11v16H6.5A2.5 2.5 0 0 0 4 21.5Z"/><path d="M20 5.5A2.5 2.5 0 0 0 17.5 3H13v16h4.5A2.5 2.5 0 0 1 20 21.5Z"/></svg>;
  return <svg {...common}><path d="M7 13c-2.5-2-3-4.5-1.3-6.2 1.4-1.4 3.5-.9 5.3.6l1 1 1-1c1.8-1.5 3.9-2 5.3-.6C20 8.5 19.5 11 17 13l-5 4-5-4Z"/><path d="M5 17h14"/></svg>;
}

const tools = [
  { href: "/mastery", ru: "Карта", en: "Map", icon: "map" as IconName },
  { href: "/mastery/perception", ru: "Чтение стола", en: "Table reading", icon: "eye" as IconName },
  { href: "/mastery/study", ru: "После игры", en: "After play", icon: "review" as IconName },
  { href: "/mastery/reference", ru: "Справочник", en: "Reference", icon: "book" as IconName },
] as const;

export default function PracticalMasteryNav() {
  const [locale] = usePracticalLocale();
  const pathname = usePathname();
  const learningActive = pathname === "/mastery/journey" || pathname === "/mastery/session";

  return <nav aria-label="Practical Mastery navigation" className="practical-mastery-nav">
    <div className="practical-mastery-nav__brand">LIVE CASH OS</div>
    <div className="practical-mastery-nav__rail">
      <a href="/" className="practical-mastery-nav__item practical-mastery-nav__home">
        <NavIcon name="home"/><span>{locale === "ru" ? "Главная" : "Home"}</span>
      </a>
      <PracticalNextLearningLink className={`practical-mastery-nav__item ${learningActive ? "is-active" : ""}`} ariaCurrent={learningActive ? "page" : undefined}>
        <NavIcon name="learn"/><span>{locale === "ru" ? "Учиться" : "Learn"}</span>
      </PracticalNextLearningLink>
      {tools.map((item) => {
        const active = pathname === item.href;
        return <a key={item.href} href={item.href} aria-current={active ? "page" : undefined} className={`practical-mastery-nav__item ${active ? "is-active" : ""}`}>
          <NavIcon name={item.icon}/><span>{locale === "ru" ? item.ru : item.en}</span>
        </a>;
      })}
    </div>
    <a href="/?tab=field" className="practical-mastery-nav__hands"><NavIcon name="hands"/><span>{locale === "ru" ? "Реальные руки →" : "Real hands →"}</span></a>
  </nav>;
}
