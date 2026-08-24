"use client";

import { practicalSkillById } from "../content/practical-mastery";
import {
  routeRealHandToRepairs,
  type RealHandRepairSignals,
} from "../lib/practical-integrated-session";
import type { PracticalFieldBindingInput } from "../lib/practical-field-transfer";
import type { LocaleCode } from "../lib/model";

type Props = {
  locale: LocaleCode;
  value: PracticalFieldBindingInput;
  onChange: (value: PracticalFieldBindingInput) => void;
};

const BOOLEAN_SIGNALS: Array<{
  key: keyof RealHandRepairSignals;
  ru: string;
  en: string;
}> = [
  { key: "blindIssue", ru: "Цена колла / завершает ли колл круг торговли", en: "Blind price / closing action" },
  { key: "openSizeIssue", ru: "Размер открытия меняет защиту", en: "Open-size sensitivity" },
  { key: "boardOwnershipIssue", ru: "Владение бордом / диапазоны на этой улице", en: "Board / arriving-range ownership" },
  { key: "automaticCbetIssue", ru: "Автоматический c-bet", en: "Automatic c-bet" },
  { key: "probeIssue", ru: "Пробная ставка тёрна / происхождение линии", en: "Turn probe / ancestry" },
  { key: "bluffCatchIssue", ru: "Блаф-кэтч / цена и доступные блефы", en: "Bluff-catch / price and bluff supply" },
  { key: "multiwayThresholdIssue", ru: "Порог вэлью в мультивее", en: "Multiway value threshold" },
  { key: "straddleGeometryIssue", ru: "Страддл меняет геометрию", en: "Straddle changes geometry" },
  { key: "evidenceGeneralizationIssue", ru: "Обобщение рида за пределы подтверждённых данных", en: "Evidence over-generalization" },
];

function copy(locale: LocaleCode) {
  return locale === "ru" ? {
    title: "Причина ошибки / разбора",
    help: "Отметь только то, что явно установлено разбором с человеком. Текст руки, результат и шоудаун сами по себе не определяют причину.",
    street: "Улица",
    potType: "Тип банка",
    role: "Роль",
    none: "не указано",
    candidates: "Подходящие темы",
    selectSkill: "Выбери тему, которую подтвердил разбор",
    noCandidate: "Пока разбор не определил подходящую тему для тренировки.",
    exact: "Тема для тренировки",
    multiple: "Подходят несколько тем — выбери ту, которую подтвердил разбор.",
    fallbackSkill: "Тема тренировки",
  } : {
    title: "Reason identified in the review",
    help: "Select only what the human review explicitly established. Hand text, result, and showdown do not identify the reason on their own.",
    street: "Street",
    potType: "Pot type",
    role: "Role",
    none: "not specified",
    candidates: "Relevant topics",
    selectSkill: "Select the topic established by the review",
    noCandidate: "The review has not established a practice topic yet.",
    exact: "Practice topic",
    multiple: "Several topics fit — select the one established by the review.",
    fallbackSkill: "Practice topic",
  };
}

export default function RealHandCanonicalReview({ locale, value, onChange }: Props) {
  const c = copy(locale);
  const signals = value.signals ?? {};
  const candidates = routeRealHandToRepairs(signals);
  const selectedStillValid = Boolean(value.practicalSkillId && candidates.some((candidate) => candidate.skillId === value.practicalSkillId));
  const learnerSkillTitle = (skillId: string) => {
    const skill = practicalSkillById.get(skillId);
    return skill ? (locale === "ru" ? skill.titleRu : skill.titleEn) : c.fallbackSkill;
  };

  const replaceSignals = (nextSignals: RealHandRepairSignals) => {
    const nextCandidates = routeRealHandToRepairs(nextSignals);
    const selected = value.practicalSkillId && nextCandidates.some((candidate) => candidate.skillId === value.practicalSkillId)
      ? value.practicalSkillId
      : undefined;
    onChange({ signals: nextSignals, practicalSkillId: selected });
  };

  const patchEnum = (key: "street" | "potType" | "role", raw: string) => {
    const next = { ...signals } as Record<string, unknown>;
    if (raw) next[key] = raw;
    else delete next[key];
    replaceSignals(next as RealHandRepairSignals);
  };

  const patchBoolean = (key: keyof RealHandRepairSignals, checked: boolean) => {
    const next = { ...signals } as Record<string, unknown>;
    if (checked) next[key] = true;
    else delete next[key];
    replaceSignals(next as RealHandRepairSignals);
  };

  return <fieldset className="answer-panel" data-testid="real-hand-canonical-binding">
    <legend><b>{c.title}</b></legend>
    <p className="support">{c.help}</p>
    <div className="field-layout">
      <label>{c.street}
        <select data-testid="real-hand-signal-street" value={signals.street ?? ""} onChange={(event) => patchEnum("street", event.target.value)}>
          <option value="">{c.none}</option><option value="preflop">preflop</option><option value="flop">flop</option><option value="turn">turn</option><option value="river">river</option>
        </select>
      </label>
      <label>{c.potType}
        <select data-testid="real-hand-signal-potType" value={signals.potType ?? ""} onChange={(event) => patchEnum("potType", event.target.value)}>
          <option value="">{c.none}</option><option value="srp">SRP</option><option value="3bp">3BP</option><option value="4bp">4BP</option><option value="multiway">multiway</option>
        </select>
      </label>
      <label>{c.role}
        <select data-testid="real-hand-signal-role" value={signals.role ?? ""} onChange={(event) => patchEnum("role", event.target.value)}>
          <option value="">{c.none}</option><option value="aggressor_ip">aggressor IP</option><option value="aggressor_oop">aggressor OOP</option><option value="caller_ip">caller IP</option><option value="caller_oop">caller OOP</option>
        </select>
      </label>
    </div>
    <div className="answer-set">
      {BOOLEAN_SIGNALS.map((signal) => <label key={signal.key} style={{ display: "block", marginTop: 8 }}>
        <input
          data-testid={`real-hand-signal-${signal.key}`}
          type="checkbox"
          checked={signals[signal.key] === true}
          onChange={(event) => patchBoolean(signal.key, event.target.checked)}
        /> {locale === "ru" ? signal.ru : signal.en}
      </label>)}
    </div>
    {candidates.length === 0 ? <p className="counterexample">{c.noCandidate}</p> : <>
      <p className="support"><b>{c.candidates}:</b> {candidates.map((candidate) => learnerSkillTitle(candidate.skillId)).join(", ")}</p>
      {candidates.length === 1 ? <p className="assumption-strip"><b>{c.exact}:</b> {learnerSkillTitle(candidates[0].skillId)}</p> : <>
        <p className="counterexample">{c.multiple}</p>
        <label>{c.selectSkill}
          <select
            data-testid="real-hand-practical-skill"
            value={selectedStillValid ? value.practicalSkillId : ""}
            onChange={(event) => onChange({ signals, practicalSkillId: event.target.value || undefined })}
          >
            <option value="">{c.none}</option>
            {candidates.map((candidate) => <option key={candidate.skillId} value={candidate.skillId}>{learnerSkillTitle(candidate.skillId)}</option>)}
          </select>
        </label>
      </>}
    </>}
  </fieldset>;
}