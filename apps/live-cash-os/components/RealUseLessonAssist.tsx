"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { drillById, moduleById } from "../content/modules";
import type { ModuleContent } from "../content/types";
import type { LocaleCode, ModuleId } from "../lib/model";

const STORAGE_KEY = "live-cash-os:learner-state";

type LessonSnapshot = {
  locale: LocaleCode;
  moduleId: ModuleId | null;
  mode: string | null;
  step: number;
  drillIds: string[];
  revision: number;
};

const EMPTY: LessonSnapshot = {
  locale: "ru",
  moduleId: null,
  mode: null,
  step: 0,
  drillIds: [],
  revision: -1,
};

function readSnapshot(): LessonSnapshot {
  const locale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY, locale };
    const state = JSON.parse(raw) as {
      revision?: number;
      activeSession?: {
        mode?: string;
        moduleId?: string;
        step?: number;
        drillIds?: string[];
      } | null;
    };
    const session = state.activeSession;
    const moduleId = typeof session?.moduleId === "string" && session.moduleId in moduleById
      ? session.moduleId as ModuleId
      : null;
    return {
      locale,
      moduleId,
      mode: typeof session?.mode === "string" ? session.mode : null,
      step: typeof session?.step === "number" ? session.step : 0,
      drillIds: Array.isArray(session?.drillIds) ? session.drillIds.filter((id): id is string => typeof id === "string") : [],
      revision: typeof state.revision === "number" ? state.revision : 0,
    };
  } catch {
    return { ...EMPTY, locale };
  }
}

function same(left: LessonSnapshot, right: LessonSnapshot) {
  return left.locale === right.locale
    && left.moduleId === right.moduleId
    && left.mode === right.mode
    && left.step === right.step
    && left.revision === right.revision
    && left.drillIds.join("|") === right.drillIds.join("|");
}

function useLessonSnapshot() {
  const [snapshot, setSnapshot] = useState<LessonSnapshot>(EMPTY);
  useEffect(() => {
    let frame = 0;
    const sync = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const next = readSnapshot();
        setSnapshot((previous) => same(previous, next) ? previous : next);
      });
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    const events: Array<keyof DocumentEventMap> = ["click", "input", "change", "keydown"];
    for (const event of events) document.addEventListener(event, sync, true);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      for (const event of events) document.removeEventListener(event, sync, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return snapshot;
}

function applicationDrill(module: ModuleContent, snapshot: LessonSnapshot, index: 1 | 2) {
  const fromSession = drillById[snapshot.drillIds[index]];
  if (fromSession) return fromSession;
  const candidates = module.drills.filter((drill) => drill.kind === "changed" || drill.kind === "boundary");
  if (index === 1) return candidates[0] ?? module.drills[0];
  return candidates.find((drill) => drill.id !== candidates[0]?.id) ?? candidates[0] ?? module.drills[0];
}

function PreviousStepContent({ snapshot }: { snapshot: LessonSnapshot }) {
  if (!snapshot.moduleId || snapshot.step <= 0) return null;
  const module = moduleById[snapshot.moduleId];
  const previous = snapshot.step - 1;
  const locale = snapshot.locale;
  const labels = locale === "ru"
    ? ["Решение без подсказки", "Главная идея", "Применение", "Порядок решения", "Разобранный пример", "Тренажёр", "Новые условия", "Объяснение своими словами", "Памятка за столом", "Итог"]
    : ["Cold decision", "Core idea", "Application", "Decision order", "Worked example", "Lab", "Changed conditions", "Explain it back", "Table card", "Summary"];

  if (previous === 0) {
    const drill = module.drills[0];
    return <><p className="eyebrow">{labels[previous]}</p><h2>{drill.question}</h2><p>{drill.cue}</p><p className="assumption-strip">{drill.assumptions.join(" · ")}</p></>;
  }
  if (previous === 1) {
    return <><p className="eyebrow">{labels[previous]}</p><h2>{module.plainGoal}</h2><div className="answer-panel"><p>{module.tableCue}</p></div>{module.theory[0] && <p>{module.theory[0]}</p>}</>;
  }
  if (previous === 2 || previous === 6) {
    const drill = applicationDrill(module, snapshot, previous === 2 ? 1 : 2);
    return <><p className="eyebrow">{labels[previous]}</p><h2>{drill.question}</h2><p>{drill.cue}</p><p className="assumption-strip">{drill.assumptions.join(" · ")}</p></>;
  }
  if (previous === 3) {
    return <><p className="eyebrow">{labels[previous]}</p><h2>{module.tableCue}</h2><ol className="learning-list">{module.decisionTree.map((item) => <li key={item}>{item}</li>)}</ol></>;
  }
  if (previous === 4) {
    return <><p className="eyebrow">{labels[previous]}</p><h2>{module.workedExample.situation}</h2><ol className="learning-list">{module.workedExample.steps.map((item) => <li key={item}>{item}</li>)}</ol><div className="answer-panel"><p>{module.workedExample.answer}</p></div></>;
  }
  if (previous === 5) {
    return <><p className="eyebrow">{labels[previous]}</p><h2>{module.lab.title}</h2><p>{module.lab.description}</p>{module.lab.type === "spr" && <p className="assumption-strip">{locale === "ru" ? `Старт: банк ${module.lab.initialPot}, стек ${module.lab.stack}, ставка/колл ${module.lab.bet}.` : `Start: pot ${module.lab.initialPot}, stack ${module.lab.stack}, bet/call ${module.lab.bet}.`}</p>}</>;
  }
  if (previous === 7) {
    return <><p className="eyebrow">{labels[previous]}</p><h2>{module.explainBackPrompt}</h2><p>{locale === "ru" ? "Это только просмотр предыдущего шага. Текущий ответ и прогресс не меняются." : "This is a read-only recap. Your current answer and progress are unchanged."}</p></>;
  }
  return <><p className="eyebrow">{labels[previous]}</p><h2>{locale === "ru" ? "Ключевые ориентиры" : "Key cues"}</h2><div className="table-card">{module.tableCard.map((item, index) => <div key={item}><span>{String(index + 1).padStart(2, "0")}</span><b>{item}</b></div>)}</div></>;
}

function PreviousStepButton({ snapshot }: { snapshot: LessonSnapshot }) {
  const [open, setOpen] = useState(false);
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (snapshot.mode !== "lesson" || snapshot.step <= 0) {
      setHost(null);
      setOpen(false);
      return;
    }
    const syncHost = () => setHost(document.querySelector<HTMLElement>("main .session .session-head"));
    syncHost();
    const observer = new MutationObserver(syncHost);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [snapshot.mode, snapshot.step, snapshot.moduleId, snapshot.revision]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (!host || !snapshot.moduleId || snapshot.mode !== "lesson" || snapshot.step <= 0) return null;
  const button = <button className="real-use-back quiet" type="button" onClick={() => setOpen(true)}>{snapshot.locale === "ru" ? "← Предыдущий шаг" : "← Previous step"}</button>;
  return <>
    {createPortal(button, host)}
    {open && createPortal(<div className="real-use-recap-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section className="real-use-recap" role="dialog" aria-modal="true" aria-label={snapshot.locale === "ru" ? "Предыдущий шаг" : "Previous step"}>
        <div className="real-use-recap-head"><b>{snapshot.locale === "ru" ? `Шаг ${snapshot.step} из 10 · только просмотр` : `Step ${snapshot.step} of 10 · read only`}</b><button type="button" className="quiet" onClick={() => setOpen(false)}>{snapshot.locale === "ru" ? "Закрыть" : "Close"}</button></div>
        <PreviousStepContent snapshot={snapshot} />
        <p className="support">{snapshot.locale === "ru" ? "Возврат сюда ничего не пересчитывает и не меняет уже сохранённые ответы." : "This recap does not rescore or alter any saved answers."}</p>
        <button className="primary" type="button" onClick={() => setOpen(false)}>{snapshot.locale === "ru" ? "Вернуться к текущему шагу" : "Return to current step"}</button>
      </section>
    </div>, document.body)}
  </>;
}

function WorkedExampleGuide({ snapshot }: { snapshot: LessonSnapshot }) {
  const [host, setHost] = useState<HTMLElement | null>(null);
  const enabled = snapshot.mode === "lesson" && snapshot.moduleId === "geometry" && snapshot.step === 4;

  useEffect(() => {
    if (!enabled) {
      setHost(null);
      return;
    }
    const sync = () => {
      const session = document.querySelector<HTMLElement>("main .session");
      const heading = session?.querySelector<HTMLElement>(":scope > h2");
      if (!session || !heading) return;
      let slot = session.querySelector<HTMLElement>(":scope > [data-real-use-worked-guide]");
      if (!slot) {
        slot = document.createElement("div");
        slot.dataset.realUseWorkedGuide = "true";
        heading.insertAdjacentElement("afterend", slot);
      }
      setHost((previous) => previous === slot ? previous : slot);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [enabled, snapshot.revision]);

  if (!enabled || !host) return null;
  return createPortal(<p className="real-use-task-guide"><strong>{snapshot.locale === "ru" ? "Что нужно решить сейчас:" : "What to decide now:"}</strong> {snapshot.locale === "ru" ? "сначала определи, в каких единицах считать глубину при обязательном страддле и насколько глубок этот стек. Назови одну причину — затем открывай разбор." : "first decide which unit should measure depth with the mandatory straddle and how deep this stack is. Name one reason, then reveal the breakdown."}</p>, host);
}

export default function RealUseLessonAssist() {
  const snapshot = useLessonSnapshot();
  return <>
    <style>{`
      .session-head > .real-use-back { grid-column: 1 / -1; justify-self: start; min-height: 44px; padding: 8px 0; text-transform: none; letter-spacing: normal; }
      .real-use-task-guide { margin: -4px 0 22px; padding: 14px 16px; border-left: 4px solid var(--ink); background: var(--panel); color: var(--ink); }
      .real-use-recap-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 18px; background: rgba(20, 21, 19, .48); }
      .real-use-recap { width: min(720px, 100%); max-height: min(82vh, 760px); overflow: auto; padding: 24px; background: var(--paper); border: 2px solid var(--ink); border-radius: 18px; box-shadow: 0 24px 70px rgba(0,0,0,.24); }
      .real-use-recap-head { display: flex; justify-content: space-between; gap: 18px; align-items: center; margin-bottom: 22px; }
      .real-use-recap .primary { margin-top: 10px; }
      @media (max-width: 520px) {
        .real-use-recap-backdrop { align-items: end; padding: 0; }
        .real-use-recap { width: 100%; max-height: 86vh; border-radius: 18px 18px 0 0; border-width: 2px 0 0; padding: 20px; }
      }
    `}</style>
    <PreviousStepButton snapshot={snapshot} />
    <WorkedExampleGuide snapshot={snapshot} />
  </>;
}
