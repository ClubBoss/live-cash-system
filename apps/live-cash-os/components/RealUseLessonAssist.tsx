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

const WORKED_EXAMPLE_TASKS: Record<ModuleId, { ru: string; en: string }> = {
  geometry: {
    ru: "Определи, в каких единицах считать глубину при обязательном страддле и насколько глубок этот стек. Назови одну причину — затем открывай разбор.",
    en: "Decide which unit should measure depth with the mandatory straddle and how deep this stack is. Name one reason, then reveal the breakdown.",
  },
  preflop: {
    ru: "Выбери, какая ветка здесь лучше сохраняет ценность руки — колл, 3-бет или фолд. Назови один фактор, который делает эту ветку предпочтительнее.",
    en: "Choose which branch best preserves the hand's value here — call, 3-bet, or fold. Name one factor that makes that branch preferable.",
  },
  blinds: {
    ru: "Сравни план на одном и том же флопе против BB-защиты и SB-колла. Назови, чем отличаются диапазоны, которые дошли до флопа, и как это меняет план.",
    en: "Compare the plan on the same flop against a BB defend and an SB cold-call. Name how the arriving ranges differ and how that changes the plan.",
  },
  filtering: {
    ru: "Реши, можно ли автоматически продолжать широкий флоп-эксплойт на тёрне после колла соперника. Объясни, что именно колл изменил в его диапазоне.",
    en: "Decide whether the wide flop exploit should continue automatically on the turn after Villain calls. Explain what the call changed in Villain's range.",
  },
  shape: {
    ru: "Сравни две руки против маленькой широкой ставки: какая чаще выигрывает от рейза, а какая — от колла? Назови причину, связанную с уязвимостью или защитой колл-ветки.",
    en: "Compare the two hands against the small wide bet: which benefits more from raising and which from calling? Give a reason tied to vulnerability or protecting the calling branch.",
  },
  aggression: {
    ru: "Реши, ставить или чекать рукой почти без шоудаун-вэлью. Перед ответом назови, какую конкретную работу должен выполнить блеф сейчас или на следующей улице.",
    en: "Decide whether to bet or check with the hand that has almost no showdown value. Before answering, name the specific job a bluff would need to perform now or on the next street.",
  },
  ancestry: {
    ru: "Реши, является ли A5s хорошим 4-бет-блефом против плотного 3-бета SB. Сначала назови более сильные руки, которые реально должны сфолдить.",
    en: "Decide whether A5s is a good 4-bet bluff against the tight SB 3-bet. First name the better hands that would realistically need to fold.",
  },
  multiway: {
    ru: "Реши, как наличие BB за спиной меняет решение BTN с KQ против ставки HJ. Не переноси heads-up-логику автоматически: сначала учти ещё не ответивший диапазон.",
    en: "Decide how having the BB behind changes BTN's decision with KQ against the HJ bet. Do not copy heads-up logic automatically; account for the range that has not acted yet.",
  },
  river: {
    ru: "Реши, достаточно ли натсового флеш-блокера для колла. До оценки блокера назови правдоподобные вэлью и блефы, которые реально дошли по этой линии.",
    en: "Decide whether the nut-flush blocker is enough to justify a call. Before judging the blocker, name the plausible value and bluffs that could actually reach the river through this line.",
  },
  evidence: {
    ru: "Сформулируй рид не как ярлык игрока, а как конкретную ветку: что он делает, в каком узле, и какое будущее наблюдение заставит ослабить этот рид.",
    en: "Turn the read into a specific branch rather than a player label: what Villain does, in which node, and what future observation would make you weaken the read.",
  },
  transfer: {
    ru: "Определи, что доказывает правильный ответ сразу после объяснения и чего он ещё не доказывает. Назови следующую проверку, нужную для удержания навыка.",
    en: "Decide what a correct answer immediately after the explanation proves and what it does not prove yet. Name the next check needed for retention.",
  },
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
    const events: Array<keyof DocumentEventMap> = ["click", "input", "change", "keydown"];
    for (const event of events) document.addEventListener(event, sync, true);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    return () => {
      cancelAnimationFrame(frame);
      for (const event of events) document.removeEventListener(event, sync, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
    };
  }, []);
  return snapshot;
}

function useLiveHost(selector: string, enabled: boolean, identity: string): HTMLElement | null {
  const [host, setHost] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (!enabled) {
      setHost(null);
      return;
    }
    const sync = () => {
      const next = document.querySelector<HTMLElement>(selector);
      setHost((previous) => previous === next ? previous : next);
    };
    sync();
    const observer = new MutationObserver(sync);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [selector, enabled, identity]);
  return host;
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
  const enabled = Boolean(snapshot.moduleId) && snapshot.mode === "lesson" && snapshot.step > 0;
  const host = useLiveHost("main .session .session-head", enabled, `${snapshot.moduleId}:${snapshot.step}:${snapshot.revision}`);

  useEffect(() => {
    if (!enabled) setOpen(false);
  }, [enabled]);

  useEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [open]);

  if (!host || !snapshot.moduleId || !enabled) return null;
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
  const enabled = snapshot.mode === "lesson" && Boolean(snapshot.moduleId) && snapshot.step === 4;

  useEffect(() => {
    if (!enabled) {
      setHost(null);
      return;
    }
    let frame = requestAnimationFrame(() => {
      const session = document.querySelector<HTMLElement>("main .session");
      const heading = session?.querySelector<HTMLElement>(":scope > h2");
      if (!session || !heading) return;
      let slot = session.querySelector<HTMLElement>(":scope > [data-real-use-worked-guide]");
      if (!slot) {
        slot = document.createElement("div");
        slot.dataset.realUseWorkedGuide = "true";
        heading.insertAdjacentElement("afterend", slot);
      }
      session.classList.add("real-use-worked-guided");
      setHost(slot);
    });
    return () => {
      cancelAnimationFrame(frame);
      document.querySelector<HTMLElement>("main .session.real-use-worked-guided")?.classList.remove("real-use-worked-guided");
    };
  }, [enabled, snapshot.moduleId, snapshot.revision]);

  if (!enabled || !host || !snapshot.moduleId) return null;
  const task = WORKED_EXAMPLE_TASKS[snapshot.moduleId][snapshot.locale];
  return createPortal(<p className="real-use-task-guide"><strong>{snapshot.locale === "ru" ? "Что нужно решить сейчас:" : "What to decide now:"}</strong> {task}</p>, host);
}

export default function RealUseLessonAssist() {
  const snapshot = useLessonSnapshot();
  return <>
    <style>{`
      .session-head > .real-use-back { grid-column: 1 / -1; justify-self: start; min-height: 44px; padding: 8px 0; text-transform: none; letter-spacing: normal; }
      .real-use-task-guide { margin: -4px 0 22px; padding: 14px 16px; border-left: 4px solid var(--ink); background: var(--surface-soft); color: var(--ink); }
      .session.real-use-worked-guided > [data-real-use-worked-guide] + .support { display: none; }
      .real-use-recap-backdrop { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 18px; background: rgba(20, 21, 19, .48); }
      .real-use-recap { width: min(720px, 100%); max-height: min(82vh, 760px); overflow: auto; padding: 24px; background: var(--surface); border: 2px solid var(--ink); border-radius: 18px; box-shadow: 0 24px 70px rgba(0,0,0,.24); }
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
