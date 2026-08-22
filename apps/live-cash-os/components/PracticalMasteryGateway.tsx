"use client";

import { useEffect, useLayoutEffect, useState } from "react";
import LegacyToolDeepLink from "./LegacyToolDeepLink";
import PracticalNextLearningLink from "./PracticalNextLearningLink";
import SupportingToolsIntro from "./SupportingToolsIntro";

const LOCALE_KEY = "live-cash-os:locale";
type Locale = "ru" | "en";

function preserveAnchor(anchor: HTMLElement) {
  const top = anchor.getBoundingClientRect().top;
  anchor.tabIndex = -1;
  anchor.focus({ preventScroll: true });

  const restore = () => {
    if (!anchor.isConnected) return;
    const delta = anchor.getBoundingClientRect().top - top;
    if (Math.abs(delta) > 1) window.scrollBy({ top: delta, left: 0, behavior: "auto" });
  };

  requestAnimationFrame(() => {
    restore();
    requestAnimationFrame(restore);
  });
}

export default function PracticalMasteryGateway() {
  const [locale, setLocale] = useState<Locale>("ru");
  const [activeSession, setActiveSession] = useState(false);

  useEffect(() => {
    try {
      setLocale(window.localStorage.getItem(LOCALE_KEY) === "en" ? "en" : "ru");
    } catch {
      setLocale("ru");
    }
  }, []);

  useLayoutEffect(() => {
    const syncActiveSession = () => setActiveSession(Boolean(document.querySelector("main .session")));
    syncActiveSession();
    const observer = new MutationObserver(syncActiveSession);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (!(event.target instanceof Element)) return;
      const button = event.target.closest("button");
      if (!(button instanceof HTMLButtonElement) || !button.matches("button.primary")) return;
      const session = button.closest<HTMLElement>("main .session");
      if (!session || !session.querySelector("[data-real-use-worked-guide]")) return;
      preserveAnchor(session.querySelector<HTMLElement>(":scope > h2") ?? session);
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  if (activeSession) return <LegacyToolDeepLink />;

  return <>
    <LegacyToolDeepLink />
    <section
      aria-label={locale === "ru" ? "Основной маршрут обучения" : "Primary learning route"}
      className="surface practical-mastery-gateway"
      style={{ maxWidth: 1180, margin: "18px auto 0", padding: "18px 20px" }}
    >
      <p className="eyebrow practical-mastery-gateway__eyebrow">LIVE CASH TRAINING</p>
      <h2>{locale === "ru" ? "Один маршрут: учись, решай, применяй, повторяй" : "One route: learn, decide, apply, repeat"}</h2>
      <p className="practical-mastery-gateway__detail">{locale === "ru"
        ? "Нажми «Продолжить обучение». Система сама выберет следующий полезный шаг: новый механизм, решение, перенос на изменённый спот или повторение. Карта, чтение стола и разбор после игры — дополнительные инструменты, а не отдельные курсы."
        : "Choose “Continue learning”. The system picks the next useful step: a new mechanism, a decision, changed-node transfer, or review. The map, table reading, and after-play review are supporting tools, not separate courses."}</p>
      <div className="practical-mastery-gateway__actions" style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 12 }}>
        <PracticalNextLearningLink className="primary" />
        <a className="secondary practical-mastery-gateway__map" href="/mastery">{locale === "ru" ? "Посмотреть карту" : "View map"}</a>
      </div>
      <style>{`
        @media (max-width: 650px) {
          .practical-mastery-gateway {
            margin: 8px 12px 0 !important;
            padding: 10px 12px !important;
          }
          .practical-mastery-gateway h2,
          .practical-mastery-gateway__detail,
          .practical-mastery-gateway__map {
            display: none !important;
          }
          .practical-mastery-gateway__eyebrow {
            margin: 0 0 6px !important;
          }
          .practical-mastery-gateway__actions {
            margin-top: 0 !important;
          }
          .practical-mastery-gateway__actions .primary {
            min-height: 40px;
            padding: 8px 12px;
            font-size: 13px;
          }
        }
      `}</style>
    </section>
    <SupportingToolsIntro />
  </>;
}
