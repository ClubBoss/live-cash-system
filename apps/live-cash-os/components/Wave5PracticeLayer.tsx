"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { moduleById } from "../content/modules";
import type { Lab } from "../content/types";
import type { LocaleCode, ModuleId } from "../lib/model";

const STORAGE_KEY = "live-cash-os:learner-state";

type PracticeSnapshot = {
  locale: LocaleCode;
  moduleId: ModuleId | null;
  labActive: boolean;
  mixedActive: boolean;
  completedModules: number;
  revision: number;
};

type SprLab = Extract<Lab, { type: "spr" }>;
type CompareLab = Extract<Lab, { type: "compare" }>;

const EMPTY_SNAPSHOT: PracticeSnapshot = {
  locale: "ru",
  moduleId: null,
  labActive: false,
  mixedActive: false,
  completedModules: 0,
  revision: -1,
};

function sameSnapshot(left: PracticeSnapshot, right: PracticeSnapshot): boolean {
  return left.locale === right.locale
    && left.moduleId === right.moduleId
    && left.labActive === right.labActive
    && left.mixedActive === right.mixedActive
    && left.completedModules === right.completedModules
    && left.revision === right.revision;
}

function readPracticeSnapshot(): PracticeSnapshot {
  const locale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SNAPSHOT, locale };
    const state = JSON.parse(raw) as {
      revision?: number;
      activeSession?: { moduleId?: string; mode?: string; step?: number } | null;
      modules?: Record<string, { contentCompleted?: boolean }>;
    };
    const moduleId = typeof state.activeSession?.moduleId === "string" && state.activeSession.moduleId in moduleById
      ? state.activeSession.moduleId as ModuleId
      : null;
    return {
      locale,
      moduleId,
      labActive: state.activeSession?.mode === "lesson" && state.activeSession?.step === 5,
      mixedActive: state.activeSession?.mode === "mixed",
      completedModules: Object.values(state.modules ?? {}).filter((entry) => entry?.contentCompleted === true).length,
      revision: typeof state.revision === "number" ? state.revision : 0,
    };
  } catch {
    return { ...EMPTY_SNAPSHOT, locale };
  }
}

function applyPracticeDom(snapshot: PracticeSnapshot) {
  document.querySelectorAll<HTMLElement>(".decision-card[data-wave5-mixed='true']").forEach((card) => {
    delete card.dataset.wave5Mixed;
    card.removeAttribute("role");
    card.removeAttribute("aria-label");
    card.querySelector<HTMLElement>(":scope > .eyebrow")?.removeAttribute("aria-hidden");
  });

  if (snapshot.mixedActive) {
    const card = document.querySelector<HTMLElement>("main .session .decision-card");
    const eyebrow = card?.querySelector<HTMLElement>(":scope > .eyebrow");
    if (card && eyebrow) {
      card.dataset.wave5Mixed = "true";
      card.setAttribute("role", "group");
      card.setAttribute("aria-label", snapshot.locale === "ru" ? "Смешанная задача" : "Mixed decision");
      eyebrow.setAttribute("aria-hidden", "true");
    }
  }

  const mixedButton = document.querySelector<HTMLButtonElement>("button.secondary.wide");
  if (mixedButton && snapshot.completedModules < 3) {
    mixedButton.disabled = true;
    mixedButton.title = snapshot.locale === "ru"
      ? "Смешанная тренировка откроется после трёх пройденных тем."
      : "Mixed practice unlocks after three completed topics.";
  } else if (mixedButton) {
    mixedButton.removeAttribute("title");
  }
}

function usePracticeSnapshot(): PracticeSnapshot {
  const [snapshot, setSnapshot] = useState<PracticeSnapshot>(EMPTY_SNAPSHOT);

  useEffect(() => {
    let scheduled = false;
    const sync = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => requestAnimationFrame(() => {
        scheduled = false;
        const next = readPracticeSnapshot();
        applyPracticeDom(next);
        setSnapshot((previous) => sameSnapshot(previous, next) ? previous : next);
      }));
    };

    sync();
    const events: Array<keyof DocumentEventMap> = ["click", "input", "change", "keydown"];
    for (const event of events) document.addEventListener(event, sync, true);
    window.addEventListener("storage", sync);
    window.addEventListener("focus", sync);
    const fallback = window.setInterval(sync, 500);
    return () => {
      for (const event of events) document.removeEventListener(event, sync, true);
      window.removeEventListener("storage", sync);
      window.removeEventListener("focus", sync);
      window.clearInterval(fallback);
    };
  }, []);

  return snapshot;
}

function nextCoreLabStep() {
  delete document.documentElement.dataset.wave5LabGate;
  requestAnimationFrame(() => {
    const button = document.querySelector<HTMLButtonElement>("main .session > button.primary");
    button?.click();
  });
}

function PredictionStep({ locale, prompt, prediction, setPrediction, onContinue }: {
  locale: LocaleCode;
  prompt: string;
  prediction: string;
  setPrediction: (value: string) => void;
  onContinue: () => void;
}) {
  const copy = locale === "ru" ? {
    eyebrow: "ПЕРЕД ТРЕНАЖЁРОМ",
    title: "Сначала спрогнозируй результат.",
    help: "Запиши, что должно измениться и почему. После этого откроется взаимодействие — не наоборот.",
    placeholder: "Мой прогноз и причина…",
    button: "Зафиксировать прогноз",
  } : {
    eyebrow: "BEFORE THE LAB",
    title: "Predict the result first.",
    help: "State what should change and why. The interaction opens only after the prediction.",
    placeholder: "My prediction and reason…",
    button: "Lock prediction",
  };
  return <>
    <p className="eyebrow">{copy.eyebrow}</p>
    <h2>{copy.title}</h2>
    <p className="support">{prompt}</p>
    <p className="support">{copy.help}</p>
    <textarea className="large-input" aria-label={copy.title} value={prediction} onChange={(event) => setPrediction(event.target.value)} placeholder={copy.placeholder} />
    <button className="primary" disabled={prediction.trim().length < 20} onClick={onContinue}>{copy.button} <span>→</span></button>
  </>;
}

function SprInteraction({ locale, moduleId, lab, onComplete }: { locale: LocaleCode; moduleId: ModuleId; lab: SprLab; onComplete: () => void }) {
  const module = moduleById[moduleId];
  const [pot, setPot] = useState(String(lab.initialPot));
  const [stack, setStack] = useState(String(lab.stack));
  const [bet, setBet] = useState(String(lab.bet));
  const numbers = useMemo(() => [pot, stack, bet].map((value) => value.trim() === "" ? Number.NaN : Number(value)), [pot, stack, bet]);
  const [potValue, stackValue, betValue] = numbers;
  const finite = numbers.every((value) => Number.isFinite(value) && value >= 0);
  const changed = finite && (potValue !== lab.initialPot || stackValue !== lab.stack || betValue !== lab.bet);
  let error = "";
  if (!finite) error = locale === "ru" ? "Введи конечные неотрицательные числа." : "Enter finite non-negative numbers.";
  else if (betValue > stackValue) error = locale === "ru" ? "Ставка/колл не может быть больше оставшегося стека." : "Bet/call cannot exceed the remaining stack.";
  else if (potValue + 2 * betValue <= 0) error = locale === "ru" ? "После действия размер банка должен быть больше нуля." : "The post-action pot must be greater than zero.";
  const spr = error ? null : Math.max(0, (stackValue - betValue) / (potValue + 2 * betValue));
  const copy = locale === "ru" ? {
    eyebrow: "ПРОВЕРЬ ПРОГНОЗ",
    title: "Измени хотя бы одну важную переменную.",
    pot: "Банк до ставки",
    stack: "Оставшийся стек",
    bet: "Ставка / колл",
    unchanged: "Измени хотя бы одно значение — иначе тренажёр не проверяет прогноз.",
    boundary: "Граница",
    finish: "Зафиксировать вывод",
  } : {
    eyebrow: "TEST THE PREDICTION",
    title: "Change at least one material variable.",
    pot: "Pot before bet",
    stack: "Remaining stack",
    bet: "Bet / call",
    unchanged: "Change at least one value so the lab actually tests the prediction.",
    boundary: "Boundary",
    finish: "Lock the conclusion",
  };

  return <>
    <p className="eyebrow">{copy.eyebrow}</p>
    <h2>{copy.title}</h2>
    <div className="spr-lab">
      <label>{copy.pot}<input type="number" inputMode="decimal" min="0" value={pot} onChange={(event) => setPot(event.target.value)} /></label>
      <label>{copy.stack}<input type="number" inputMode="decimal" min="0" value={stack} onChange={(event) => setStack(event.target.value)} /></label>
      <label>{copy.bet}<input type="number" inputMode="decimal" min="0" value={bet} onChange={(event) => setBet(event.target.value)} /></label>
      <div className="spr-result" aria-live="polite"><span>SPR</span><b>{spr === null ? "—" : spr.toFixed(2)}</b>{spr !== null && <small>({stackValue}−{betValue}) / ({potValue}+2×{betValue})</small>}</div>
    </div>
    {error ? <p className="assumption-strip" role="alert">{error}</p> : !changed ? <p className="assumption-strip">{copy.unchanged}</p> : <p className="support">{lab.description}</p>}
    <div className="counterexample"><b>{copy.boundary}</b><p>{module.counterexample}</p></div>
    <button className="primary" disabled={Boolean(error) || !changed} onClick={onComplete}>{copy.finish} <span>→</span></button>
  </>;
}

function CompareInteraction({ locale, moduleId, lab, onComplete }: { locale: LocaleCode; moduleId: ModuleId; lab: CompareLab; onComplete: () => void }) {
  const module = moduleById[moduleId];
  const [active, setActive] = useState<"left" | "right" | null>(null);
  const [seen, setSeen] = useState<Array<"left" | "right">>([]);
  const visit = (side: "left" | "right") => {
    setActive(side);
    setSeen((previous) => previous.includes(side) ? previous : [...previous, side]);
  };
  const complete = seen.length === 2;
  const copy = locale === "ru" ? {
    eyebrow: "ПРОВЕРЬ ПРОГНОЗ",
    title: "Сравни две версии ситуации.",
    help: "Открой обе стороны и объясни себе, какая переменная меняет решение.",
    boundary: "Граница",
    finish: "Зафиксировать вывод",
  } : {
    eyebrow: "TEST THE PREDICTION",
    title: "Compare both versions of the spot.",
    help: "Inspect both sides and identify which variable changes the decision.",
    boundary: "Boundary",
    finish: "Lock the conclusion",
  };
  return <>
    <p className="eyebrow">{copy.eyebrow}</p>
    <h2>{copy.title}</h2>
    <p className="support">{copy.help}</p>
    <div className="button-row" role="group" aria-label={copy.title}>
      <button aria-pressed={active === "left"} onClick={() => visit("left")}>{lab.leftTitle}</button>
      <button aria-pressed={active === "right"} onClick={() => visit("right")}>{lab.rightTitle}</button>
    </div>
    {active && <div className="answer-panel" aria-live="polite"><b>{active === "left" ? lab.leftTitle : lab.rightTitle}</b><p>{active === "left" ? lab.leftText : lab.rightText}</p></div>}
    {complete && <div className="counterexample"><b>{copy.boundary}</b><p>{module.counterexample}</p></div>}
    <button className="primary" disabled={!complete} onClick={onComplete}>{copy.finish} <span>→</span></button>
  </>;
}

function Wave5LabGate({ locale, moduleId }: { locale: LocaleCode; moduleId: ModuleId }) {
  const module = moduleById[moduleId];
  const [prediction, setPrediction] = useState("");
  const [phase, setPhase] = useState<"prediction" | "interact">("prediction");

  useEffect(() => {
    document.documentElement.dataset.wave5LabGate = "active";
    return () => { delete document.documentElement.dataset.wave5LabGate; };
  }, [moduleId]);

  return <section className="wave5-lab-gate" data-wave5-lab-module={moduleId}>
    {phase === "prediction"
      ? <PredictionStep locale={locale} prompt={module.lab.description} prediction={prediction} setPrediction={setPrediction} onContinue={() => setPhase("interact")} />
      : module.lab.type === "spr"
        ? <SprInteraction locale={locale} moduleId={moduleId} lab={module.lab} onComplete={nextCoreLabStep} />
        : <CompareInteraction locale={locale} moduleId={moduleId} lab={module.lab} onComplete={nextCoreLabStep} />}
  </section>;
}

function Wave5LabPortal({ locale, moduleId }: { locale: LocaleCode; moduleId: ModuleId }) {
  const [host, setHost] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setHost(document.querySelector<HTMLElement>("main .session"));
  }, [moduleId]);

  return host ? createPortal(<Wave5LabGate key={moduleId} locale={locale} moduleId={moduleId} />, host) : null;
}

export default function Wave5PracticeLayer() {
  const snapshot = usePracticeSnapshot();
  return <>
    <style>{`
      .decision-card[data-wave5-mixed="true"] > .eyebrow { font-size: 0 !important; }
      html[lang="ru"] .decision-card[data-wave5-mixed="true"] > .eyebrow::after { content: "СМЕШАННАЯ ЗАДАЧА"; font-size: .75rem; }
      html[lang="en"] .decision-card[data-wave5-mixed="true"] > .eyebrow::after { content: "MIXED DECISION"; font-size: .75rem; }
      html[data-wave5-lab-gate="active"] main .session > :not(.session-head):not(.wave5-lab-gate) { display: none !important; }
      .wave5-lab-gate { display: block; }
      .wave5-lab-gate > .assumption-strip { display: block !important; }
    `}</style>
    {snapshot.labActive && snapshot.moduleId && <Wave5LabPortal locale={snapshot.locale} moduleId={snapshot.moduleId} />}
  </>;
}
