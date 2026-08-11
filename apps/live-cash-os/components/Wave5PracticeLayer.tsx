"use client";

import { useEffect, useLayoutEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { moduleById } from "../content/modules";
import type { Lab } from "../content/types";
import type { LocaleCode, ModuleId } from "../lib/model";

const STORAGE_KEY = "live-cash-os:learner-state";

type PracticeSnapshot = { locale: LocaleCode; moduleId: ModuleId | null; labActive: boolean; mixedActive: boolean; completedModules: number; revision: number };
type SprLab = Extract<Lab, { type: "spr" }>;
type CompareLab = Extract<Lab, { type: "compare" }>;
const EMPTY_SNAPSHOT: PracticeSnapshot = { locale: "ru", moduleId: null, labActive: false, mixedActive: false, completedModules: 0, revision: -1 };

function sameSnapshot(left: PracticeSnapshot, right: PracticeSnapshot): boolean {
  return left.locale === right.locale && left.moduleId === right.moduleId && left.labActive === right.labActive && left.mixedActive === right.mixedActive && left.completedModules === right.completedModules && left.revision === right.revision;
}

function readPracticeSnapshot(): PracticeSnapshot {
  const locale: LocaleCode = document.documentElement.lang === "en" ? "en" : "ru";
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...EMPTY_SNAPSHOT, locale };
    const state = JSON.parse(raw) as { revision?: number; activeSession?: { moduleId?: string; mode?: string; step?: number } | null; modules?: Record<string, { contentCompleted?: boolean }> };
    const moduleId = typeof state.activeSession?.moduleId === "string" && state.activeSession.moduleId in moduleById ? state.activeSession.moduleId as ModuleId : null;
    return { locale, moduleId, labActive: state.activeSession?.mode === "lesson" && state.activeSession?.step === 5, mixedActive: state.activeSession?.mode === "mixed", completedModules: Object.values(state.modules ?? {}).filter((entry) => entry?.contentCompleted === true).length, revision: typeof state.revision === "number" ? state.revision : 0 };
  } catch { return { ...EMPTY_SNAPSHOT, locale }; }
}

function applyPracticeDom(snapshot: PracticeSnapshot) {
  document.querySelectorAll<HTMLElement>(".decision-card[data-wave5-mixed='true']").forEach((card) => {
    if (!snapshot.mixedActive) { delete card.dataset.wave5Mixed; card.removeAttribute("role"); card.removeAttribute("aria-label"); card.querySelector<HTMLElement>(":scope > .eyebrow")?.removeAttribute("aria-hidden"); }
  });
  if (snapshot.mixedActive) {
    const card = document.querySelector<HTMLElement>("main .session .decision-card");
    const eyebrow = card?.querySelector<HTMLElement>(":scope > .eyebrow");
    if (card && eyebrow) {
      if (card.dataset.wave5Mixed !== "true") card.dataset.wave5Mixed = "true";
      if (card.getAttribute("role") !== "group") card.setAttribute("role", "group");
      const label = snapshot.locale === "ru" ? "Смешанная задача" : "Mixed decision";
      if (card.getAttribute("aria-label") !== label) card.setAttribute("aria-label", label);
      if (eyebrow.getAttribute("aria-hidden") !== "true") eyebrow.setAttribute("aria-hidden", "true");
    }
  }
  const mixedButton = document.querySelector<HTMLButtonElement>("button.secondary.wide");
  if (mixedButton && snapshot.completedModules < 3) {
    if (!mixedButton.disabled) mixedButton.disabled = true;
    const title = snapshot.locale === "ru" ? "Смешанная тренировка откроется после трёх пройденных тем." : "Mixed practice unlocks after three completed topics.";
    if (mixedButton.title !== title) mixedButton.title = title;
  } else if (mixedButton?.title) mixedButton.removeAttribute("title");
}

function usePracticeSnapshot(): PracticeSnapshot {
  const [snapshot, setSnapshot] = useState<PracticeSnapshot>(EMPTY_SNAPSHOT);
  useEffect(() => {
    let frame = 0;
    const sync = () => { cancelAnimationFrame(frame); frame = requestAnimationFrame(() => { const next = readPracticeSnapshot(); applyPracticeDom(next); setSnapshot((previous) => sameSnapshot(previous, next) ? previous : next); }); };
    sync();
    const events: Array<keyof DocumentEventMap> = ["click", "input", "change", "keydown"];
    for (const event of events) document.addEventListener(event, sync, true);
    window.addEventListener("storage", sync); window.addEventListener("focus", sync);
    return () => { cancelAnimationFrame(frame); for (const event of events) document.removeEventListener(event, sync, true); window.removeEventListener("storage", sync); window.removeEventListener("focus", sync); };
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

function nextCoreLabStep() { requestAnimationFrame(() => { document.querySelector<HTMLElement>("main .session")?.querySelector<HTMLButtonElement>(":scope > button.primary")?.click(); }); }

function baselineSpr(lab: SprLab): number {
  return Math.max(0, (lab.stack - lab.bet) / (lab.initialPot + 2 * lab.bet));
}

function hasPredictionAttempt(value: string): boolean {
  const words = value.toLocaleLowerCase().match(/[\p{L}\p{N}]+/gu) ?? [];
  return words.length >= 2 && new Set(words).size >= 2;
}

function PredictionStep({ locale, lab, prediction, setPrediction, onContinue }: { locale: LocaleCode; lab: Lab; prediction: string; setPrediction: (value: string) => void; onContinue: () => void }) {
  const predictionReady = hasPredictionAttempt(prediction);
  if (lab.type === "spr") {
    const afterCallStack = lab.stack - lab.bet;
    const afterCallPot = lab.initialPot + 2 * lab.bet;
    const start = baselineSpr(lab).toFixed(2);
    const copy = locale === "ru"
      ? {
          eyebrow: "ПЕРЕД ТРЕНАЖЁРОМ",
          title: "Сначала выбери одно изменение и предскажи SPR.",
          primerTitle: "SPR простыми словами",
          primerWhy: "SPR — это отношение оставшегося стека к банку после действия. Оно помогает быстро понять масштаб будущих решений; само число не выбирает действие за тебя.",
          primerHow: `Как считать: после колла в стеке останется ${afterCallStack}, банк станет ${afterCallPot}, поэтому SPR ≈ ${afterCallStack} ÷ ${afterCallPot} = ${start}. За столом не обязательно считать до сотых: округли две цифры и оцени их отношение.`,
          task: `Старт: банк ${lab.initialPot}, стек ${lab.stack}, ставка/колл ${lab.bet}, SPR ≈ ${start}.`,
          help: "Выбери только одно значение — банк, оставшийся стек или ставку/колл — и представь, что оно станет больше или меньше. Напиши, станет SPR выше, ниже или примерно тем же и почему.",
          missing: "Напиши короткий ответ своими словами. Одного повторяющегося слова недостаточно; правильность здесь не оценивается автоматически — сверишь прогноз на следующем шаге.",
          placeholder: "Если увеличить банк до ставки, SPR станет ниже, потому что …",
          button: "Перейти к проверке",
        }
      : {
          eyebrow: "BEFORE THE LAB",
          title: "Choose one change and predict the SPR first.",
          primerTitle: "SPR in plain language",
          primerWhy: "SPR is the remaining stack divided by the pot after the action. It helps you quickly gauge the scale of the decisions ahead; the number does not choose a poker action for you.",
          primerHow: `How to calculate it: after the call the stack is ${afterCallStack}, the pot is ${afterCallPot}, so SPR ≈ ${afterCallStack} ÷ ${afterCallPot} = ${start}. At the table you do not need hundredths: round the two numbers and estimate the ratio.`,
          task: `Start: pot ${lab.initialPot}, stack ${lab.stack}, bet/call ${lab.bet}, SPR ≈ ${start}.`,
          help: "Choose only one value — pot, remaining stack, or bet/call — and imagine making it larger or smaller. State whether SPR will rise, fall, or stay about the same, and why.",
          missing: "Write a short answer in your own words. Repeating one word is not enough; correctness is not auto-graded here — you will compare the prediction on the next step.",
          placeholder: "If I increase the pot before the bet, SPR will fall because …",
          button: "Continue to the check",
        };
    return <><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><div className="answer-panel" data-spr-primer><b>{copy.primerTitle}</b><p>{copy.primerWhy}</p><p>{copy.primerHow}</p></div><p className="support"><strong>{locale === "ru" ? "Исходные данные:" : "Starting values:"}</strong> {copy.task}</p><p className="support">{copy.help}</p><textarea className="large-input" aria-label={copy.title} value={prediction} onChange={(event) => setPrediction(event.target.value)} placeholder={copy.placeholder} />{!predictionReady && <p className="support">{copy.missing}</p>}<button className="primary" disabled={!predictionReady} onClick={onContinue}>{copy.button} <span>→</span></button></>;
  }

  const copy = locale === "ru"
    ? {
        eyebrow: "ПЕРЕД ТРЕНАЖЁРОМ",
        title: `Сначала сравни «${lab.leftTitle}» и «${lab.rightTitle}».`,
        help: "До открытия подсказок напиши, чем, по-твоему, отличаются эти два варианта. Назови один конкретный фактор и объясни, как он меняет решение или вывод.",
        missing: "Напиши короткий ответ своими словами. Одного повторяющегося слова недостаточно; правильность здесь не оценивается автоматически — сверишь ответ на следующем шаге.",
        placeholder: "Главное отличие — …; поэтому решение меняется так: …",
        button: "Перейти к проверке",
      }
    : {
        eyebrow: "BEFORE THE LAB",
        title: `Compare “${lab.leftTitle}” and “${lab.rightTitle}” first.`,
        help: "Before opening the hints, write how you think these two versions differ. Name one concrete factor and explain how it changes the decision or conclusion.",
        missing: "Write a short answer in your own words. Repeating one word is not enough; correctness is not auto-graded here — you will compare the answer on the next step.",
        placeholder: "The key difference is …; therefore the decision changes because …",
        button: "Continue to the check",
      };
  return <><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><p className="support"><strong>{locale === "ru" ? "Что сравниваем:" : "What you are comparing:"}</strong> {lab.description}</p><p className="support">{copy.help}</p><textarea className="large-input" aria-label={copy.title} value={prediction} onChange={(event) => setPrediction(event.target.value)} placeholder={copy.placeholder} />{!predictionReady && <p className="support">{copy.missing}</p>}<button className="primary" disabled={!predictionReady} onClick={onContinue}>{copy.button} <span>→</span></button></>;
}

function canonicalNumericInput(raw: string): string {
  if (raw === "" || raw === "-") return raw;
  const negative = raw.startsWith("-");
  const body = negative ? raw.slice(1) : raw;
  const [integerRaw, ...decimalParts] = body.split(".");
  const integer = integerRaw.replace(/^0+(?=\d)/, "") || "0";
  const decimal = decimalParts.length > 0 ? `.${decimalParts.join("")}` : "";
  return `${negative ? "-" : ""}${integer}${decimal}`;
}

function SprInteraction({ locale, moduleId, lab, prediction, onComplete }: { locale: LocaleCode; moduleId: ModuleId; lab: SprLab; prediction: string; onComplete: () => void }) {
  const module = moduleById[moduleId];
  const [pot, setPot] = useState(String(lab.initialPot)); const [stack, setStack] = useState(String(lab.stack)); const [bet, setBet] = useState(String(lab.bet));
  const numbers = useMemo(() => [pot, stack, bet].map((value) => value.trim() === "" ? Number.NaN : Number(value)), [pot, stack, bet]);
  const [potValue, stackValue, betValue] = numbers;
  const finite = numbers.every((value) => Number.isFinite(value) && value >= 0);
  const potChanged = !Number.isFinite(potValue) || potValue !== lab.initialPot;
  const stackChanged = !Number.isFinite(stackValue) || stackValue !== lab.stack;
  const betChanged = !Number.isFinite(betValue) || betValue !== lab.bet;
  const changedCount = [potChanged, stackChanged, betChanged].filter(Boolean).length;
  let error = "";
  if (!finite) error = locale === "ru" ? "Введи конечные неотрицательные числа." : "Enter finite non-negative numbers."; else if (betValue > stackValue) error = locale === "ru" ? "Ставка/колл не может быть больше оставшегося стека." : "Bet/call cannot exceed the remaining stack."; else if (potValue + 2 * betValue <= 0) error = locale === "ru" ? "После действия размер банка должен быть больше нуля." : "The post-action pot must be greater than zero.";
  const spr = error ? null : Math.max(0, (stackValue - betValue) / (potValue + 2 * betValue));
  const start = baselineSpr(lab).toFixed(2);
  const copy = locale === "ru"
    ? {
        eyebrow: "ПРОВЕРЬ ПРОГНОЗ",
        title: "Теперь измени ровно одно значение.",
        starting: `Стартовые значения: банк ${lab.initialPot} · стек ${lab.stack} · ставка/колл ${lab.bet}.`,
        help: `Стартовый SPR ≈ ${start}. Измени только банк, оставшийся стек или ставку/колл, а два других значения оставь стартовыми. Так будет понятно, что именно изменило SPR.`,
        prediction: "Твой прогноз",
        pot: "Банк до ставки",
        stack: "Оставшийся стек",
        bet: "Ставка / колл",
        changed: "изменено",
        unchanged: "Пока ничего не изменилось. Выбери одно из трёх значений и измени его.",
        tooMany: "Оставь изменённым только один показатель или сбрось все значения к стартовым.",
        changedNow: "Сейчас изменены",
        reset: "Сбросить к стартовым значениям",
        result: "Сравнение",
        boundary: "Граница",
        finish: "Готово — продолжить",
      }
    : {
        eyebrow: "TEST THE PREDICTION",
        title: "Now change exactly one value.",
        starting: `Starting values: pot ${lab.initialPot} · stack ${lab.stack} · bet/call ${lab.bet}.`,
        help: `Starting SPR ≈ ${start}. Change only the pot, remaining stack, or bet/call and leave the other two at their starting values. That makes the cause of the SPR change clear.`,
        prediction: "Your prediction",
        pot: "Pot before bet",
        stack: "Remaining stack",
        bet: "Bet / call",
        changed: "changed",
        unchanged: "Nothing has changed yet. Pick one of the three values and change it.",
        tooMany: "Leave exactly one value changed or reset everything to the starting values.",
        changedNow: "Currently changed",
        reset: "Reset to starting values",
        result: "Comparison",
        boundary: "Boundary",
        finish: "Done — continue",
      };
  const changedLabels = [potChanged ? copy.pot : null, stackChanged ? copy.stack : null, betChanged ? copy.bet : null].filter((value): value is string => Boolean(value));
  const validChange = !error && changedCount === 1;
  const reset = () => { setPot(String(lab.initialPot)); setStack(String(lab.stack)); setBet(String(lab.bet)); };
  return <><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><div className="answer-panel"><b>{copy.prediction}</b><p>{prediction}</p></div><p className="support"><strong>{copy.starting}</strong></p><p className="support">{copy.help}</p><div className="spr-lab"><label data-changed={potChanged ? "true" : "false"}>{copy.pot}{potChanged && <small aria-hidden="true"> · {copy.changed}</small>}<input aria-label={copy.pot} type="number" inputMode="decimal" min="0" value={pot} onChange={(event) => setPot(canonicalNumericInput(event.target.value))} /></label><label data-changed={stackChanged ? "true" : "false"}>{copy.stack}{stackChanged && <small aria-hidden="true"> · {copy.changed}</small>}<input aria-label={copy.stack} type="number" inputMode="decimal" min="0" value={stack} onChange={(event) => setStack(canonicalNumericInput(event.target.value))} /></label><label data-changed={betChanged ? "true" : "false"}>{copy.bet}{betChanged && <small aria-hidden="true"> · {copy.changed}</small>}<input aria-label={copy.bet} type="number" inputMode="decimal" min="0" value={bet} onChange={(event) => setBet(canonicalNumericInput(event.target.value))} /></label><div className="spr-result" aria-live="polite"><span>SPR</span><b>{spr === null ? "—" : spr.toFixed(2)}</b>{spr !== null && <small>({stackValue}−{betValue}) / ({potValue}+2×{betValue})</small>}</div></div>{error ? <p className="assumption-strip" role="alert">{error}</p> : changedCount === 0 ? <p className="assumption-strip">{copy.unchanged}</p> : changedCount > 1 ? <p className="assumption-strip">{copy.changedNow}: {changedLabels.join(", ")}. {copy.tooMany}</p> : <p className="support"><strong>{copy.result}:</strong> SPR {start} → {spr?.toFixed(2)}</p>}{changedCount > 0 && <button className="secondary" type="button" onClick={reset}>{copy.reset}</button>}{validChange && <><p className="support">{lab.description}</p><div className="counterexample"><b>{copy.boundary}</b><p>{module.counterexample}</p></div></>}<button className="primary" disabled={!validChange} onClick={onComplete}>{copy.finish} <span>→</span></button></>;
}

function CompareInteraction({ locale, moduleId, lab, prediction, onComplete }: { locale: LocaleCode; moduleId: ModuleId; lab: CompareLab; prediction: string; onComplete: () => void }) {
  const module = moduleById[moduleId]; const [active, setActive] = useState<"left" | "right" | null>(null); const [seen, setSeen] = useState<Array<"left" | "right">>([]);
  const visit = (side: "left" | "right") => { setActive(side); setSeen((previous) => previous.includes(side) ? previous : [...previous, side]); }; const complete = seen.length === 2;
  const copy = locale === "ru"
    ? { eyebrow: "ПРОВЕРЬ ПРОГНОЗ", title: "Теперь открой оба варианта и сравни.", help: `Открой сначала «${lab.leftTitle}», затем «${lab.rightTitle}». Сверь обе подсказки со своим прогнозом. Когда сможешь своими словами назвать главное отличие и объяснить, почему оно важно, продолжай.`, prediction: "Твой прогноз", boundary: "Граница", finish: "Готово — продолжить" }
    : { eyebrow: "TEST THE PREDICTION", title: "Now open both versions and compare them.", help: `Open “${lab.leftTitle}” and then “${lab.rightTitle}”. Compare both hints with your prediction. Continue when you can state the key difference in your own words and explain why it matters.`, prediction: "Your prediction", boundary: "Boundary", finish: "Done — continue" };
  return <><p className="eyebrow">{copy.eyebrow}</p><h2>{copy.title}</h2><div className="answer-panel"><b>{copy.prediction}</b><p>{prediction}</p></div><p className="support">{copy.help}</p><div className="button-row" role="group" aria-label={copy.title}><button aria-pressed={active === "left"} onClick={() => visit("left")}>{lab.leftTitle}</button><button aria-pressed={active === "right"} onClick={() => visit("right")}>{lab.rightTitle}</button></div>{active && <div className="answer-panel" aria-live="polite"><b>{active === "left" ? lab.leftTitle : lab.rightTitle}</b><p>{active === "left" ? lab.leftText : lab.rightText}</p></div>}{complete && <div className="counterexample"><b>{copy.boundary}</b><p>{module.counterexample}</p></div>}<button className="primary" disabled={!complete} onClick={onComplete}>{copy.finish} <span>→</span></button></>;
}

function Wave5LabGate({ locale, moduleId }: { locale: LocaleCode; moduleId: ModuleId }) {
  const module = moduleById[moduleId]; const [prediction, setPrediction] = useState(""); const [phase, setPhase] = useState<"prediction" | "interact">("prediction");
  return <section className="wave5-lab-gate" data-wave5-lab-module={moduleId}>{phase === "prediction" ? <PredictionStep locale={locale} lab={module.lab} prediction={prediction} setPrediction={setPrediction} onContinue={() => setPhase("interact")} /> : module.lab.type === "spr" ? <SprInteraction locale={locale} moduleId={moduleId} lab={module.lab} prediction={prediction} onComplete={nextCoreLabStep} /> : <CompareInteraction locale={locale} moduleId={moduleId} lab={module.lab} prediction={prediction} onComplete={nextCoreLabStep} />}</section>;
}

function Wave5LabPortal({ locale, moduleId, revision }: { locale: LocaleCode; moduleId: ModuleId; revision: number }) {
  const host = useLiveHost("main .session", true, `${moduleId}:${revision}`);
  useLayoutEffect(() => { if (!host) return; host.classList.add("wave5-lab-active"); return () => host.classList.remove("wave5-lab-active"); }, [host]);
  return host ? createPortal(<Wave5LabGate key={moduleId} locale={locale} moduleId={moduleId} />, host) : null;
}

export default function Wave5PracticeLayer() {
  const snapshot = usePracticeSnapshot();
  return <><style>{`
    .decision-card[data-wave5-mixed="true"] > .eyebrow { font-size: 0 !important; }
    html[lang="ru"] .decision-card[data-wave5-mixed="true"] > .eyebrow::after { content: "СМЕШАННАЯ ЗАДАЧА"; font-size: .75rem; }
    html[lang="en"] .decision-card[data-wave5-mixed="true"] > .eyebrow::after { content: "MIXED DECISION"; font-size: .75rem; }
    main .session.wave5-lab-active > :not(.session-head):not(.wave5-lab-gate) { display: none !important; }
    .wave5-lab-gate { display: block; }
    .wave5-lab-gate > .assumption-strip { display: block !important; }
    .spr-lab label[data-changed="true"] input { outline: 2px solid currentColor; outline-offset: 2px; }
  `}</style>{snapshot.labActive && snapshot.moduleId && <Wave5LabPortal locale={snapshot.locale} moduleId={snapshot.moduleId} revision={snapshot.revision} />}</>;
}
