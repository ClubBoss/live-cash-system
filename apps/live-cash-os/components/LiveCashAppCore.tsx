"use client";

import { useEffect, useMemo, useState } from "react";
import { diagnosticT1 } from "../content/diagnostic";
import { diagnosticEnglish, moduleHeadings, runtimeCopy, classMessage } from "../content/i18n/runtime";
import { applyLocaleData } from "../content/i18n/locale-pipeline";
import {
  cardKindLabel,
  cardModeLabel,
  decisionReviewLabel,
  diagnosticStatusLabel,
  drillKindLabel,
  fieldFactLabels,
  fieldStatusLabel,
  labLabels,
  recallLabel,
  responseClassShortLabel,
  reviewKindLabel,
  sessionModeLabel,
} from "../content/i18n/learner-ui";
import { allCards, drillById, moduleById, modules } from "../content/modules";
import type { Drill, ModuleContent, Option } from "../content/types";
import {
  isTableBurst,
  selectRetentionDrillId,
  selectTableBurstDrillIds,
  shouldFadeDecisionContext,
} from "../lib/automaticity";
import { deriveDiagnosticPriorityModules, parseDiagnosticScore } from "../lib/diagnostic-import";
import { selectLessonDrillIds } from "../lib/retrieval-integrity";
import { getRuntimeRepairRule } from "../lib/runtime-repair-registry";
import { HARD_PREREQUISITES, planDailyTraining, type DailyBudget, type DailyPlan, type PlanItem } from "../lib/scheduler";
import {
  deriveDiagnosticContinuation,
  deriveLessonSkillTruth,
  deriveLessonStep,
  deriveSessionSaveState,
  type LessonSkillState,
  type SessionSaveState,
} from "../lib/session-clarity";
import {
  clearSessionOrigin,
  persistSessionOrigin,
  restoreSessionOrigin,
  type SessionOrigin,
} from "../lib/ui-session-storage";
import {
  APP_VERSION,
  DIMENSION_KEYS,
  classifyResponse,
  completeBlock,
  completeLesson,
  dueReviewItems,
  gradeCard,
  moduleAvailable,
  recordDecision,
  recordDiagnosticResponse,
  saveActiveSession,
  startDiagnosticRun,
  type ActiveSession,
  type LearnerState,
  type LearningMode,
  type LocaleCode,
  type ModuleId,
  type ResponseClass,
  type TransferProbe,
} from "../lib/model";
import { useReliableLearnerState, type RecoveryCode, type SyncStatus } from "../lib/use-learner-state-sync";
import { applyReviewedDiagnostic, isGenuineExplainBackAttempt, pendingHumanReviewCount, saveExplainBack } from "../lib/wave7";
import DataSafetyPanel from "./DataSafetyPanel";
import DiagnosticExperience from "./DiagnosticExperience";
import ExplainBackSelfCheck from "./ExplainBackSelfCheck";
import LearningRoute from "./LearningRoute";
import { Wave7ExplainBackHistory, Wave7FieldPanel, Wave7ProgressDetails } from "./Wave7Experience";

const LOCALE_KEY = "live-cash-os:locale";
const T1_IDS = diagnosticT1.map((item) => item.id);
const PRIMARY_TABS = ["today", "learn", "review", "cards", "map", "field", "diagnostic"] as const;
const SCHEDULER_CATALOG = {
  modules: modules.map((module) => ({
    id: module.id,
    prerequisites: module.prerequisites,
    drills: module.drills.map((drill) => ({
      id: drill.id,
      moduleId: drill.moduleId,
      nodeKey: drill.nodeKey,
      variantGroup: drill.variantGroup,
      kind: drill.kind,
      targetSeconds: drill.targetSeconds,
    })),
  })),
  cards: allCards.map((card) => ({ id: card.id, moduleId: card.moduleId })),
};

type Tab = (typeof PRIMARY_TABS)[number] | "debug";

function mutate(state: LearnerState, change: (next: LearnerState) => void): LearnerState {
  const next = structuredClone(state);
  change(next);
  next.revision += 1;
  next.updatedAt = new Date().toISOString();
  next.appVersion = APP_VERSION;
  return next;
}

function patchSession(state: LearnerState, patch: Partial<ActiveSession>): LearnerState {
  const current = state.activeSession;
  if (!current) return state;
  return mutate(state, (next) => { next.activeSession = { ...current, ...patch }; });
}

function startSession(state: LearnerState, mode: LearningMode, moduleId: ModuleId, drillIds: string[], step = 0, sourceReviewId?: string): LearnerState {
  const now = new Date().toISOString();
  return saveActiveSession(state, {
    mode,
    moduleId,
    step,
    drillIds,
    currentIndex: 0,
    selectedActionId: null,
    selectedReasonId: null,
    confidence: 65,
    startedAt: now,
    itemStartedAt: now,
    explainBack: "",
    sourceReviewId,
  });
}

function seeded(value: string): number {
  let hash = 2166136261;
  for (const character of value) hash = Math.imul(hash ^ character.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function shuffle<T>(items: T[], seedValue: string): T[] {
  const result = [...items];
  let state = seeded(seedValue) || 1;
  for (let index = result.length - 1; index > 0; index -= 1) {
    state = (state * 1664525 + 1013904223) >>> 0;
    const target = state % (index + 1);
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function localizedModule(module: ModuleContent, locale: LocaleCode) {
  if (locale === "ru") return module;
  const heading = moduleHeadings[module.id].en;
  return { ...module, ...heading };
}

const skillStateCopy: Record<LocaleCode, Record<LessonSkillState, string>> = {
  ru: {
    UNEXPOSED: "не начато",
    INTRODUCED: "только знакомство",
    FRAGILE: "нужно закрепить",
    WORKING: "получается",
    RETAINED: "вспоминается после паузы",
    FIELD_TEST_PENDING: "нужны разобранные реальные руки",
    FIELD_VALIDATED: "подтверждено в разобранных руках",
    REPAIR_REQUIRED: "нуждается в работе",
  },
  en: {
    UNEXPOSED: "not started",
    INTRODUCED: "introduced",
    FRAGILE: "needs reinforcement",
    WORKING: "working in practice",
    RETAINED: "recalled after a delay",
    FIELD_TEST_PENDING: "needs reviewed real hands",
    FIELD_VALIDATED: "supported by reviewed real hands",
    REPAIR_REQUIRED: "needs repair",
  },
};

const sessionSaveCopy: Record<LocaleCode, Record<SessionSaveState, string>> = {
  ru: {
    saving: "Сохраняем…",
    saved: "Сохранено",
    saved_local: "Сохранено на устройстве",
    saved_syncing: "Сохранено · синхронизация…",
    offline_saved_local: "Нет сети · сохранено локально",
    sync_needed: "Нужна синхронизация",
    attention: "Сохранение требует внимания",
    failed: "Сохранение не удалось",
  },
  en: {
    saving: "Saving…",
    saved: "Saved",
    saved_local: "Saved on device",
    saved_syncing: "Saved · syncing…",
    offline_saved_local: "Offline · saved locally",
    sync_needed: "Sync needed",
    attention: "Save needs attention",
    failed: "Save failed",
  },
};

function moduleStateLabel(locale: LocaleCode, value: LessonSkillState): string {
  return skillStateCopy[locale][value];
}

function lessonSkillCopy(locale: LocaleCode, contentCompleted: boolean, state: LessonSkillState) {
  const truth = deriveLessonSkillTruth(contentCompleted, state);
  return {
    lesson: locale === "ru"
      ? `Урок: ${truth.contentCompleted ? "пройден" : "не пройден"}`
      : `Lesson: ${truth.contentCompleted ? "completed" : "not completed"}`,
    skill: locale === "ru"
      ? `Навык: ${skillStateCopy[locale][truth.skillState]}`
      : `Skill: ${skillStateCopy[locale][truth.skillState]}`,
    explanation: truth.explainRepair
      ? locale === "ru"
        ? "Урок завершён. В самостоятельной проверке была ошибка, поэтому отдельное задание добавлено в Повтор."
        : "Lesson completed. A self-check found a mistake, so a separate repair task was added to Review."
      : null,
  };
}

function lessonStepLabel(locale: LocaleCode, lcm: string, zeroBasedStep: number): string {
  const { step, total } = deriveLessonStep(zeroBasedStep);
  return locale === "ru"
    ? `${lcm} · Урок · шаг ${step} из ${total}`
    : `${lcm} · Lesson · step ${step} of ${total}`;
}

function sessionSaveLabel(
  locale: LocaleCode,
  status: SyncStatus,
  recoveryCode: RecoveryCode,
  stateUpdatedAt: string,
  lastLocalSaveAt: string | null,
) {
  const saveState = deriveSessionSaveState(status, recoveryCode, stateUpdatedAt, lastLocalSaveAt);
  return { saveState, label: sessionSaveCopy[locale][saveState] };
}

function diagnosticContinuationCopy(locale: LocaleCode, status: string, savedResponses: number) {
  const continuation = deriveDiagnosticContinuation(status, savedResponses);
  if (!continuation) return null;
  return locale === "ru"
    ? {
        title: `Диагностика · ${continuation.savedResponses}/10 сохранено`,
        body: `Сохранённые ответы не потеряны. Продолжишь с ${continuation.nextQuestion}-го вопроса.`,
        action: "Продолжить",
      }
    : {
        title: `Diagnostic · ${continuation.savedResponses}/10 saved`,
        body: `Your saved answers are still here. Continue with question ${continuation.nextQuestion}.`,
        action: "Continue",
      };
}

function dimensionLabel(locale: LocaleCode, value: string): string {
  const labels: Record<LocaleCode, Record<string, string>> = {
    ru: {
      node_recognition: "распознавание ситуации",
      mechanism_explanation: "объяснение решения",
      action_selection: "выбор действия",
      boundary_control: "исключения",
      speed: "скорость",
      confidence_calibration: "точность уверенности",
      variant_transfer: "новые условия",
      retention: "воспоминание после паузы",
      field_transfer: "реальная игра",
    },
    en: {
      node_recognition: "spot recognition",
      mechanism_explanation: "decision reasoning",
      action_selection: "action choice",
      boundary_control: "exceptions",
      speed: "speed",
      confidence_calibration: "confidence accuracy",
      variant_transfer: "changed spots",
      retention: "later recall",
      field_transfer: "real play",
    },
  };
  return labels[locale][value] ?? value;
}

function dailyPlanItemCopy(locale: LocaleCode, item: PlanItem): { title: string; reason: string } {
  const copy: Record<LocaleCode, Record<PlanItem["reasonCode"], { title: string; reason: string }>> = {
    ru: {
      resume: { title: "Продолжить сохранённую сессию", reason: "Вернёмся ровно к месту остановки." },
      overdue_retention: { title: "Проверить навык после паузы", reason: "Пришло время вспомнить решение без свежей подсказки." },
      repair: { title: "Исправить конкретную ошибку", reason: "Сначала разберём промах из последнего решения, затем вернём его позже." },
      diagnostic_priority: { title: "Подтянуть приоритетную тему", reason: "Диагностика подняла эту тему в очереди, но не засчитала навык за тебя." },
      weak: { title: "Закрепить слабое место", reason: "В последних решениях здесь чаще возникали ошибки." },
      stale: { title: "Освежить давно не проверенный навык", reason: "Эту тему давно не приходилось вспоминать самостоятельно." },
      changed: { title: "Решить изменённую ситуацию", reason: "Проверим тот же механизм при других важных условиях." },
      boundary: { title: "Проверить границу правила", reason: "Короткий контраст помогает не превращать правило в автопилот." },
      mixed: { title: "Смешанная практика", reason: "Темы перемешаны, чтобы решение начиналось с распознавания ситуации." },
      new: { title: "Изучить один новый механизм", reason: "Сегодня добавляем не больше одной новой идеи." },
      warmup: { title: "Быстрая разминка перед игрой", reason: "Одно знакомое решение из недавней ошибки и до двух изученных карточек. Новых тем нет." },
      done: { title: "На сейчас достаточно", reason: "Срочных повторений нет; можно вернуться позже или выбрать практику вручную." },
    },
    en: {
      resume: { title: "Resume the saved session", reason: "Continue from the exact point where you stopped." },
      overdue_retention: { title: "Test the skill after a delay", reason: "It is time to recall the decision without the fresh explanation." },
      repair: { title: "Fix the exact mistake", reason: "Start with the miss from your last decision, then bring it back later." },
      diagnostic_priority: { title: "Work on a priority topic", reason: "The reviewed Diagnostic moved this topic up the queue; it did not award learning credit." },
      weak: { title: "Reinforce a weak spot", reason: "Recent decisions show more misses here." },
      stale: { title: "Refresh a stale skill", reason: "You have not recalled this topic independently for a while." },
      changed: { title: "Solve a changed spot", reason: "Use the same mechanism after an important condition changes." },
      boundary: { title: "Test the edge of the rule", reason: "A short contrast helps prevent autopilot." },
      mixed: { title: "Mixed practice", reason: "Topics are mixed so the first job is recognising the spot." },
      new: { title: "Learn one new mechanism", reason: "Add no more than one new idea today." },
      warmup: { title: "Quick pre-session warm-up", reason: "One familiar decision from a recent miss plus up to two studied cards. No new topics." },
      done: { title: "Enough for now", reason: "Nothing urgent is due; return later or choose practice manually." },
    },
  };
  return copy[locale][item.reasonCode];
}

function dailyBudgetLabel(locale: LocaleCode, budget: DailyBudget): string {
  const labels: Record<LocaleCode, Record<DailyBudget, string>> = {
    ru: { "5": "5 мин", "15": "15 мин", "30": "30 мин", warmup: "Перед игрой", post: "После игры" },
    en: { "5": "5 min", "15": "15 min", "30": "30 min", warmup: "Before play", post: "After play" },
  };
  return labels[locale][budget];
}

function diagnosticLabel(locale: LocaleCode): string {
  return locale === "ru" ? "Диагностика" : "Diagnostic";
}

function confidenceHelp(locale: LocaleCode): string {
  return locale === "ru"
    ? "Это грубая самооценка, а не точная вероятность. Отметь примерно, насколько уверен до ответа."
    : "This is a rough self-rating, not an exact probability. Mark approximately how sure you are before answering.";
}

function nextRequiredModule(state: LearnerState, moduleId: ModuleId): ModuleId | null {
  for (const required of HARD_PREREQUISITES[moduleId]) {
    if (state.modules[required].contentCompleted) continue;
    return nextRequiredModule(state, required) ?? required;
  }
  return null;
}

function prerequisiteCopy(locale: LocaleCode, moduleId: ModuleId): string {
  const prerequisite = localizedModule(moduleById[moduleId], locale);
  return locale === "ru"
    ? `Сначала ${prerequisite.lcm} · ${prerequisite.shortTitle}: эта тема опирается на решения и термины из неё.`
    : `First complete ${prerequisite.lcm} · ${prerequisite.shortTitle}: this topic builds on its decisions and terminology.`;
}

function reliabilityNotice(locale: LocaleCode, code: RecoveryCode, syncStatus: string): string {
  const ru = locale === "ru";
  if (code === "STATE_CONFLICT") return ru
    ? "Обнаружены две разные версии прогресса. Ни одна не удалена. Открой «Данные» и выбери версию."
    : "Two different progress versions were found. Neither was deleted. Open Data and choose the version.";
  if (code === "FUTURE_STATE_UNSUPPORTED" || code === "UPDATE_REQUIRED") return ru
    ? "Версии приложения и сохранённых данных не совпадают. Обнови страницу перед продолжением; текущая копия не будет перезаписана вслепую."
    : "The app and saved-data versions do not match. Refresh before continuing; the current copy will not be overwritten blindly.";
  if (code === "LOCAL_STATE_CORRUPT" || code === "LOCAL_STATE_RECOVERED") return ru
    ? "Локальная копия потребовала восстановления. Исходный файл сохранён в разделе «Данные»."
    : "The local copy required recovery. The original snapshot is preserved in Data.";
  if (code === "CLOUD_STATE_UNREADABLE") return ru
    ? "Облачную копию нельзя безопасно прочитать. Локальный прогресс сохранён; облако не будет перезаписано автоматически."
    : "The cloud copy cannot be read safely. Local progress is preserved and the cloud copy will not be overwritten automatically.";
  if (code === "LOCAL_WRITE_FAILED") return ru
    ? "Не удалось записать прогресс в хранилище браузера. Не закрывай вкладку до экспорта копии в разделе «Данные»."
    : "Browser storage could not save progress. Keep this tab open until you export a copy from Data.";
  if (code === "STATE_TOO_LARGE") return ru
    ? "Копия прогресса стала слишком большой для облачной синхронизации. Локальная копия сохранена; экспортируй её в разделе «Данные»."
    : "The progress snapshot is too large for cloud sync. The local copy is preserved; export it from Data.";
  if (!code && syncStatus === "offline") return ru
    ? "Нет сети. Прогресс сохраняется на этом устройстве; синхронизация повторится после подключения."
    : "You are offline. Progress is saved on this device and sync will retry after reconnecting.";
  if (!code && syncStatus === "error") return ru
    ? "Облачное сохранение сейчас недоступно. Локальная копия остаётся на устройстве; детали и повтор — в разделе «Данные»."
    : "Cloud saving is currently unavailable. The local copy remains on this device; open Data for details and retry.";
  return "";
}

function downloadJson(filename: string, value: unknown) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(value, null, 2)], { type: "application/json" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function transferProbeFor(drill: Drill): TransferProbe | null {
  if (drill.transferProbe) return drill.transferProbe;
  if (drill.kind === "changed") {
    return { isTransferProbe: true, variantDistance: "NEAR", changedVariables: [drill.variantGroup] };
  }
  if (drill.kind === "boundary") {
    return { isTransferProbe: true, variantDistance: "MEDIUM", changedVariables: ["boundary_condition", drill.variantGroup] };
  }
  return null;
}

export function selectRepair(state: LearnerState, moduleId: ModuleId, sourceReviewId?: string): { drills: Drill[]; sourceReviewId?: string } {
  const module = moduleById[moduleId];
  const dueRepairs = dueReviewItems(state).filter((item) => item.moduleId === moduleId && item.kind === "repair");
  const target = sourceReviewId ? dueRepairs.find((item) => item.id === sourceReviewId) : dueRepairs[0];
  if (sourceReviewId && !target) return { drills: [] };
  const candidateRules = target
    ? [target.sourceActionOptionId, target.sourceReasonOptionId]
      .filter((optionId): optionId is string => Boolean(optionId))
      .map((optionId) => getRuntimeRepairRule(target.sourceDrillId, optionId))
      .filter((rule): rule is NonNullable<typeof rule> => Boolean(rule))
    : [];
  const eligible = module.drills.filter((drill) => drill.id !== target?.sourceDrillId);
  const preferredNode = candidateRules.flatMap((rule) => rule.preferredNodeKey ? eligible.filter((drill) => drill.nodeKey === rule.preferredNodeKey) : []);
  const preferredFamily = candidateRules.flatMap((rule) => rule.preferredVariantGroup ? eligible.filter((drill) => drill.variantGroup === rule.preferredVariantGroup) : []);
  const preferredKind = candidateRules.flatMap((rule) => rule.preferredKind ? eligible.filter((drill) => drill.kind === rule.preferredKind) : []);
  const family = target ? eligible.filter((drill) => drill.variantGroup === target.variantGroup) : [];
  const boundary = eligible.filter((drill) => drill.kind === "boundary");
  const changed = eligible.filter((drill) => drill.kind === "changed");
  const drills = [...preferredNode, ...preferredFamily, ...preferredKind, ...family, ...boundary, ...changed, ...eligible]
    .filter((drill, index, list) => list.findIndex((candidate) => candidate.id === drill.id) === index)
    .slice(0, 1);
  return { drills: drills.length ? drills : module.drills.slice(0, 1), sourceReviewId: target?.id };
}

export function selectReview(state: LearnerState, sourceReviewId?: string): { drills: Drill[]; sourceReviewId?: string } {
  const dueRetention = dueReviewItems(state).filter((item) => item.kind === "retention");
  const target = sourceReviewId ? dueRetention.find((item) => item.id === sourceReviewId) : dueRetention[0];
  if (!target) return { drills: [] };
  const drillId = selectRetentionDrillId(target, SCHEDULER_CATALOG, `${state.revision}:${target.id}`);
  const drill = drillId ? drillById[drillId] : undefined;
  return { drills: drill ? [drill] : [], sourceReviewId: target.id };
}

function selectMixed(state: LearnerState): Drill[] {
  const eligible = modules.filter((module) => state.modules[module.id].contentCompleted);
  const source = eligible.length ? eligible : [moduleById.geometry];
  return source.slice(-5).map((module, index) => module.drills[(state.revision + index) % module.drills.length]);
}

export default function LiveCashAppV11() {
  const [locale, setLocale] = useState<LocaleCode>("ru");
  const [tab, setTab] = useState<Tab>("today");
  const [notice, setNotice] = useState("");
  const [dailyBudget, setDailyBudget] = useState<DailyBudget>("15");
  const [sessionReturnTab, setSessionReturnTab] = useState<SessionOrigin | null>(null);
  const dataSafety = useReliableLearnerState();
  const { state, setState, ready, syncStatus, recoveryCode, lastLocalSaveAt } = dataSafety;
  const t = runtimeCopy[locale];

  useEffect(() => {
    const storedLocale = localStorage.getItem(LOCALE_KEY);
    const nextLocale: LocaleCode = storedLocale === "en" ? "en" : "ru";
    applyLocaleData(nextLocale);
    setLocale(nextLocale);
    document.documentElement.lang = nextLocale;

    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).then((registration) => {
        const notifyUpdate = () => setNotice(nextLocale === "ru"
          ? "Доступно обновление приложения. Обнови страницу перед продолжением работы с облаком."
          : "An app update is available. Refresh before continuing cloud work.");
        if (registration.waiting) notifyUpdate();
        registration.addEventListener("updatefound", () => {
          const worker = registration.installing;
          worker?.addEventListener("statechange", () => {
            if (worker.state === "installed" && navigator.serviceWorker.controller) notifyUpdate();
          });
        });
      }).catch(() => undefined);
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(LOCALE_KEY, locale);
    document.documentElement.lang = locale;
  }, [locale, ready]);

  useEffect(() => {
    if (!ready) return;
    const message = reliabilityNotice(locale, recoveryCode, syncStatus);
    if (message) setNotice(message);
  }, [locale, ready, recoveryCode, syncStatus]);

  const hasActiveSession = Boolean(state.activeSession);
  useEffect(() => {
    if (ready && hasActiveSession) setTab("learn");
  }, [ready, hasActiveSession]);

  useEffect(() => {
    if (!ready) return;
    setSessionReturnTab(restoreSessionOrigin(state.activeSession));
  }, [ready, state.activeSession]);

  const planningNow = Date.now();
  const plan = planDailyTraining(state, SCHEDULER_CATALOG, { budget: dailyBudget, now: planningNow, seed: `${state.revision}:${dailyBudget}` });
  const warmupPlan = planDailyTraining(state, SCHEDULER_CATALOG, { budget: "warmup", now: planningNow, seed: `${state.revision}:warmup` });
  const reviewBudget: DailyBudget = dailyBudget === "5" || dailyBudget === "30" ? dailyBudget : "15";
  const reviewPlan = planDailyTraining(state, SCHEDULER_CATALOG, { budget: reviewBudget, now: planningNow, seed: `${state.revision}:review:${reviewBudget}` });
  const warmupCardIds = warmupPlan.items.flatMap((item) => item.cardIds ?? []);
  const session = state.activeSession;

  function changeLocale(next: LocaleCode) {
    applyLocaleData(next);
    setLocale(next);
    setNotice(next === "en"
      ? "English version enabled. Your current session and progress are preserved."
      : "Русская версия включена. Текущая сессия и прогресс сохранены.");
  }

  function clearReturnOrigin() {
    clearSessionOrigin();
    setSessionReturnTab(null);
  }

  function startBoundSession(next: LearnerState, origin: SessionOrigin | null) {
    const nextSession = next.activeSession;
    if (origin && nextSession) persistSessionOrigin(origin, nextSession);
    else clearSessionOrigin();
    setSessionReturnTab(origin);
    setState(next);
    setTab("learn");
  }

  function openLesson(moduleId: ModuleId, origin: SessionOrigin | null = null) {
    if (!origin) clearReturnOrigin();
    const module = moduleById[moduleId];
    if (!moduleAvailable(state, moduleId, [...HARD_PREREQUISITES[moduleId]])) {
      clearReturnOrigin();
      const prerequisiteId = nextRequiredModule(state, moduleId);
      setNotice(prerequisiteId
        ? prerequisiteCopy(locale, prerequisiteId)
        : locale === "ru" ? "Сначала закончи обязательную базовую тему для этого модуля." : "Complete the required foundation for this module first.");
      return;
    }
    const lessonDrillIds = selectLessonDrillIds(module);
    startBoundSession(startSession(state, "lesson", moduleId, lessonDrillIds), origin);
  }

  function openPractice(moduleId: ModuleId, origin: SessionOrigin | null = null) {
    if (!origin) clearReturnOrigin();
    startBoundSession(startSession(state, "practice", moduleId, moduleById[moduleId].drills.map((drill) => drill.id)), origin);
  }

  function openRepair(moduleId: ModuleId, warmup = false, sourceReviewId?: string, origin: SessionOrigin | null = null) {
    const selection = selectRepair(state, moduleId, sourceReviewId);
    if (!selection.drills.length) return;
    const safeOrigin = warmup ? null : origin;
    if (!safeOrigin) clearReturnOrigin();
    startBoundSession(startSession(state, "repair", moduleId, selection.drills.map((drill) => drill.id), warmup ? -1 : 0, selection.sourceReviewId), safeOrigin);
  }

  function openReview(sourceReviewId?: string, origin: SessionOrigin | null = null) {
    const selection = selectReview(state, sourceReviewId);
    if (!selection.drills.length) { clearReturnOrigin(); setTab("review"); return; }
    if (!origin) clearReturnOrigin();
    startBoundSession(startSession(state, "review", selection.drills[0].moduleId, selection.drills.map((drill) => drill.id), 0, selection.sourceReviewId), origin);
  }

  function openMixed(origin: SessionOrigin | null = null) {
    if (!origin) clearReturnOrigin();
    const drills = selectMixed(state);
    startBoundSession(startSession(state, "mixed", drills[0].moduleId, drills.map((drill) => drill.id)), origin);
  }

  function openBurst() {
    clearReturnOrigin();
    const drillIds = selectTableBurstDrillIds(state, SCHEDULER_CATALOG, `${state.revision}:table-burst`);
    const first = drillIds.length ? drillById[drillIds[0]] : undefined;
    if (!first) return;
    startBoundSession(startSession(state, "mixed", first.moduleId, drillIds), null);
  }

  function runPlan(selectedPlan: DailyPlan, warmup = false) {
    const item = selectedPlan.items[0];
    if (!item || item.kind === "done") return;
    if (item.kind === "resume") { setTab("learn"); return; }
    const origin: SessionOrigin | null = warmup ? null : "today";
    if (item.kind === "review") { openReview(item.sourceReviewId, origin); return; }
    if (item.kind === "repair" && item.moduleId) { openRepair(item.moduleId, warmup, item.sourceReviewId, origin); return; }
    if (item.kind === "lesson" && item.moduleId) { openLesson(item.moduleId, origin); return; }
    if (item.kind === "cards") { clearReturnOrigin(); setTab("cards"); return; }
    if ((item.kind === "practice" || item.kind === "mixed") && item.moduleId && item.drillIds?.length) {
      startBoundSession(startSession(state, item.kind === "mixed" ? "mixed" : "practice", item.moduleId, item.drillIds), origin);
    }
  }

  function runToday() {
    runPlan(plan, dailyBudget === "warmup");
  }

  function runWarmup() {
    setDailyBudget("warmup");
    const item = warmupPlan.items[0];
    if (!item || item.kind === "done") {
      setNotice(locale === "ru"
        ? state.activeSession
          ? "Сохранённая сессия остаётся на месте. Для отдельной разминки пока нет карточек из завершённых тем."
          : "Для разминки пока нет изученного материала. Сначала закончи первый урок."
        : state.activeSession
          ? "Your saved session stays untouched. There are no cards from completed topics for a separate warm-up yet."
          : "There is no studied material for a warm-up yet. Complete the first lesson first.");
      return;
    }
    runPlan(warmupPlan, true);
  }

  function exitSession() {
    setNotice(locale === "ru" ? "Сессия сохранена. Можно продолжить с этого места." : "Session saved. You can resume from this exact point.");
    setTab("today");
  }

  function finishPracticeBlock() {
    const target = sessionReturnTab;
    clearReturnOrigin();
    if (!target) return;
    if (target === "review") {
      setNotice(locale === "ru"
        ? "Пункт завершён. Очередь Review обновлена — выбери следующий оставшийся пункт."
        : "Item complete. The Review queue is updated — choose the next remaining item.");
    }
    setTab(target);
  }

  function finishDiagnosticImport() {
    setDailyBudget("15");
    setNotice(locale === "ru"
      ? "Диагностика завершена. Today перестроен по приоритетам; этот baseline сам по себе не подтверждает освоение навыка, запоминание после паузы или применение за столом."
      : "Diagnostic complete. Today is reprioritised; this baseline by itself does not prove the skill, later recall, or real-table use.");
    setTab("today");
  }

  if (!ready) return <main className="loading"><p>{t.loading}</p></main>;

  return <main>
    <header className="topbar">
      <button className="brand" onClick={() => setTab("today")}>LIVE CASH OS</button>
      <div className="topmeta">
        <span>v{APP_VERSION}</span>
        <span className={`sync sync-${syncStatus}`}>{t.sync[syncStatus]}</span>
        <div className="mode-switch" aria-label={locale === "ru" ? "Язык" : "Language"}>
          <button aria-pressed={locale === "ru"} onClick={() => changeLocale("ru")}>RU</button>
          <button aria-pressed={locale === "en"} onClick={() => changeLocale("en")}>EN</button>
        </div>
        <button className="quiet" onClick={() => setTab("debug")}>{locale === "ru" ? "Данные" : "Data"}</button>
      </div>
    </header>
    <nav className="tabs" aria-label={locale === "ru" ? "Основная навигация" : "Primary navigation"}>
      {PRIMARY_TABS.map((id) =>
        <button key={id} aria-current={tab === id ? "page" : undefined} onClick={() => setTab(id)}>{id === "diagnostic" ? diagnosticLabel(locale) : t.nav[id]}</button>)}
    </nav>
    <div className="sr-live" aria-live="polite">{notice}</div>
    {notice && <div className="notice"><span>{notice}</span><button onClick={() => setNotice("")}>{t.close}</button></div>}

    {tab === "today" && <Today locale={locale} state={state} plan={plan} budget={dailyBudget} onBudget={setDailyBudget} onRun={runToday} onWarmup={runWarmup} onLearn={() => setTab("learn")} onDiagnostic={() => setTab("diagnostic")} onField={() => setTab("field")} />}
    {tab === "learn" && !session && <Learn locale={locale} state={state} onLesson={openLesson} onPractice={openPractice} onMixed={() => openMixed()} onBurst={openBurst} />}
    {tab === "learn" && session && <Session locale={locale} state={state} setState={setState} syncStatus={syncStatus} recoveryCode={recoveryCode} lastLocalSaveAt={lastLocalSaveAt} onExit={exitSession} onWarmupCards={() => setTab("cards")} onFinished={finishPracticeBlock} />}
    {tab === "review" && <Review locale={locale} state={state} plan={reviewPlan} budget={reviewBudget} onBudget={setDailyBudget} onReview={(sourceReviewId) => openReview(sourceReviewId, "review")} onRepair={(moduleId, sourceReviewId) => openRepair(moduleId, false, sourceReviewId, "review")} />}
    {tab === "cards" && <Cards locale={locale} state={state} setState={setState} warmupIds={warmupCardIds} onLearn={() => setTab("learn")} />}
    {tab === "map" && <SkillMap locale={locale} state={state} onLesson={openLesson} onPractice={openPractice} />}
    {tab === "field" && <Wave7FieldPanel locale={locale} state={state} setState={setState} lastLocalSaveAt={lastLocalSaveAt} fieldStatusLabel={fieldStatusLabel} fieldFactLabels={fieldFactLabels} />}
    {tab === "diagnostic" && <Diagnostic locale={locale} state={state} setState={setState} syncStatus={syncStatus} recoveryCode={recoveryCode} lastLocalSaveAt={lastLocalSaveAt} onExit={() => setTab("today")} onImported={finishDiagnosticImport} />}
    {tab === "debug" && <DataSafetyPanel locale={locale} controller={dataSafety} route={tab} />}
  </main>;
}

function Today({ locale, state, plan, budget, onBudget, onRun, onWarmup, onLearn, onDiagnostic, onField }: { locale: LocaleCode; state: LearnerState; plan: DailyPlan; budget: DailyBudget; onBudget: (value: DailyBudget) => void; onRun: () => void; onWarmup: () => void; onLearn: () => void; onDiagnostic: () => void; onField: () => void }) {
  const t = runtimeCopy[locale];
  const postMode = budget === "post";
  const primary = plan.items[0];
  const hasPlanAction = Boolean(!postMode && primary && primary.kind !== "done");
  const savedSessionWarmup = budget === "warmup" && Boolean(state.activeSession);
  const next = postMode
    ? locale === "ru"
      ? { title: "Сохрани 1–3 реальные руки", reason: "Сначала зафиксируй решения, затем разбери одну руку. Review и работа над ошибкой — только после этого и только если нужны." }
      : { title: "Save 1–3 real hands", reason: "Capture the decisions first, then review one hand. Normal Review and mistake practice come only afterward, if needed." }
    : savedSessionWarmup && primary?.kind === "cards"
      ? locale === "ru"
        ? { title: "Быстрая разминка перед игрой", reason: "Сохранённая сессия останется ровно на месте. Разминка использует только до двух карточек из уже завершённых тем." }
        : { title: "Quick pre-session warm-up", reason: "Your saved session stays exactly where it is. The warm-up uses only up to two cards from completed topics." }
      : primary ? dailyPlanItemCopy(locale, primary) : dailyPlanItemCopy(locale, { kind: "done", estimatedMinutes: 0, reasonCode: "done" });
  const completed = modules.filter((module) => state.modules[module.id].contentCompleted).length;
  const working = modules.filter((module) => ["WORKING", "RETAINED", "FIELD_TEST_PENDING", "FIELD_VALIDATED"].includes(state.modules[module.id].state)).length;
  const pendingHuman = pendingHumanReviewCount(state);
  const timeBudgets: DailyBudget[] = ["5", "15", "30"];
  const modes: DailyBudget[] = ["warmup", "post"];
  const freshShortFallback = completed === 0 && !state.activeSession && !hasPlanAction && !postMode && (budget === "5" || budget === "warmup");
  const diagnosticProgress = diagnosticContinuationCopy(locale, state.diagnostic.status, state.diagnostic.responses.length);
  const diagnosticEyebrow = diagnosticProgress
    ? locale === "ru" ? "ДИАГНОСТИКА · ПРОДОЛЖЕНИЕ" : "DIAGNOSTIC · CONTINUE"
    : t.personalisation;
  const returnCopy = locale === "ru"
    ? "После паузы берём ограниченный набор самых полезных повторений — весь накопившийся хвост сразу не показываем."
    : "After a break, start with a bounded set of the highest-value reviews instead of dumping the whole backlog at once.";
  const deferredCopy = locale === "ru"
    ? `Ещё ${plan.deferredDueCount} повторений останутся в очереди после этой сессии.`
    : `${plan.deferredDueCount} more review items stay queued after this session.`;
  const noActionCopy = freshShortFallback
    ? budget === "5"
      ? locale === "ru"
        ? "Новая тема не режется на случайные 5 минут: первый урок рассчитан примерно на 8 минут. Выбери 15 минут, чтобы пройти его целиком."
        : "A new topic is not cut into an arbitrary 5-minute fragment: the first lesson is about 8 minutes. Choose 15 minutes to complete it cleanly."
      : locale === "ru"
        ? "Режим «Перед игрой» использует только уже изученный материал. Сначала пройди первый урок — после этого здесь появится разминка."
        : "Before play uses only material you have already studied. Complete the first lesson first; then a warm-up will appear here."
    : budget === "warmup" && state.activeSession
      ? locale === "ru"
        ? "Сохранённая сессия останется на месте. Отдельной разминки пока нет: карточки появляются только из завершённых тем."
        : "Your saved session stays untouched. There is no separate warm-up yet: cards come only from completed topics."
      : locale === "ru"
        ? "По выбранному времени или режиму срочных задач нет. Можно открыть обучение вручную."
        : "There is nothing urgent for the selected time or mode. You can open Learn manually.";
  const ctaLabel = postMode
    ? locale === "ru" ? "Сохранить руки" : "Save hands"
    : hasPlanAction
      ? t.start
      : freshShortFallback
        ? locale === "ru" ? "Выбрать 15 минут" : "Use 15 minutes"
        : locale === "ru" ? "Открыть обучение" : "Open Learn";
  const runPrimary = () => {
    if (postMode) onField();
    else if (hasPlanAction) onRun();
    else if (freshShortFallback) onBudget("15");
    else onLearn();
  };
  const primaryEstimate = primary && primary.kind !== "done" ? primary.estimatedMinutes : 0;
  return <>
    <section className="hero compact-hero">
      <p className="eyebrow">{t.todayEyebrow}</p>
      <h1>{t.todayTitle}<br/><em>{t.todayEmphasis}</em></h1>
      <p className="lede">{t.todayDescription}</p>
      <p className="support"><b>{locale === "ru" ? "Время" : "Time"}</b> · {locale === "ru" ? "сколько минут есть на обычную сессию" : "how many minutes you have for a regular session"}</p>
      <div className="mode-switch" aria-label={locale === "ru" ? "Время занятия" : "Session time"}>{timeBudgets.map((value) => <button key={value} aria-pressed={budget === value} onClick={() => onBudget(value)}>{dailyBudgetLabel(locale, value)}</button>)}</div>
      <p className="support"><b>{locale === "ru" ? "Режим" : "Mode"}</b> · {locale === "ru" ? "особая цель вместо обычной сессии" : "a specific purpose instead of a regular session"}</p>
      <div className="mode-switch" aria-label={locale === "ru" ? "Режим занятия" : "Session mode"}>{modes.map((value) => <button key={value} aria-pressed={budget === value} onClick={() => onBudget(value)}>{dailyBudgetLabel(locale, value)}</button>)}</div>
      <div className="today-card">
        <p className="eyebrow">{postMode
          ? locale === "ru" ? "ПОСЛЕ ИГРЫ · СНАЧАЛА РУКИ" : "AFTER PLAY · HANDS FIRST"
          : primaryEstimate > 0
            ? `${t.now} · ≈${primaryEstimate} ${locale === "ru" ? "мин · следующее действие" : "min · next action"}`
            : t.now}</p>
        <h2>{next.title}</h2>
        <p>{postMode || hasPlanAction ? next.reason : noActionCopy}</p>
        {!postMode && plan.returnAfterBreak && <p className="support">{returnCopy}</p>}
        {!postMode && plan.deferredDueCount > 0 && <p className="support">{deferredCopy}</p>}
        <button className="primary" aria-label={ctaLabel} onClick={runPrimary}>{ctaLabel} <span>→</span></button>
      </div>
    </section>
    <section className="metrics">
      <div><b>{completed}/11</b><span>{t.completedLessons}</span></div>
      <div><b>{working}</b><span>{t.workingSkills}</span></div>
      <div><b>{dueReviewItems(state).length}</b><span>{locale === "ru" ? "повторений на сегодня" : "reviews due"}</span></div>
    </section>
    <section className="quick-grid">
      <article><p className="eyebrow">{locale === "ru" ? "ПЛАН" : "PLAN"}</p><h3>{postMode ? (locale === "ru" ? "Порядок после игры" : "After-play order") : (locale === "ru" ? "Что входит дальше" : "What comes next")}</h3>{postMode ? <><p>1. {locale === "ru" ? "Сохранить 1–3 руки" : "Save 1–3 hands"}</p><p>2. {locale === "ru" ? "Разобрать одну" : "Review one"}</p><p>3. {locale === "ru" ? "Только при необходимости — работа над ошибкой / Review" : "Only if needed — mistake practice / Review"}</p></> : <><p className="support">{locale === "ru" ? `План на выбранное время: ≈${plan.estimatedMinutes} из ${plan.targetMinutes} минут. Каждый пункт запускается отдельно.` : `Plan for the selected time: ≈${plan.estimatedMinutes} of ${plan.targetMinutes} minutes. Each item starts separately.`}</p>{plan.items.slice(0, 3).map((item, index) => { const copy = dailyPlanItemCopy(locale, item); return <p key={`${item.kind}-${item.moduleId ?? index}`}>{index + 1}. {copy.title} · ≈{item.estimatedMinutes} {locale === "ru" ? "мин" : "min"}</p>; })}</>}</article>
      <article><p className="eyebrow">{diagnosticEyebrow}</p><h3>{diagnosticProgress?.title ?? t.diagnosticTitle}</h3><p>{diagnosticProgress?.body ?? t.diagnosticDescription}</p><button className="textbutton" onClick={onDiagnostic}>{diagnosticProgress?.action ?? (locale === "ru" ? "Открыть диагностику →" : "Open Diagnostic →")}</button></article>
      <article><p className="eyebrow">{locale === "ru" ? "РАЗБОР" : "REVIEW"}</p><h3>{locale === "ru" ? "Реальные руки и объяснения" : "Real hands and explanations"}</h3><p>{pendingHuman > 0 ? (locale === "ru" ? pendingHuman + " записей ждут явного разбора." : pendingHuman + " records are waiting for explicit review.") : (locale === "ru" ? "Запиши решение до результата или открой историю объяснений." : "Record a decision before the result or review your explanation history.")}</p><button className="textbutton" onClick={onField}>{locale === "ru" ? "Открыть разбор" : "Open review"}</button></article>
      <article><p className="eyebrow">{t.beforePlay}</p><h3>{t.warmupTitle}</h3><p>{state.activeSession ? (locale === "ru" ? "Сохранённая сессия не меняется: отдельная разминка использует только до двух карточек из завершённых тем." : "Your saved session stays untouched: the separate warm-up uses only up to two cards from completed topics.") : (locale === "ru" ? "Одно знакомое решение из ошибки, затем до двух карточек. Если ошибки нет — только карточки." : "One familiar decision from a miss, then up to two cards. If no repair is due, use cards only.")}</p><button className="textbutton" onClick={onWarmup}>{t.quickWarmup}</button></article>
    </section>
    <section className="integrity"><h2>{t.integrityTitle}</h2><p>{t.integrityBody}</p></section>
    <LearningRoute locale={locale} />
  </>;
}

function Learn({ locale, state, onLesson, onPractice, onMixed, onBurst }: { locale: LocaleCode; state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void; onMixed: () => void; onBurst: () => void }) {
  const t = runtimeCopy[locale];
  const completedCount = modules.filter((module) => state.modules[module.id].contentCompleted).length;
  return <section className="surface">
    <div className="section-head"><p className="eyebrow">{t.learnEyebrow}</p><h1>{t.learnTitle}<br/><em>{t.learnEmphasis}</em></h1><p>{t.learnDescription}</p></div>
    <div className="module-list">{modules.map((source) => {
      const module = localizedModule(source, locale);
      const progress = state.modules[module.id];
      const prerequisiteId = nextRequiredModule(state, module.id);
      const available = !prerequisiteId;
      const truth = lessonSkillCopy(locale, progress.contentCompleted, progress.state);
      return <article key={module.id} className={!available ? "locked" : progress.state === "REPAIR_REQUIRED" ? "repair" : ""}>
        <div><span className="module-code">{module.lcm}</span><span className={`state-pill state-${progress.state.toLowerCase()}`}>{moduleStateLabel(locale, progress.state)}</span></div>
        <h2>{module.title}</h2><p>{module.plainGoal}</p><p className="table-cue">{module.tableCue}</p>
        <p className="support"><b>{truth.lesson}</b> · <b>{truth.skill}</b></p>
        {truth.explanation && <p className="support">{truth.explanation}</p>}
        {!available && prerequisiteId && <p className="support">{prerequisiteCopy(locale, prerequisiteId)}</p>}
        {!progress.contentCompleted && available && <p className="support">{locale === "ru" ? "Практика откроется после завершения этого урока." : "Practice opens after you complete this lesson."}</p>}
        <div className="module-actions">
          <button className="primary" onClick={() => onLesson(prerequisiteId ?? module.id)}>{prerequisiteId ? (locale === "ru" ? `Сначала ${moduleById[prerequisiteId].lcm}` : `First ${moduleById[prerequisiteId].lcm}`) : progress.contentCompleted ? t.repeatLesson : t.study} <span>→</span></button>
          <button disabled={!progress.contentCompleted} className="textbutton" onClick={() => onPractice(module.id)}>{t.decisions}</button>
        </div>
      </article>;
    })}</div>
    {completedCount < 3 && <p className="support">{locale === "ru" ? `Смешанная практика и серия быстрых решений откроются после трёх пройденных тем. Сейчас: ${completedCount}/3.` : `Mixed practice and Table Burst open after three completed topics. Current: ${completedCount}/3.`}</p>}
    <button className="secondary wide" disabled={completedCount < 3} onClick={onMixed}>{t.mixedBlock}</button>
    <button className="secondary wide" disabled={completedCount < 3} onClick={onBurst}>{locale === "ru" ? "Серия · 8 быстрых решений" : "Table Burst · 8 fast decisions"}</button>
  </section>;
}

function Session({ locale, state, setState, syncStatus, recoveryCode, lastLocalSaveAt, onExit, onWarmupCards, onFinished }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; recoveryCode: RecoveryCode; lastLocalSaveAt: string | null; onExit: () => void; onWarmupCards: () => void; onFinished: () => void }) {
  const session = state.activeSession;
  if (!session) return null;
  return session.mode === "lesson"
    ? <LessonSession locale={locale} state={state} setState={setState} source={moduleById[session.moduleId]} syncStatus={syncStatus} recoveryCode={recoveryCode} lastLocalSaveAt={lastLocalSaveAt} onExit={onExit} onFinished={onFinished} />
    : <PracticeSession locale={locale} state={state} setState={setState} syncStatus={syncStatus} recoveryCode={recoveryCode} lastLocalSaveAt={lastLocalSaveAt} onExit={onExit} onWarmupCards={onWarmupCards} onFinished={onFinished} />;
}

function SessionHeader({ locale, label, progress, syncStatus, recoveryCode, stateUpdatedAt, lastLocalSaveAt, onExit }: { locale: LocaleCode; label: string; progress: number; syncStatus: SyncStatus; recoveryCode: RecoveryCode; stateUpdatedAt: string; lastLocalSaveAt: string | null; onExit?: () => void }) {
  const t = runtimeCopy[locale];
  const { saveState, label: saveLabel } = sessionSaveLabel(locale, syncStatus, recoveryCode, stateUpdatedAt, lastLocalSaveAt);
  return <div className="session-head"><div><span>{label}</span><span data-testid="session-save" data-save-state={saveState} className={`session-save sync sync-${syncStatus}`} role="status" aria-live="polite">{saveLabel}</span><div className="progress"><i style={{ width: `${progress}%` }} /></div></div>{onExit && <button className="quiet" onClick={onExit}>{t.saveExit}</button>}</div>;
}

function LessonSession({ locale, state, setState, source, syncStatus, recoveryCode, lastLocalSaveAt, onExit, onFinished }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; source: ModuleContent; syncStatus: SyncStatus; recoveryCode: RecoveryCode; lastLocalSaveAt: string | null; onExit: () => void; onFinished: () => void }) {
  const t = runtimeCopy[locale];
  const module = localizedModule(source, locale);
  const session = state.activeSession!;
  const firstApplication = drillById[session.drillIds[1]] ?? source.drills.find((drill) => drill.kind === "changed" || drill.kind === "boundary") ?? source.drills[0];
  const secondApplication = drillById[session.drillIds[2]] ?? source.drills.find((drill) => drill.id !== firstApplication.id && (drill.kind === "changed" || drill.kind === "boundary")) ?? firstApplication;
  const setStep = (step: number, currentIndex = session.currentIndex) => setState(patchSession(state, { step, currentIndex, selectedActionId: null, selectedReasonId: null, itemStartedAt: new Date().toISOString() }));
  return <section className="session"><SessionHeader locale={locale} label={lessonStepLabel(locale, module.lcm, session.step)} progress={Math.round(((session.step + 1) / 10) * 100)} syncStatus={syncStatus} recoveryCode={recoveryCode} stateUpdatedAt={state.updatedAt} lastLocalSaveAt={lastLocalSaveAt} onExit={onExit} />
    {session.step === 0 && <><p className="eyebrow">1 · {locale === "ru" ? "РЕШИ БЕЗ ПОДСКАЗКИ" : "COLD CHECK"}</p><h2>{t.currentModel}</h2><p className="support">{t.coldCheckHelp}</p><Decision locale={locale} state={state} setState={setState} drill={source.drills[0]} onContinue={() => setStep(1)} /></>}
    {session.step === 1 && <ConceptStep locale={locale} module={source} onNext={() => setStep(2, 1)} />}
    {session.step === 2 && <><p className="eyebrow">3 · {locale === "ru" ? "ПРИМЕНИ СРАЗУ" : "APPLY IT NOW"}</p><h2>{locale === "ru" ? "Та же идея, но условия уже немного другие." : "Same idea, slightly different conditions."}</h2><p className="support">{locale === "ru" ? "Не перечитывай теорию. Сначала выбери действие и причину." : "Do not reread the theory. Choose the action and reason first."}</p><Decision locale={locale} state={state} setState={setState} drill={firstApplication} onContinue={() => setStep(3, 1)} /></>}
    {session.step === 3 && <FrameworkStep locale={locale} module={source} onNext={() => setStep(4, 1)} />}
    {session.step === 4 && <Worked locale={locale} module={source} onNext={() => setStep(5, 1)} />}
    {session.step === 5 && <Lab locale={locale} module={source} onNext={() => setStep(6, 2)} />}
    {session.step === 6 && <><p className="eyebrow">7 · {t.changedSituation}</p><h2>{t.changedSituationTitle}</h2><p className="support">{t.changedSituationHelp}</p><Decision locale={locale} state={state} setState={setState} drill={secondApplication} onContinue={() => setStep(7, 2)} /></>}
    {session.step === 7 && <ExplainBack locale={locale} state={state} setState={setState} module={source} />}
    {session.step === 8 && <TableCard locale={locale} state={state} setState={setState} module={source} onNext={() => setStep(9)} />}
    {session.step === 9 && <LessonSummary locale={locale} state={state} module={source} onFinish={() => { setState(completeLesson(state, source.id)); onFinished(); }} />}
  </section>;
}

function ConceptStep({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const localized = localizedModule(module, locale);
  const [lead, ...details] = module.theory;
  const copy = locale === "ru" ? {
    eyebrow: "ГЛАВНАЯ ИДЕЯ",
    remember: "ЗАПОМНИ",
    why: "Почему",
    more: "Дополнительное объяснение",
    boundary: "Граница",
    apply: "Сразу применить",
  } : {
    eyebrow: "CORE IDEA",
    remember: "REMEMBER",
    why: "Why",
    more: "More explanation",
    boundary: "Boundary",
    apply: "Apply it now",
  };
  return <>
    <p className="eyebrow">2 · {copy.eyebrow}</p>
    <h2>{localized.plainGoal}</h2>
    <div className="answer-panel"><b>{copy.remember}</b><p>{localized.tableCue}</p></div>
    {lead && <div className="theory-stack"><b>{copy.why}</b><p>{lead}</p></div>}
    {details.length > 0 && <details><summary>{copy.more}</summary><div className="theory-stack">{details.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}</div></details>}
    <p className="assumption-strip"><b>{copy.boundary}:</b> {module.scope}</p>
    <button className="primary" onClick={onNext}>{copy.apply} <span>→</span></button>
  </>;
}

function FrameworkStep({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const localized = localizedModule(module, locale);
  const copy = locale === "ru" ? {
    eyebrow: "КАРТА РЕШЕНИЯ",
    cues: "Три сигнала перед действием",
    order: "Теперь собери их в один порядок:",
    next: "Сначала решить пример",
  } : {
    eyebrow: "DECISION MAP",
    cues: "Three cues before acting",
    order: "Now combine them into one order:",
    next: "Solve the example first",
  };
  return <>
    <p className="eyebrow">4 · {copy.eyebrow}</p>
    <h2>{localized.tableCue}</h2>
    <div className="answer-panel"><b>{copy.cues}</b><ul className="learning-list">{module.heuristics.map((item) => <li key={item}>{item}</li>)}</ul></div>
    <p className="support">{copy.order}</p>
    <ol className="learning-list">{module.decisionTree.map((item) => <li key={item}>{item}</li>)}</ol>
    <button className="primary" onClick={onNext}>{copy.next} <span>→</span></button>
  </>;
}

function Worked({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const t = runtimeCopy[locale];
  const [revealed, setRevealed] = useState(false);
  const copy = locale === "ru" ? {
    prompt: "Сначала выбери линию в голове и назови одну причину. Разбор открой только после этого.",
    reveal: "Я решил — показать разбор",
  } : {
    prompt: "Choose a line first and name one reason to yourself. Reveal the breakdown only after that.",
    reveal: "I decided — show the breakdown",
  };
  return <><p className="eyebrow">5 · {t.workedExample}</p><h2>{module.workedExample.situation}</h2>{!revealed ? <><p className="support">{copy.prompt}</p><button className="primary" onClick={() => setRevealed(true)}>{copy.reveal} <span>→</span></button></> : <><ol className="learning-list">{module.workedExample.steps.map((step) => <li key={step}>{step}</li>)}</ol><div className="answer-panel"><b>{t.conclusion}</b><p>{module.workedExample.answer}</p></div><div className="counterexample"><b>{t.ruleBoundary}</b><p>{module.counterexample}</p></div><button className="primary" onClick={onNext}>{t.openLab} <span>→</span></button></>}</>;
}

function Lab({ locale, module, onNext }: { locale: LocaleCode; module: ModuleContent; onNext: () => void }) {
  const t = runtimeCopy[locale];
  const lab = module.lab;
  const labels = labLabels(locale);
  const [pot, setPot] = useState(lab.type === "spr" ? lab.initialPot : 0);
  const [stack, setStack] = useState(lab.type === "spr" ? lab.stack : 0);
  const [bet, setBet] = useState(lab.type === "spr" ? lab.bet : 0);
  const spr = lab.type === "spr" && pot + bet * 2 > 0 ? Math.max(0, (stack - bet) / (pot + bet * 2)) : 0;
  return <><p className="eyebrow">6 · {labels.eyebrow}</p><h2>{lab.title}</h2><p className="support">{lab.description}</p>{lab.type === "spr" ? <div className="spr-lab"><label>{labels.pot}<input type="number" value={pot} onChange={(event) => setPot(Number(event.target.value))} /></label><label>{labels.stack}<input type="number" value={stack} onChange={(event) => setStack(Number(event.target.value))} /></label><label>{labels.betCall}<input type="number" value={bet} onChange={(event) => setBet(Number(event.target.value))} /></label><div className="spr-result"><span>SPR</span><b>{spr.toFixed(2)}</b><small>({stack}−{bet}) / ({pot}+2×{bet})</small></div></div> : <div className="compare-lab"><article><b>{lab.leftTitle}</b><p>{lab.leftText}</p></article><article><b>{lab.rightTitle}</b><p>{lab.rightText}</p></article></div>}<button className="primary" onClick={onNext}>{t.changedSituation} <span>→</span></button></>;
}

function ExplainBack({ locale, state, setState, module }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent }) {
  const t = runtimeCopy[locale];
  const [value, setValue] = useState(state.activeSession?.explainBack ?? "");
  const savedDraft = state.activeSession?.explainBack ?? "";
  const explanationReady = isGenuineExplainBackAttempt(value);

  function persistDraft() {
    if (value !== savedDraft) setState(patchSession(state, { explainBack: value }));
  }

  function saveAndContinue() {
    if (!explanationReady) return;
    const withDraft = value === savedDraft ? state : patchSession(state, { explainBack: value });
    const saved = saveExplainBack(withDraft, module.id, module.id + ".explainBack", value);
    if (!saved.activeSession) return;
    setState(patchSession(saved, {
      step: 8,
      selectedActionId: null,
      selectedReasonId: null,
      itemStartedAt: new Date().toISOString(),
    }));
  }

  return <>
    <p className="eyebrow">8 · {t.explainBack}</p>
    <h2>{module.explainBackPrompt}</h2>
    <Wave7ExplainBackHistory locale={locale} state={state} moduleId={module.id} />
    <textarea className="large-input" value={value} onChange={(event) => setValue(event.target.value)} onBlur={persistDraft} placeholder={t.explainPlaceholder}/>
    {!explanationReady && <p className="support">{locale === "ru" ? "Чтобы сохранить, объясни решение своими словами и назови причину. Короткого содержательного ответа достаточно; одного повторяющегося слова — нет." : "To save, explain the decision in your own words and give a reason. A short meaningful answer is enough; repeating one word is not."}</p>}
    <button className="primary" disabled={!explanationReady} onClick={saveAndContinue}>{t.saveExplanation} <span>→</span></button>
  </>;
}

function TableCard({ locale, state, setState, module, onNext }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; module: ModuleContent; onNext: () => void }) {
  return <ExplainBackSelfCheck locale={locale} state={state} setState={setState} module={module} onNext={onNext} />;
}

function LessonSummary({ locale, state, module, onFinish }: { locale: LocaleCode; state: LearnerState; module: ModuleContent; onFinish: () => void }) {
  const t = runtimeCopy[locale];
  const session = state.activeSession!;
  const interactions = state.interactions.filter((item) => item.mode === "lesson" && item.moduleId === module.id && Date.parse(item.at) >= Date.parse(session.startedAt));
  const actionPassed = interactions.filter((item) => item.actionOk).length;
  const reasonPassed = interactions.filter((item) => item.reasonOk).length;
  const fullyPassed = interactions.filter((item) => item.actionOk && item.reasonOk).length;
  const followUps = interactions.filter((item) => item.drillId !== module.drills[0].id).length;
  const hasMiss = interactions.some((item) => !item.actionOk || !item.reasonOk);
  const delayedChecked = state.modules[module.id].evidence.retention.exposures > 0;
  const copy = locale === "ru" ? {
    checked: "Что уже проверено",
    action: "Действие",
    reason: "Обоснование",
    spots: "Дополнительные споты",
    missTitle: "Есть материал для разбора ошибки",
    missBody: "Урок можно закончить: ошибка уже сохранена и вернётся отдельным новым спотом. Это лучше, чем повторять тот же вопрос сразу.",
    cleanTitle: "Текущие проверки пройдены",
    cleanBody: "Это хороший старт, но ещё не доказательство удержания после паузы или применения за столом.",
    delayedDone: "Этот урок не проверял удержание после паузы. В истории темы такая отдельная проверка уже есть.",
    delayedPending: "Этот урок не проверял удержание после паузы. Тема вернётся позже без свежей подсказки.",
  } : {
    checked: "What has been checked",
    action: "Action",
    reason: "Reasoning",
    spots: "Additional spots",
    missTitle: "There is a mistake to repair",
    missBody: "You can finish the lesson: the miss is already saved and will return as a new spot instead of repeating the same question immediately.",
    cleanTitle: "The current checks passed",
    cleanBody: "That is a good start, not proof of delayed retention or real-table use yet.",
    delayedDone: "This lesson did not test delayed retention. A separate delayed-recall check already exists in this topic's history.",
    delayedPending: "This lesson did not test delayed retention. The topic will return later without the fresh explanation.",
  };
  return <section className="summary">
    <p className="eyebrow">10 · {t.lessonFinished}</p>
    <h1>{t.lessonIntroduced}<br/><em>{t.lessonNotMastered}</em></h1>
    <p className="lede">{t.lessonNext}</p>
    <div className="answer-panel"><b>{copy.checked}</b><p>{copy.action}: {actionPassed}/{interactions.length || 0} · {copy.reason}: {reasonPassed}/{interactions.length || 0} · {copy.spots}: {followUps}</p><p>{locale === "ru" ? "Полностью верных решений" : "Fully correct decisions"}: {fullyPassed}/{interactions.length || 0}</p></div>
    <div className={hasMiss ? "counterexample" : "answer-panel"}><b>{hasMiss ? copy.missTitle : copy.cleanTitle}</b><p>{hasMiss ? copy.missBody : copy.cleanBody}</p></div>
    <p className="assumption-strip">{delayedChecked ? copy.delayedDone : copy.delayedPending}</p>
    <button className="primary" onClick={onFinish}>{t.saveReturn} <span>→</span></button>
  </section>;
}

function PracticeSession({ locale, state, setState, syncStatus, recoveryCode, lastLocalSaveAt, onExit, onWarmupCards, onFinished }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; recoveryCode: RecoveryCode; lastLocalSaveAt: string | null; onExit: () => void; onWarmupCards: () => void; onFinished: () => void }) {
  const session = state.activeSession!;
  const burst = isTableBurst(session.mode, session.drillIds.length);
  const interactions = state.interactions.filter((item) => Date.parse(item.at) >= Date.parse(session.startedAt) && item.mode === session.mode);

  if (burst && session.step === 2) {
    const issueCounts = new Map<ModuleId, number>();
    for (const interaction of interactions) {
      const targetSeconds = drillById[interaction.drillId]?.targetSeconds ?? Number.POSITIVE_INFINITY;
      if (interaction.actionOk && interaction.reasonOk && interaction.elapsedSeconds <= targetSeconds) continue;
      issueCounts.set(interaction.moduleId, (issueCounts.get(interaction.moduleId) ?? 0) + 1);
    }
    const recurring = [...issueCounts.entries()].sort((left, right) => right[1] - left[1]).find(([, count]) => count >= 2);
    const recurringCopy = recurring
      ? locale === "ru"
        ? `Только в этой серии: в ${localizedModule(moduleById[recurring[0]], locale).shortTitle} заминка или ошибка повторилась ${recurring[1]} раза. Это повод вернуться к механизму, а не глобальный вывод о твоей игре.`
        : `This burst only: hesitation or an error repeated ${recurring[1]} times in ${localizedModule(moduleById[recurring[0]], locale).shortTitle}. That is a reason to revisit the mechanism, not a global claim about your play.`
      : locale === "ru"
        ? "В этой серии повторяющегося сигнала ошибки или медленного решения не видно. Это относится только к этим восьми спотам."
        : "No recurring error or slow-decision signal appeared in this burst. This statement applies only to these eight spots.";
    const finishBurst = () => { setState(completeBlock(state)); onFinished(); };
    return <section className="session"><SessionHeader locale={locale} label={locale === "ru" ? "Серия · 8/8" : "Table Burst · 8/8"} progress={100} syncStatus={syncStatus} recoveryCode={recoveryCode} stateUpdatedAt={state.updatedAt} lastLocalSaveAt={lastLocalSaveAt} onExit={onExit} /><p className="eyebrow">{locale === "ru" ? "ИТОГ СЕРИИ" : "BURST SUMMARY"}</p><h2>{locale === "ru" ? "Восемь решений без названий тем." : "Eight decisions without topic labels."}</h2><p className="support">{recurringCopy}</p><button className="primary" onClick={finishBurst}>{locale === "ru" ? "Завершить" : "Finish"} <span>→</span></button></section>;
  }

  const drill = drillById[session.drillIds[session.currentIndex]];
  const advance = () => {
    if (session.currentIndex + 1 < session.drillIds.length) {
      setState(patchSession(state, { currentIndex: session.currentIndex + 1, selectedActionId: null, selectedReasonId: null, confidence: 65, itemStartedAt: new Date().toISOString() }));
    } else if (burst) {
      setState(patchSession(state, { step: 2, selectedActionId: null, selectedReasonId: null }));
    } else {
      setState(completeBlock(state, session.mode === "practice" || session.mode === "repair" ? session.moduleId : undefined));
      if (session.mode === "repair" && session.step === -1) onWarmupCards();
      else onFinished();
    }
  };
  const header = burst ? `${locale === "ru" ? "Серия" : "Table Burst"} · ${session.currentIndex + 1}/${session.drillIds.length}` : `${sessionModeLabel(locale, session.mode)} · ${session.currentIndex + 1}/${session.drillIds.length}`;
  return <section className="session"><SessionHeader locale={locale} label={header} progress={Math.round(((session.currentIndex + 1) / session.drillIds.length) * 100)} syncStatus={syncStatus} recoveryCode={recoveryCode} stateUpdatedAt={state.updatedAt} lastLocalSaveAt={lastLocalSaveAt} onExit={onExit} /><Decision locale={locale} state={state} setState={setState} drill={drill} onContinue={advance} /><div className="mini-results">{(["A", "B", "C", "D"] as ResponseClass[]).map((kind) => <span key={kind}>{responseClassShortLabel(locale, kind)}: {interactions.filter((item) => item.responseClass === kind).length}</span>)}</div></section>;
}

function Decision({ locale, state, setState, drill, onContinue }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; drill: Drill; onContinue: () => void }) {
  const t = runtimeCopy[locale];
  const session = state.activeSession!;
  const actionOptions = useMemo(() => shuffle(drill.actionOptions, `${session.startedAt}:${drill.id}:action`), [drill.actionOptions, drill.id, session.startedAt]);
  const reasonOptions = useMemo(() => shuffle(drill.reasonOptions, `${session.startedAt}:${drill.id}:reason`), [drill.reasonOptions, drill.id, session.startedAt]);
  const interaction = [...state.interactions].reverse().find((item) => item.drillId === drill.id && Date.parse(item.at) >= Date.parse(session.itemStartedAt));
  const missingDecisionParts = [
    !session.selectedActionId ? (locale === "ru" ? "действие" : "an action") : "",
    !session.selectedReasonId ? (locale === "ru" ? "причину" : "a reason") : "",
  ].filter(Boolean);

  function lock() {
    if (interaction || !session.selectedActionId || !session.selectedReasonId) return;
    const actionOk = session.selectedActionId === drill.correctActionId;
    const reasonOk = session.selectedReasonId === drill.correctReasonId;
    setState(recordDecision(state, {
      moduleId: drill.moduleId,
      drillId: drill.id,
      nodeKey: drill.nodeKey,
      variantGroup: drill.variantGroup,
      mode: session.mode,
      actionOk,
      reasonOk,
      selectedActionOptionId: session.selectedActionId,
      selectedReasonOptionId: session.selectedReasonId,
      sourceReviewId: session.sourceReviewId,
      confidence: session.confidence,
      elapsedSeconds: Math.max(1, Math.round((Date.now() - Date.parse(session.itemStartedAt)) / 1000)),
      targetSeconds: drill.targetSeconds,
      isBoundary: drill.kind === "boundary",
      transferProbe: transferProbeFor(drill),
    }));
  }

  if (interaction) {
    const responseClass = classifyResponse(interaction.actionOk, interaction.reasonOk);
    const selectedAction = drill.actionOptions.find((item) => item.id === interaction.selectedActionOptionId)?.text ?? "—";
    const selectedReason = drill.reasonOptions.find((item) => item.id === interaction.selectedReasonOptionId)?.text ?? "—";
    const workingAction = drill.actionOptions.find((item) => item.id === drill.correctActionId)?.text;
    const workingReason = drill.reasonOptions.find((item) => item.id === drill.correctReasonId)?.text;
    const burst = isTableBurst(session.mode, session.drillIds.length);
    const needsExplanation = !burst || !interaction.actionOk || !interaction.reasonOk || interaction.confidence < 50;
    const copy = locale === "ru" ? { yours: "Твой выбор", working: "Рабочий выбор", action: "Действие", reason: "Причина" } : { yours: "Your choice", working: "Working choice", action: "Action", reason: "Reason" };
    return <div className="feedback-view" aria-live="polite"><p className="eyebrow">{decisionReviewLabel(locale)}</p><h2>{classMessage(locale, responseClass)}</h2><div className="answer-panel"><b>{copy.yours}</b><p>{copy.action}: {selectedAction}</p><p>{copy.reason}: {selectedReason}</p><b>{copy.working}</b><p>{copy.action}: {workingAction}</p><p>{copy.reason}: {workingReason}</p></div>{needsExplanation && <><p className="support">{drill.explanation}</p><p className="assumption-strip">{t.assumptions}: {drill.assumptions.join(" · ")}</p></>}<button className="primary" onClick={onContinue}>{t.continue} <span>→</span></button></div>;
  }

  const fadedContext = shouldFadeDecisionContext(session.mode, false);
  return <div className="decision-card"><p className="eyebrow">{fadedContext ? (locale === "ru" ? "РАСПОЗНАЙ СПОТ" : "READ THE SPOT") : `${moduleById[drill.moduleId].lcm} · ${drillKindLabel(locale, drill.kind)}`}</p><p className="cue">{drill.cue}</p><h2>{drill.question}</h2><p className="assumption-strip">{t.conditions}: {drill.assumptions.join(" · ")}</p><OptionGroup legend={t.chooseAction} options={actionOptions} selected={session.selectedActionId} onSelect={(selectedActionId) => setState(patchSession(state, { selectedActionId }))} /><OptionGroup legend={t.chooseReason} options={reasonOptions} selected={session.selectedReasonId} onSelect={(selectedReasonId) => setState(patchSession(state, { selectedReasonId }))} /><label className="confidence">{t.confidence} <b>{locale === "ru" ? "примерно" : "roughly"} {session.confidence}%</b><input type="range" min="0" max="100" step="5" value={session.confidence} onChange={(event) => setState(patchSession(state, { confidence: Number(event.target.value) }))} /></label><p className="support">{confidenceHelp(locale)}</p>{missingDecisionParts.length > 0 && <p className="support">{locale === "ru" ? `Чтобы ответить, выбери ${missingDecisionParts.join(" и ")}.` : `To submit, choose ${missingDecisionParts.join(" and ")}.`}</p>}<button className="primary" disabled={missingDecisionParts.length > 0} onClick={lock}>{t.lockDecision} <span>→</span></button></div>;
}

function OptionGroup({ legend, options, selected, onSelect }: { legend: string; options: Option[]; selected: string | null; onSelect: (id: string) => void }) {
  return <fieldset className="answer-set"><legend>{legend}</legend>{options.map((option) => <button type="button" key={option.id} aria-pressed={selected === option.id} className={selected === option.id ? "selected" : ""} onClick={() => onSelect(option.id)}>{option.text}</button>)}</fieldset>;
}

function Review({ locale, state, plan, budget, onBudget, onReview, onRepair }: { locale: LocaleCode; state: LearnerState; plan: DailyPlan; budget: DailyBudget; onBudget: (value: DailyBudget) => void; onReview: (sourceReviewId?: string) => void; onRepair: (id: ModuleId, sourceReviewId?: string) => void }) {
  const t = runtimeCopy[locale];
  const due = dueReviewItems(state);
  const dueById = new Map(due.map((item) => [item.id, item]));
  const batch = plan.items.flatMap((planned) => {
    if ((planned.kind !== "review" && planned.kind !== "repair") || !planned.sourceReviewId) return [];
    const item = dueById.get(planned.sourceReviewId);
    return item ? [{ item, planned }] : [];
  });
  const deferred = Math.max(0, due.length - batch.length);
  const role = locale === "ru"
    ? "Review показывает ограниченную очередь под выбранные 5/15/30 минут, а не весь долг сразу. Каждый пункт запускается отдельно; после завершения приложение возвращает сюда к обновлённой очереди."
    : "Review shows a bounded queue for the selected 5/15/30 minutes, not the entire backlog. Each item runs separately; after completion the app returns here to the updated queue.";
  const budgets: DailyBudget[] = ["5", "15", "30"];
  return <section className="surface"><div className="section-head"><p className="eyebrow">{t.reviewEyebrow}</p><h1>{t.reviewTitle}<br/><em>{t.reviewEmphasis}</em></h1><p>{role}</p><div className="mode-switch" aria-label={locale === "ru" ? "Время Review" : "Review time"}>{budgets.map((value) => <button key={value} aria-pressed={budget === value} onClick={() => onBudget(value)}>{dailyBudgetLabel(locale, value)}</button>)}</div>{due.length > 0 && <p className="support">{locale === "ru" ? `Сейчас показано: ${batch.length} из ${due.length} задач. ${deferred > 0 ? `Ещё ${deferred} останутся в общей очереди.` : "За пределами этого набора задач нет."}` : `Shown now: ${batch.length} of ${due.length} items. ${deferred > 0 ? `${deferred} remain in the overall queue.` : "Nothing sits outside this set."}`}</p>}</div>{batch.length ? <div className="queue">{batch.map(({ item, planned }) => {
    const why = dailyPlanItemCopy(locale, planned);
    return <article key={item.id}><span className={`kind kind-${item.kind}`}>{reviewKindLabel(locale, item.kind)}</span><h3>{item.kind === "retention" ? (locale === "ru" ? "Решение после паузы" : "Delayed decision") : localizedModule(moduleById[item.moduleId], locale).title}</h3><p className="support"><b>{locale === "ru" ? "Почему сейчас?" : "Why now?"}</b> {why.reason}</p><button className="primary" onClick={() => item.kind === "repair" ? onRepair(item.moduleId, item.id) : onReview(item.id)}>{t.start} <span>→</span></button></article>;
  })}</div> : <div className="empty-state"><h2>{t.nothingDue}</h2><p>{t.reviewEmptyBody}</p></div>}</section>;
}

function Cards({ locale, state, setState, warmupIds, onLearn }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; warmupIds: string[]; onLearn: () => void }) {
  const t = runtimeCopy[locale];
  const studiedCards = allCards.filter((card) => state.modules[card.moduleId].contentCompleted);
  const buildSnapshot = (nextMode: "warmup" | "due" | "all") => {
    const now = Date.now();
    if (nextMode === "warmup") {
      const allowed = new Set(warmupIds);
      return studiedCards.filter((card) => allowed.has(card.id)).map((card) => card.id);
    }
    if (nextMode === "due") {
      return studiedCards
        .filter((card) => !state.cards[card.id] || Date.parse(state.cards[card.id].dueAt) <= now)
        .map((card) => card.id);
    }
    return studiedCards.map((card) => card.id);
  };
  const [mode, setMode] = useState<"warmup" | "due" | "all">("warmup");
  const [sessionIds, setSessionIds] = useState<string[]>(() => buildSnapshot("warmup"));
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const cards = sessionIds.map((id) => allCards.find((card) => card.id === id)).filter((card): card is (typeof allCards)[number] => Boolean(card));
  const card = cards[index];
  const finished = cards.length > 0 && index >= cards.length;
  const role = locale === "ru"
    ? "Карточки нужны для быстрого вспоминания одной подсказки. Здесь показывается только материал из завершённых тем. Оценка меняет только срок следующего показа карточки, а не статус навыка."
    : "Cards are for quickly recalling one cue. Only material from completed topics appears here. Your grade changes only when the card appears again, not the skill status.";
  const switchMode = (nextMode: "warmup" | "due" | "all") => {
    setMode(nextMode);
    setSessionIds(buildSnapshot(nextMode));
    setIndex(0);
    setRevealed(false);
  };
  const modeSwitch = <div className="mode-switch" aria-label={locale === "ru" ? "Режим карточек" : "Card mode"}><button aria-pressed={mode === "warmup"} onClick={() => switchMode("warmup")}>{cardModeLabel(locale, "warmup")}</button><button aria-pressed={mode === "due"} onClick={() => switchMode("due")}>{cardModeLabel(locale, "due")}</button><button aria-pressed={mode === "all"} onClick={() => switchMode("all")}>{cardModeLabel(locale, "all")}</button></div>;
  if (finished) return <section className="surface"><div className="section-head"><p className="eyebrow">{recallLabel(locale)}</p><h1>{locale === "ru" ? "Этот набор карточек закончен." : "This card set is complete."}</h1><p>{role}</p></div>{modeSwitch}<div className="empty-state"><h2>{locale === "ru" ? `${cards.length}/${cards.length} карточек пройдено.` : `${cards.length}/${cards.length} cards completed.`}</h2><p>{locale === "ru" ? "Набор был зафиксирован при запуске, поэтому оценка карточки не пропускает следующую и не добавляет новые карточки по ходу." : "The set was fixed when it started, so grading a card neither skips the next one nor adds new cards mid-session."}</p></div></section>;
  if (!card) return <section className="surface"><div className="section-head"><p className="eyebrow">{recallLabel(locale)}</p><h1>{locale === "ru" ? "Быстро вспомни знакомую подсказку." : "Quickly recall a familiar cue."}</h1><p>{role}</p></div>{modeSwitch}<div className="empty-state"><h2>{locale === "ru" ? "В этом режиме карточек пока нет." : "There are no cards in this mode yet."}</h2><p>{studiedCards.length === 0 ? (locale === "ru" ? "Карточки открываются только из завершённых тем. Сначала закончи первый урок." : "Cards unlock only from completed topics. Finish the first lesson first.") : mode === "warmup" ? (locale === "ru" ? "Для текущей разминки подходящих карточек нет. Сохранённая учебная сессия, если она есть, остаётся без изменений." : "There are no cards for this warm-up. Any saved learning session remains untouched.") : (locale === "ru" ? "Выбери другой режим карточек или вернись к обучению." : "Choose another card mode or return to Learn.")}</p>{studiedCards.length === 0 && <button className="primary" onClick={onLearn}>{locale === "ru" ? "Открыть обучение" : "Open Learn"} <span>→</span></button>}</div></section>;
  const apply = (grade: 0 | 1 | 2 | 3) => { setState(gradeCard(state, card.id, grade)); setIndex((current) => current + 1); setRevealed(false); };
  const gradeHelp = locale === "ru"
    ? "Не вспомнил → снова примерно через 10 минут; Трудно → минимум завтра; Нормально → интервал заметно длиннее; Легко → самый длинный интервал. Это не меняет статус навыка."
    : "Forgot → again in about 10 minutes; Hard → at least tomorrow; Good → a meaningfully longer interval; Easy → the longest interval. This does not change the skill status.";
  return <section className="session"><p className="support">{role}</p>{modeSwitch}<p className="eyebrow">{recallLabel(locale)} · {index + 1}/{cards.length}</p><h2>{card.front}</h2><p className="module-code">{moduleById[card.moduleId].lcm} · {cardKindLabel(locale, card.kind)}</p>{revealed ? <><div className="card-answer">{card.back}</div><p className="support">{gradeHelp}</p><div className="grade-row"><button onClick={() => apply(0)}>{t.forgot}</button><button onClick={() => apply(1)}>{t.hard}</button><button onClick={() => apply(2)}>{t.good}</button><button className="primary" onClick={() => apply(3)}>{t.easy}</button></div></> : <button className="primary" onClick={() => setRevealed(true)}>{t.showAnswer} <span>→</span></button>}<p className="support">{t.cardsBoundary}</p></section>;
}

function SkillMap({ locale, state, onLesson, onPractice }: { locale: LocaleCode; state: LearnerState; onLesson: (id: ModuleId) => void; onPractice: (id: ModuleId) => void }) {
  const t = runtimeCopy[locale];
  const role = locale === "ru"
    ? "Прогресс показывает состояние темы, реальные попытки и следующий шаг. Отдельные доли — это история наблюдений, а не общий процент освоения навыка."
    : "Progress shows the topic state, actual attempts, and the next step. Per-dimension ratios are observation history, not an overall skill-status percentage.";
  return <section className="surface">
    <div className="section-head"><p className="eyebrow">{t.skillMap}</p><h1>{t.mapTitle}<br/><em>{t.mapEmphasis}</em></h1><p>{role}</p></div>
    <div className="map-grid">{modules.map((source) => {
      const module = localizedModule(source, locale);
      const prerequisiteId = nextRequiredModule(state, module.id);
      return <article key={module.id}>
        <div className="map-title"><span>{module.lcm}</span><b>{moduleStateLabel(locale, state.modules[module.id].state)}</b></div>
        <h3>{module.shortTitle}</h3>
        <div className="dimension-grid">{DIMENSION_KEYS.map((key) => {
          const cell = state.modules[module.id].evidence[key];
          return <div key={key}><span>{dimensionLabel(locale, key)}</span><b>{cell.exposures === 0 ? "—" : `${cell.successes}/${cell.exposures}`}</b><small>{locale === "ru" ? "успех / попытки" : "success / attempts"}</small></div>;
        })}</div>
        <Wave7ProgressDetails locale={locale} state={state} moduleId={module.id} />
        {prerequisiteId && <p className="support">{prerequisiteCopy(locale, prerequisiteId)}</p>}
        {!state.modules[module.id].contentCompleted && !prerequisiteId && <p className="support">{locale === "ru" ? "Практика откроется после завершения урока." : "Practice opens after the lesson is completed."}</p>}
        <div className="module-actions"><button className="textbutton" onClick={() => onLesson(prerequisiteId ?? module.id)}>{prerequisiteId ? (locale === "ru" ? `Сначала ${moduleById[prerequisiteId].lcm}` : `First ${moduleById[prerequisiteId].lcm}`) : t.theory}</button><button className="textbutton" disabled={!state.modules[module.id].contentCompleted} onClick={() => onPractice(module.id)}>{t.practice}</button></div>
      </article>;
    })}</div>
  </section>;
}

function Diagnostic({ locale, state, setState, onExit, onImported }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; recoveryCode: RecoveryCode; lastLocalSaveAt: string | null; onExit: () => void; onImported: () => void }) {
  return <DiagnosticExperience locale={locale} state={state} setState={setState} onExit={onExit} onRouted={onImported} />;
}

export function LegacyDiagnostic({ locale, state, setState, syncStatus, recoveryCode, lastLocalSaveAt, onExit, onImported }: { locale: LocaleCode; state: LearnerState; setState: (value: LearnerState) => void; syncStatus: SyncStatus; recoveryCode: RecoveryCode; lastLocalSaveAt: string | null; onExit: () => void; onImported: () => void }) {
  const t = runtimeCopy[locale];
  const diagnostic = state.diagnostic;
  const sourceItem = diagnosticT1[diagnostic.responses.length];
  const item = sourceItem && locale === "en" ? { ...sourceItem, ...diagnosticEnglish[sourceItem.id] } : sourceItem;
  const [answer, setAnswer] = useState("");
  const [reasoning, setReasoning] = useState("");
  const [confidence, setConfidence] = useState(65);
  const [startedAt, setStartedAt] = useState(Date.now());
  const preExposure = state.interactions.length === 0 && modules.every((module) => !state.modules[module.id].contentCompleted && state.modules[module.id].lessonStep === 0);
  const context = diagnostic.measurementContext;
  const instructions = context === "MIXED_EXPOSURE_INVALID_FOR_BASELINE" ? t.mixedInstructions : context === "COLD_BASELINE" ? t.coldInstructions : t.postInstructions;
  const role = locale === "ru"
    ? "Диагностика — необязательная проверка текущего хода решения. Она помогает выбрать приоритетные темы только после отдельного человеческого разбора и сама не подтверждает навык."
    : "Diagnostic is an optional check of your current reasoning. It can prioritise topics only after separate human review and does not prove a skill by itself.";

  const begin = () => {
    setStartedAt(Date.now());
    setState(startDiagnosticRun(state, locale));
  };
  const submit = () => {
    if (!item || !answer.trim() || !reasoning.trim()) return;
    setState(recordDiagnosticResponse(state, {
      item_id: item.id,
      answer: answer.trim(),
      reasoning: reasoning.trim(),
      confidence,
      time_seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)),
      locale,
    }, T1_IDS));
    setAnswer("");
    setReasoning("");
    setConfidence(65);
    setStartedAt(Date.now());
  };

  async function importScore(file: File) {
    try {
      const score = parseDiagnosticScore(JSON.parse(await file.text()));
      if (!diagnostic.runId || score.run_id !== diagnostic.runId) throw new Error("run");
      if (score.measurement_context !== diagnostic.measurementContext) throw new Error("context");
      if (score.locale_at_start !== diagnostic.localeAtStart) throw new Error("locale");
      if (!score.item_reviews || !score.reviewer_kind || !score.reviewed_at) throw new Error("human-review");
      const priority = deriveDiagnosticPriorityModules(score);
      setState(applyReviewedDiagnostic(state, priority, {
        reviewerKind: score.reviewer_kind === "human" ? "HUMAN" : "HUMAN_ASSISTED",
        reviewedAt: score.reviewed_at,
        itemReviews: score.item_reviews.map((item) => ({
          itemId: item.item_id,
          responseClass: item.response_class,
          reviewerNote: item.reviewer_note,
        })),
      }));
      onImported();
    } catch {
      alert(locale === "ru" ? "Не удалось загрузить результат разбора для этой диагностики." : "Could not import the reviewed result for this Diagnostic.");
    }
  }

  if (diagnostic.status === "NOT_STARTED") {
    return <section className="surface"><div className="section-head"><p className="eyebrow">{preExposure ? (locale === "ru" ? "СТАРТОВАЯ ДИАГНОСТИКА" : "STARTING DIAGNOSTIC") : (locale === "ru" ? "ТЕКУЩАЯ ДИАГНОСТИКА" : "CURRENT DIAGNOSTIC")}</p><h1>{t.diagnosticMeasureTitle}<br/><em>{t.diagnosticMeasureEmphasis}</em></h1><p>{role}</p><p>{preExposure ? t.coldIntro : t.postIntro}</p><button className="primary" aria-label={t.startT1} onClick={begin}>{t.startT1} <span>→</span></button></div></section>;
  }

  if (["AWAITING_REVIEW", "SCORED", "ROUTED"].includes(diagnostic.status)) {
    const exportReady = Boolean(diagnostic.runId && diagnostic.measurementContext && diagnostic.localeAtStart && diagnostic.submittedAt && diagnostic.responses.length === 10);
    return <section className="surface"><div className="section-head"><p className="eyebrow">{diagnosticLabel(locale)} · {diagnosticStatusLabel(locale, diagnostic.status)}</p><h1>{diagnostic.responses.length}/10 {t.answersSaved}.</h1><p>{role}</p><p>{t.rawBoundary}</p><p className="assumption-strip">{locale === "ru" ? "Дальше: 1) скачать ответы → 2) отдельно разобрать их с человеком — с инструментом или без → 3) импортировать разобранный файл → 4) Today перестроит приоритеты. Ни один из этих шагов сам по себе не подтверждает освоение навыка." : "Next: 1) download responses → 2) review them separately with a person, with or without a tool → 3) import the reviewed file → 4) Today reprioritises. None of these steps proves the skill by itself."}</p><p className="support">{locale === "ru" ? "Семантический разбор делает человек или человек с инструментом. Импорт может поднять тему в очереди, но сам по себе не подтверждает навык, запоминание после паузы или игру за столом." : "Semantic review is done by a person, with or without a tool. Import may move a topic up the queue, but by itself it does not prove the skill, later recall, or real-table use."}</p>{!exportReady && <p className="support">{locale === "ru" ? "Скачать ответы можно после сохранения всех 10 ответов и служебного контекста этой попытки." : "Download becomes available after all 10 answers and this run's context are saved."}</p>}<div className="button-row"><button className="primary" disabled={!exportReady} onClick={() => downloadJson("live-cash-t1-raw-v0.2.json", {
      schema_version: "raw-0.2",
      learner_id: "current_learner",
      tranche_id: "T1",
      run_id: diagnostic.runId,
      measurement_context: diagnostic.measurementContext,
      locale_at_start: diagnostic.localeAtStart,
      submitted_at: diagnostic.submittedAt,
      responses: diagnostic.responses,
    })}>{t.downloadRaw} <span>↓</span></button><label className="file-button">{t.importScore}<input type="file" accept="application/json" onChange={(event) => { const file = event.target.files?.[0]; if (file) void importScore(file); }} /></label></div>{diagnostic.priorityModules.map((moduleId) => <p key={moduleId} className="priority-box">{moduleById[moduleId].lcm} · {localizedModule(moduleById[moduleId], locale).title}</p>)}</div></section>;
  }

  if (!item) return null;
  const missingDiagnosticParts = [
    !answer.trim() ? (locale === "ru" ? "действие" : "an action") : "",
    !reasoning.trim() ? (locale === "ru" ? "причину" : "a reason") : "",
  ].filter(Boolean);
  return <section className="session"><SessionHeader locale={locale} label={`${diagnosticLabel(locale)} · ${diagnostic.responses.length + 1}/10`} progress={Math.round(((diagnostic.responses.length + 1) / 10) * 100)} syncStatus={syncStatus} recoveryCode={recoveryCode} stateUpdatedAt={state.updatedAt} lastLocalSaveAt={lastLocalSaveAt} onExit={onExit} /><p className="eyebrow">{item.id} · {item.title}</p><p className="support">{role}</p><p className="support">{instructions}</p><h2>{item.prompt}</h2><label className="diagnostic-input">{t.actionDirection}<textarea value={answer} onChange={(event) => setAnswer(event.target.value)} /></label><label className="diagnostic-input">{t.oneSentenceReason}<textarea value={reasoning} onChange={(event) => setReasoning(event.target.value)} /></label><label className="confidence">{t.confidence} <b>{locale === "ru" ? "примерно" : "roughly"} {confidence}%</b><input type="range" min="0" max="100" step="5" value={confidence} onChange={(event) => setConfidence(Number(event.target.value))} /></label><p className="support">{confidenceHelp(locale)}</p>{missingDiagnosticParts.length > 0 && <p className="support">{locale === "ru" ? `Чтобы сохранить ответ, укажи ${missingDiagnosticParts.join(" и ")}.` : `To save this response, enter ${missingDiagnosticParts.join(" and ")}.`}</p>}<button className="primary" disabled={missingDiagnosticParts.length > 0} onClick={submit}>{t.recordResponse} <span>→</span></button></section>;
}
